import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum TradeStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('trades')
@Index(['user_id'])
export class Trade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  user_id: string;

  @Column({ name: 'from_currency', length: 3 })
  fromCurrency: string;

  @Column({ name: 'to_currency', length: 3 })
  toCurrency: string;

  @Column({ type: 'decimal', precision: 20, scale: 6 })
  fromAmount: number;

  @Column({ type: 'decimal', precision: 20, scale: 6 })
  toAmount: number;

  @Column({ type: 'decimal', precision: 20, scale: 10 })
  rate: number;

  @Column({
    type: 'enum',
    enum: TradeStatus,
    default: TradeStatus.PENDING,
  })
  status: TradeStatus;

  @Column({ type: 'text', nullable: true })
  failureReason: string;

  @Column({ type: 'uuid', name: 'transaction_id', nullable: true })
  transactionId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
