// src/modules/wallet/wallet.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletController } from './controllers/wallet.controller';
import { WalletService } from './services/wallet.service';
import { WalletBalance } from './entities/wallet-balance.entity';
import { Currency } from '../fx/entities/currency.entity';
import { TransactionModule } from '../transaction/transaction.module';
import { FxModule } from '../fx/fx.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WalletBalance, Currency]),
    TransactionModule,
    FxModule,
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
