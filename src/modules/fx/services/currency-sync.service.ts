import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Currency } from '../entities/currency.entity';
import { FxService } from './fx.service';

@Injectable()
export class CurrencySyncService {
  private readonly logger = new Logger(CurrencySyncService.name);

  constructor(
    @InjectRepository(Currency)
    private readonly currencyRepository: Repository<Currency>,
    private readonly fxService: FxService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async syncCurrencies() {
    try {
      this.logger.log('Syncing currencies from FX provider...');

      // Get supported currencies from FX provider
      const supportedCurrencies = await this.fxService.getSupportedCurrencies();

      // For each supported currency, create or update
      for (const code of supportedCurrencies) {
        const existing = await this.currencyRepository.findOne({
          where: { code },
        });

        if (!existing) {
          // Create new currency record
          await this.currencyRepository.save({
            code,
            name: this.getCurrencyName(code),
            symbol: this.getCurrencySymbol(code),
            is_active: true,
          });
          this.logger.log(`Added new currency: ${code}`);
        }
      }

      this.logger.log('Currency sync completed successfully');
    } catch (error) {
      this.logger.error(
        `Failed to sync currencies: ${error.message}`,
        error.stack,
      );
    }
  }

  async onApplicationBootstrap() {
    // Check if currencies table is empty
    const count = await this.currencyRepository.count();

    if (count === 0) {
      this.logger.log('No currencies found, initializing with defaults...');

      await this.seedDefaultCurrencies();
      await this.syncCurrencies();
    }
  }

  // Seed basic default currencies
  private async seedDefaultCurrencies() {
    const defaultCurrencies = [
      { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
      { code: 'USD', name: 'US Dollar', symbol: '$' },
      { code: 'EUR', name: 'Euro', symbol: '€' },
      { code: 'GBP', name: 'British Pound', symbol: '£' },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    ];

    for (const currency of defaultCurrencies) {
      await this.currencyRepository.save({
        ...currency,
        is_active: true,
      });
      this.logger.log(`Added default currency: ${currency.code}`);
    }
  }

  // Helper methods for currency display info
  private getCurrencyName(code: string): string {
    const names = {
      NGN: 'Nigerian Naira',
      USD: 'US Dollar',
      EUR: 'Euro',
      GBP: 'British Pound',
      JPY: 'Japanese Yen',
      CAD: 'Canadian Dollar',
      AUD: 'Australian Dollar',
      CHF: 'Swiss Franc',
      CNY: 'Chinese Yuan',
    };

    return names[code] || `${code} Currency`;
  }

  private getCurrencySymbol(code: string): string {
    const symbols = {
      NGN: '₦',
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CAD: 'C$',
      AUD: 'A$',
      CHF: 'Fr',
      CNY: '¥',
    };

    return symbols[code] || code;
  }
}
