import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { ExchangeRate } from '../entities/exchange-rate.entity';
import { IFxProvider } from '../interfaces/fx-provider.interface';
import { ConversionRequestDto } from '../dto/conversion-request.dto';
import { Cache } from 'cache-manager';

@Injectable()
export class FxService {
  private readonly logger = new Logger(FxService.name);
  private readonly TTL_SECONDS = 600; // Cache for 10 minutes

  constructor(
    @Inject('IFxProvider')
    private readonly fxProvider: IFxProvider,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async getExchangeRate(
    baseCurrency: string,
    targetCurrency: string,
  ): Promise<ExchangeRate> {
    const cacheKey = `rate:${baseCurrency}:${targetCurrency}`;

    // Try to get from cache first
    const cachedRate = await this.cacheManager.get<ExchangeRate>(cacheKey);
    if (cachedRate) {
      return cachedRate;
    }

    try {
      // Fetch fresh rate if not in cache
      const rate = await this.fxProvider.getRate(baseCurrency, targetCurrency);

      // Store in cache
      await this.cacheManager.set(cacheKey, rate, this.TTL_SECONDS * 1000);

      return rate;
    } catch (error) {
      this.logger.error(
        `Failed to fetch exchange rate: ${error.message}`,
        error.stack,
      );
      throw new NotFoundException(
        `Exchange rate not available for ${baseCurrency} to ${targetCurrency}`,
      );
    }
  }

  async convert(conversionRequest: ConversionRequestDto): Promise<number> {
    const { fromCurrency, toCurrency, amount } = conversionRequest;

    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    const rate = await this.getExchangeRate(fromCurrency, toCurrency);
    return rate.convert(amount);
  }

  async getSupportedCurrencies(): Promise<string[]> {
    const cacheKey = 'supportedCurrencies';

    // Try to get from cache first
    const cachedCurrencies = await this.cacheManager.get<string[]>(cacheKey);
    if (cachedCurrencies) {
      return cachedCurrencies;
    }

    try {
      // Fetch fresh list if not in cache
      const currencies = await this.fxProvider.getSupportedCurrencies();

      // Store in cache
      await this.cacheManager.set(
        cacheKey,
        currencies,
        this.TTL_SECONDS * 1000,
      );

      return currencies;
    } catch (error) {
      this.logger.error(
        `Failed to fetch supported currencies: ${error.message}`,
        error.stack,
      );
      throw new Error('Failed to fetch supported currencies');
    }
  }
}
