import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from '../entities/transaction.entity';
import { ITransactionRepository } from '../interfaces/transaction-repository.interface';

@Injectable()
export class TransactionRepository implements ITransactionRepository {
  constructor(
    @InjectRepository(Transaction)
    private readonly repository: Repository<Transaction>,
  ) {}

  async findById(id: string): Promise<Transaction | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByReference(reference: string): Promise<Transaction | null> {
    return this.repository.findOne({ where: { reference } });
  }

  async findByUserId(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      type?: TransactionType;
      status?: TransactionStatus;
    } = {},
  ): Promise<[Transaction[], number]> {
    const { page = 1, limit = 10, type, status } = options;

    // Build where conditions
    const whereConditions: any = { userId };
    if (type) whereConditions.type = type;
    if (status) whereConditions.status = status;

    return this.repository.findAndCount({
      where: whereConditions,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async create(transaction: Partial<Transaction>): Promise<Transaction> {
    const newTransaction = this.repository.create(transaction);
    return this.repository.save(newTransaction);
  }

  async update(id: string, data: Partial<Transaction>): Promise<Transaction> {
    await this.repository.update(id, data);
    const updated = await this.findById(id);

    if (!updated) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return updated;
  }

  async updateStatus(
    id: string,
    status: TransactionStatus,
  ): Promise<Transaction> {
    await this.repository.update(id, {
      status,
      ...(status === TransactionStatus.COMPLETED
        ? { completedAt: new Date() }
        : {}),
    });

    const updated = await this.findById(id);

    if (!updated) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return updated;
  }
}
