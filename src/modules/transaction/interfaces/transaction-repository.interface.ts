import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from '../entities/transaction.entity';

export interface ITransactionRepository {
  findById(id: string): Promise<Transaction | null>;
  findByReference(reference: string): Promise<Transaction | null>;
  findByUserId(
    userId: string,
    options?: {
      page?: number;
      limit?: number;
      type?: TransactionType;
      status?: TransactionStatus;
    },
  ): Promise<[Transaction[], number]>;
  create(transaction: Partial<Transaction>): Promise<Transaction>;
  update(id: string, data: Partial<Transaction>): Promise<Transaction>;
  updateStatus(id: string, status: TransactionStatus): Promise<Transaction>;
}
