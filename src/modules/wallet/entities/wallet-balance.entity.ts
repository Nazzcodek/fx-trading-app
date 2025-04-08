import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Currency } from '../../fx/entities/currency.entity';
import { TransactionDetail } from '../../transaction/entities/transaction-detail.entity';

@Entity('wallet_balances')
@Unique(['user_id', 'currency_code'])
export class WalletBalance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  user_id: string;

  @Column({ name: 'currency_code' })
  currency_code: string;

  @Column('decimal', { precision: 20, scale: 6, default: 0 })
  balance: number;

  @ManyToOne(() => User, (user) => user.wallet_balances)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Currency, (currency) => currency.wallet_balances)
  @JoinColumn({ name: 'currency_code' })
  currency: Currency;

  @OneToMany(
    () => TransactionDetail,
    (transactionDetail) => transactionDetail.wallet_balance,
  )
  transaction_details: TransactionDetail[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
