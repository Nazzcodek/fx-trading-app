import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { WalletBalance } from '../../wallet/entities/wallet-balance.entity';
import { ExchangeRate } from './exchange-rate.entity';

@Entity('currencies')
export class Currency {
  @PrimaryColumn({ length: 3 })
  code: string;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 5 })
  symbol: string;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => WalletBalance, (walletBalance) => walletBalance.currency)
  wallet_balances: WalletBalance[];

  @OneToMany(() => ExchangeRate, (rate) => rate.baseCurrency)
  base_rates: ExchangeRate[];

  @OneToMany(() => ExchangeRate, (rate) => rate.targetCurrency)
  target_rates: ExchangeRate[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
