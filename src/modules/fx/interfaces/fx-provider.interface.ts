import { ExchangeRate } from '../entities/exchange-rate.entity';

export interface IFxProvider {
  getRate(
    base_currency: string,
    target_currency: string,
  ): Promise<ExchangeRate>;
  getSupportedCurrencies(): Promise<string[]>;
}
