import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { WalletBalance } from '../entities/wallet-balance.entity';
import { Currency } from '../../fx/entities/currency.entity';
import { FundWalletDto } from '../dto/fund-wallet.dto';
import { ConvertCurrencyDto } from '../dto/convert-currency.dto';
import { TransactionService } from '../../transaction/services/transaction.service';
import { FxService } from '../../fx/services/fx.service';
import { TransactionType } from '../../transaction/entities/transaction.entity';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    @InjectRepository(WalletBalance)
    private readonly walletBalanceRepository: Repository<WalletBalance>,
    @InjectRepository(Currency)
    private readonly currencyRepository: Repository<Currency>,
    private readonly transactionService: TransactionService,
    private readonly fxService: FxService,
    private readonly dataSource: DataSource,
  ) {}

  async getWalletBalances(userId: string): Promise<WalletBalance[]> {
    return this.walletBalanceRepository.find({
      where: { user_id: userId },
      relations: ['currency'],
    });
  }

  async getWalletBalance(
    userId: string,
    currencyCode: string,
  ): Promise<WalletBalance> {
    const walletBalance = await this.walletBalanceRepository.findOne({
      where: { user_id: userId, currency_code: currencyCode },
      relations: ['currency'],
    });

    if (!walletBalance) {
      // If wallet doesn't exist, check if currency exists
      const currency = await this.currencyRepository.findOne({
        where: { code: currencyCode },
      });

      if (!currency) {
        throw new NotFoundException(`Currency ${currencyCode} not found`);
      }

      // Create a new wallet with zero balance
      const newWalletBalance = this.walletBalanceRepository.create({
        user_id: userId,
        currency_code: currencyCode,
        balance: 0,
      });

      await this.walletBalanceRepository.save(newWalletBalance);

      const createdWallet = await this.walletBalanceRepository.findOne({
        where: { id: newWalletBalance.id },
        relations: ['currency'],
      });

      if (!createdWallet) {
        throw new InternalServerErrorException(
          'Failed to create wallet balance',
        );
      }

      return createdWallet;
    }

    return walletBalance;
  }

  async fundWallet(
    userId: string,
    fundWalletDto: FundWalletDto,
  ): Promise<WalletBalance> {
    const { amount, currency_code, reference_id } = fundWalletDto;

    // Check if currency exists
    const currency = await this.currencyRepository.findOne({
      where: { code: currency_code },
    });

    if (!currency) {
      throw new NotFoundException(`Currency ${currency_code} not found`);
    }

    // Use transaction to ensure data consistency
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get or create wallet balance
      let walletBalance = await this.walletBalanceRepository.findOne({
        where: { user_id: userId, currency_code },
      });

      if (!walletBalance) {
        walletBalance = this.walletBalanceRepository.create({
          user_id: userId,
          currency_code,
          balance: 0,
        });
      }

      // Update balance
      walletBalance.balance = Number(walletBalance.balance) + Number(amount);

      // Save the updated wallet balance
      await queryRunner.manager.save(walletBalance);

      // Create transaction record - FIXED method call
      await this.transactionService.createTransaction(
        {
          userId,
          type: TransactionType.FUNDING,
          amount, // Added missing field
          currency: currency_code, // Added missing field
          details: [
            {
              wallet_balance_id: walletBalance.id,
              currency_code,
              amount,
              is_debit: false,
              reference_id,
            },
          ],
        },
        queryRunner.manager, // Pass manager as second parameter
      );

      await queryRunner.commitTransaction();

      const updatedWallet = await this.walletBalanceRepository.findOne({
        where: { id: walletBalance.id },
        relations: ['currency'],
      });

      if (!updatedWallet) {
        throw new InternalServerErrorException(
          'Failed to retrieve updated wallet',
        );
      }

      return updatedWallet;
    } catch (error) {
      this.logger.error(`Failed to fund wallet: ${error.message}`, error.stack);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed to fund wallet');
    } finally {
      await queryRunner.release();
    }
  }

  async convertCurrency(
    userId: string,
    convertCurrencyDto: ConvertCurrencyDto,
  ): Promise<{
    fromWallet: WalletBalance;
    toWallet: WalletBalance;
    conversionRate: number;
    convertedAmount: number;
  }> {
    const { amount, from_currency, to_currency } = convertCurrencyDto;

    if (from_currency === to_currency) {
      throw new BadRequestException(
        'Cannot convert between the same currencies',
      );
    }

    // Get current exchange rate
    const exchangeRateData = await this.fxService.getExchangeRate(
      from_currency,
      to_currency,
    );

    // Extract the numeric rate value
    const exchangeRate = exchangeRateData.rate;

    // Calculate converted amount
    const convertedAmount = amount * exchangeRate;

    // Use transaction to ensure data consistency
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get source wallet
      const fromWallet = await this.walletBalanceRepository.findOne({
        where: { user_id: userId, currency_code: from_currency },
      });

      if (!fromWallet) {
        throw new NotFoundException(`Wallet for ${from_currency} not found`);
      }

      if (Number(fromWallet.balance) < amount) {
        throw new BadRequestException(
          `Insufficient ${from_currency} balance. Available: ${fromWallet.balance}, Required: ${amount}`,
        );
      }

      // Get or create target wallet
      let toWallet = await this.walletBalanceRepository.findOne({
        where: { user_id: userId, currency_code: to_currency },
      });

      if (!toWallet) {
        // Check if currency exists
        const currency = await this.currencyRepository.findOne({
          where: { code: to_currency },
        });

        if (!currency) {
          throw new NotFoundException(`Currency ${to_currency} not found`);
        }

        toWallet = this.walletBalanceRepository.create({
          user_id: userId,
          currency_code: to_currency,
          balance: 0,
        });
      }

      // Update balances
      fromWallet.balance = Number(fromWallet.balance) - Number(amount);
      toWallet.balance = Number(toWallet.balance) + Number(convertedAmount);

      // Save the updated wallet balances
      await queryRunner.manager.save(fromWallet);
      await queryRunner.manager.save(toWallet);

      // Create transaction record - FIXED method call
      await this.transactionService.createTransaction(
        {
          userId,
          type: TransactionType.CONVERSION,
          amount, // Source amount
          currency: from_currency, // Source currency
          targetAmount: convertedAmount, // Target amount
          targetCurrency: to_currency, // Target currency
          exchangeRate, // Exchange rate
          details: [
            {
              wallet_balance_id: fromWallet.id,
              currency_code: from_currency,
              amount,
              is_debit: true,
              exchange_rate: exchangeRate,
            },
            {
              wallet_balance_id: toWallet.id,
              currency_code: to_currency,
              amount: convertedAmount,
              is_debit: false,
              exchange_rate: exchangeRate,
            },
          ],
        },
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();

      // Check and retrieve updated wallets
      const updatedFromWallet = await this.walletBalanceRepository.findOne({
        where: { id: fromWallet.id },
        relations: ['currency'],
      });

      if (!updatedFromWallet) {
        throw new InternalServerErrorException(
          'Failed to retrieve source wallet',
        );
      }

      const updatedToWallet = await this.walletBalanceRepository.findOne({
        where: { id: toWallet.id },
        relations: ['currency'],
      });

      if (!updatedToWallet) {
        throw new InternalServerErrorException(
          'Failed to retrieve target wallet',
        );
      }

      // Return the updated wallets
      return {
        fromWallet: updatedFromWallet,
        toWallet: updatedToWallet,
        conversionRate: exchangeRate,
        convertedAmount,
      };
    } catch (error) {
      this.logger.error(
        `Failed to convert currency: ${error.message}`,
        error.stack,
      );
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
