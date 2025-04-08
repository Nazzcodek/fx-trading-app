import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FxService } from './services/fx.service';
import { ExchangeRateApiProvider } from './providers/exchange-rate-api.provider';
import { FxController } from './controllers/fx.controller';
import { CurrencySyncService } from './services/currency-sync.service';
import { Currency } from '../fx/entities/currency.entity';

@Module({
  imports: [
    HttpModule,
    CacheModule.register({
      ttl: 600,
      max: 100,
    }),
    TypeOrmModule.forFeature([Currency]),
  ],
  providers: [
    FxService,
    CurrencySyncService,
    {
      provide: 'IFxProvider',
      useClass: ExchangeRateApiProvider,
    },
  ],
  controllers: [FxController],
  exports: [FxService],
})
export class FxModule {}
