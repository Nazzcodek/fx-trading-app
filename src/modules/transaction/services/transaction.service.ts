import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from '../entities/transaction.entity';
import { TransactionDetail } from '../entities/transaction-detail.entity';
import {
  CreateTransactionDto,
  TransactionDetailDto,
} from '../dto/create-transaction.dto';
import { ITransactionRepository } from '../interfaces/transaction-repository.interface';
import { v4 as uuidv4 } from 'uuid';
import { EntityManager } from 'typeorm';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    @Inject('ITransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  // Maps DTO details to entity details
  private mapDetailsToEntity(
    details: TransactionDetailDto[],
  ): TransactionDetail[] {
    return details.map((detail) => {
      const transactionDetail = new TransactionDetail();
      transactionDetail.wallet_balance_id = detail.wallet_balance_id;
      transactionDetail.currency_code = detail.currency_code;
      transactionDetail.amount = detail.amount;
      transactionDetail.is_debit = detail.is_debit;
      transactionDetail.exchange_rate = detail.exchange_rate || null;
      transactionDetail.reference_id = detail.reference_id || null;
      transactionDetail.metadata = detail.metadata || {};

      return transactionDetail;
    });
  }

  async createTransaction(
    createTransactionDto: CreateTransactionDto,
    entityManager?: EntityManager,
  ): Promise<Transaction> {
    const { reference, details, userId, type } = createTransactionDto;

    // If reference is provided, check for duplicates to ensure idempotency
    if (reference) {
      const existingTransaction =
        await this.transactionRepository.findByReference(reference);
      if (existingTransaction) {
        throw new ConflictException(
          `Transaction with reference ${reference} already exists`,
        );
      }
    }

    // Calculate total amount and determine primary currency from first detail
    const primaryDetail = details[0];
    if (!primaryDetail) {
      throw new Error('At least one transaction detail is required');
    }

    const amount = createTransactionDto.amount || primaryDetail.amount;
    const currency =
      createTransactionDto.currency || primaryDetail.currency_code;

    // For conversion transactions, get the target details
    let targetAmount, targetCurrency, exchangeRate;
    if (type === TransactionType.CONVERSION && details.length > 1) {
      const targetDetail = details.find((d) => !d.is_debit);
      if (targetDetail) {
        targetAmount = createTransactionDto.targetAmount || targetDetail.amount;
        targetCurrency =
          createTransactionDto.targetCurrency || targetDetail.currency_code;
        exchangeRate =
          createTransactionDto.exchangeRate || targetDetail.exchange_rate;
      }
    }

    // Generate reference if not provided
    const transactionData: Partial<Transaction> = {
      userId,
      type,
      reference: reference || `TRX-${uuidv4()}`,
      status: TransactionStatus.PENDING,
      amount,
      currency,
      targetAmount,
      targetCurrency,
      exchangeRate,
      metadata: createTransactionDto.metadata || {},
      details: this.mapDetailsToEntity(details),
    };

    // Create transaction using the provided entity manager if available
    if (entityManager) {
      const transaction = entityManager.create(Transaction, transactionData);
      return entityManager.save(transaction);
    }

    return this.transactionRepository.create(transactionData);
  }

  async completeTransaction(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(id);

    if (!transaction) {
      throw new NotFoundException(`Transaction with id ${id} not found`);
    }

    if (transaction.status !== TransactionStatus.PENDING) {
      this.logger.warn(
        `Attempted to complete transaction ${id} with status ${transaction.status}`,
      );
      throw new ConflictException(
        `Transaction is already ${transaction.status}`,
      );
    }

    return this.transactionRepository.update(id, {
      status: TransactionStatus.COMPLETED,
      completedAt: new Date(),
    });
  }

  async failTransaction(id: string, reason?: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(id);

    if (!transaction) {
      throw new NotFoundException(`Transaction with id ${id} not found`);
    }

    if (transaction.status !== TransactionStatus.PENDING) {
      this.logger.warn(
        `Attempted to fail transaction ${id} with status ${transaction.status}`,
      );
      throw new ConflictException(
        `Transaction is already ${transaction.status}`,
      );
    }

    return this.transactionRepository.update(id, {
      status: TransactionStatus.FAILED,
      metadata: {
        ...transaction.metadata,
        failureReason: reason || 'Unknown error',
        failedAt: new Date(),
      },
    });
  }

  async getTransactionById(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(id);

    if (!transaction) {
      throw new NotFoundException(`Transaction with id ${id} not found`);
    }

    return transaction;
  }

  async getUserTransactions(
    userId: string,
    page = 1,
    limit = 10,
    type?: TransactionType,
    status?: TransactionStatus,
  ): Promise<{
    data: Transaction[];
    total: number;
    page: number;
    limit: number;
  }> {
    const [transactions, total] = await this.transactionRepository.findByUserId(
      userId,
      { page, limit, type, status },
    );

    return {
      data: transactions,
      total,
      page,
      limit,
    };
  }
}
