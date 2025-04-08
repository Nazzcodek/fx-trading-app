import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { TransactionDetail } from './transaction-detail.entity';

export enum TransactionType {
  FUNDING = 'FUNDING',
  CONVERSION = 'CONVERSION',
  TRANSFER = 'TRANSFER',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REVERSED = 'REVERSED',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @OneToMany(() => TransactionDetail, (detail) => detail.transaction)
  details: TransactionDetail[];

  @Column('decimal', { precision: 20, scale: 6 })
  amount: number;

  @Column()
  currency: string;

  @Column('decimal', { precision: 20, scale: 6, nullable: true })
  targetAmount?: number;

  @Column({ nullable: true })
  targetCurrency?: string;

  @Column('decimal', { precision: 20, scale: 10, nullable: true })
  exchangeRate?: number;

  @Column({ nullable: true })
  reference: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  constructor(partial: Partial<Transaction>) {
    Object.assign(this, partial);
  }
}
