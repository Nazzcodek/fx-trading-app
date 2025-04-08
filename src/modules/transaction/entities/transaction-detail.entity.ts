import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Transaction } from './transaction.entity';
import { WalletBalance } from '../../wallet/entities/wallet-balance.entity';

@Entity('transaction_details')
export class TransactionDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'transaction_id' })
  transaction_id: string;

  @Column()
  wallet_balance_id: string;

  @Column({ length: 3 })
  currency_code: string;

  @Column('decimal', { precision: 20, scale: 6 })
  amount: number;

  @Column()
  is_debit: boolean;

  @Column('decimal', { precision: 20, scale: 6, nullable: true })
  exchange_rate: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reference_id: string | null;

  // Fix this: Remove the default value from the entity definition
  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => Transaction, (transaction) => transaction.details, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;

  @ManyToOne(
    () => WalletBalance,
    (walletBalance) => walletBalance.transaction_details,
  )
  @JoinColumn({ name: 'wallet_balance_id' })
  wallet_balance: WalletBalance;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
