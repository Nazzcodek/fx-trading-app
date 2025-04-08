import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { IFxProvider } from '../interfaces/fx-provider.interface';
import { ExchangeRate } from '../entities/exchange-rate.entity';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class ExchangeRateApiProvider implements IFxProvider {
  private readonly logger = new Logger(ExchangeRateApiProvider.name);
  private readonly API_BASE_URL = 'https://api.exchangerate-api.com/v4/latest/';
  private readonly API_KEY = process.env.EXCHANGE_RATE_API_KEY;

  constructor(private readonly httpService: HttpService) {}

  async getRate(
    base_currency: string,
    target_currency: string,
  ): Promise<ExchangeRate> {
    try {
      const url = `${this.API_BASE_URL}${base_currency.toUpperCase()}?api_key=${this.API_KEY}`;

      const { data } = await firstValueFrom(
        this.httpService.get(url).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(
              `ExchangeRate API error: ${error.message}`,
              error.stack,
            );
            throw new Error(`Failed to fetch exchange rate: ${error.message}`);
          }),
        ),
      );

      const targetRate = data.rates[target_currency.toUpperCase()];

      if (!targetRate) {
        throw new Error(
          `Rate not found for currency pair: ${base_currency}/${target_currency}`,
        );
      }

      return ExchangeRate.create(
        base_currency,
        target_currency,
        targetRate,
        'exchange-rate-api',
      );
    } catch (error) {
      this.logger.error(
        `Failed to get exchange rate: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getSupportedCurrencies(): Promise<string[]> {
    try {
      // Most exchange rate APIs provide this info in their documentation
      // or via an endpoint - simplified here for clarity
      const url = `${this.API_BASE_URL}USD?api_key=${this.API_KEY}`;

      const { data } = await firstValueFrom(
        this.httpService.get(url).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(
              `ExchangeRate API error: ${error.message}`,
              error.stack,
            );
            throw new Error(
              `Failed to fetch supported currencies: ${error.message}`,
            );
          }),
        ),
      );

      return Object.keys(data.rates);
    } catch (error) {
      this.logger.error(
        `Failed to get supported currencies: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
