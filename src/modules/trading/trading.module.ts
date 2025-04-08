import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TradingController } from './controllers/trade.controller';
import { TradingService } from './services/trade.service';
import { Trade } from './entities/trade.entity';
import { WalletModule } from '../wallet/wallet.module';
import { FxModule } from '../fx/fx.module';

@Module({
  imports: [TypeOrmModule.forFeature([Trade]), WalletModule, FxModule],
  controllers: [TradingController],
  providers: [TradingService],
  exports: [TradingService],
})
export class TradingModule {}
