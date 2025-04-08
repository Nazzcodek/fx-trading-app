import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Trade, TradeStatus } from '../entities/trade.entity';
import { WalletService } from '../../wallet/services/wallet.service';
import { FxService } from '../../fx/services/fx.service';
import { CreateTradeDto } from '../dto/trade.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TradingService {
  private readonly logger = new Logger(TradingService.name);

  constructor(
    @InjectRepository(Trade)
    private readonly tradeRepository: Repository<Trade>,
    private readonly walletService: WalletService,
    private readonly fxService: FxService,
    private readonly dataSource: DataSource,
  ) {}

  async getUserTrades(userId: string): Promise<Trade[]> {
    return this.tradeRepository.find({
      where: { user_id: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getTrade(userId: string, tradeId: string): Promise<Trade> {
    const trade = await this.tradeRepository.findOne({
      where: { id: tradeId, user_id: userId },
    });

    if (!trade) {
      throw new NotFoundException(`Trade with ID ${tradeId} not found`);
    }

    return trade;
  }

  async createTrade(
    userId: string,
    createTradeDto: CreateTradeDto,
  ): Promise<Trade> {
    const { amount, from_currency, to_currency } = createTradeDto;

    if (from_currency === to_currency) {
      throw new BadRequestException('Cannot trade between the same currencies');
    }

    // Get current exchange rate
    const exchangeRate = await this.fxService.getExchangeRate(
      from_currency,
      to_currency,
    );
    const convertedAmount = amount * exchangeRate.rate;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let savedTrade: Trade | null = null;

    try {
      // Create trade record with PENDING status
      const trade = this.tradeRepository.create({
        user: { id: userId },
        fromCurrency: from_currency,
        toCurrency: to_currency,
        fromAmount: amount,
        toAmount: convertedAmount,
        rate: exchangeRate.rate,
        status: TradeStatus.PENDING,
      });

      // Save the trade and store it in the variable we declared outside
      savedTrade = await this.tradeRepository.save(trade);

      // Process the actual currency conversion
      const conversionResult = await this.walletService.convertCurrency(
        userId,
        {
          from_currency,
          to_currency,
          amount,
        },
      );

      // Update trade record as COMPLETED
      savedTrade.status = TradeStatus.COMPLETED;
      savedTrade.transactionId = uuidv4();

      const completedTrade = await this.tradeRepository.save(savedTrade);

      await queryRunner.commitTransaction();

      return completedTrade;
    } catch (error) {
      this.logger.error(
        `Failed to process trade: ${error.message}`,
        error.stack,
      );
      await queryRunner.rollbackTransaction();

      // If the error occurred after trade creation, update trade status to FAILED
      if (error instanceof Error && savedTrade) {
        try {
          const failedTrade = await this.tradeRepository.findOne({
            where: { id: savedTrade.id }, // Use savedTrade instead of trade
          });

          if (failedTrade) {
            failedTrade.status = TradeStatus.FAILED;
            failedTrade.failureReason = error.message;
            await this.tradeRepository.save(failedTrade);
          }
        } catch (updateError) {
          // Log error but continue
        }
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
