import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Currency } from './currency.entity';

@Entity('exchange_rates')
export class ExchangeRate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'base_currency_code' })
  baseCurrency: Currency;

  @Column({ length: 3 })
  base_currency_code: string;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'target_currency_code' })
  targetCurrency: Currency;

  @Column({ length: 3 })
  target_currency_code: string;

  @Column('decimal', { precision: 10, scale: 6 })
  rate: number;

  @CreateDateColumn()
  timestamp: Date;

  @Column()
  source: string;

  // Keep your existing methods
  static create(
    baseCurrency: string,
    targetCurrency: string,
    rate: number,
    source: string,
  ): ExchangeRate {
    if (rate <= 0) {
      throw new Error('Exchange rate must be positive');
    }

    const exchange = new ExchangeRate();
    exchange.base_currency_code = baseCurrency.toUpperCase();
    exchange.target_currency_code = targetCurrency.toUpperCase();
    exchange.rate = rate;
    exchange.source = source;
    return exchange;
  }

  convert(amount: number): number {
    if (amount < 0) {
      throw new Error('Amount must be non-negative');
    }
    return amount * this.rate;
  }
}
