import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionService } from './services/transaction.service';
import { TransactionRepository } from './repositories/transaction.repository';
import { TransactionController } from './controllers/transaction.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction])],
  providers: [
    TransactionService,
    {
      provide: 'ITransactionRepository',
      useClass: TransactionRepository,
    },
  ],
  controllers: [TransactionController],
  exports: [TransactionService],
})
export class TransactionModule {}
