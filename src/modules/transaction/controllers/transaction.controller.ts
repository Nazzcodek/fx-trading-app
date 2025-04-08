import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TransactionService } from '../services/transaction.service';
import {
  TransactionStatus,
  TransactionType,
} from '../entities/transaction.entity';
import { User } from '../../user/entities/user.entity';
import { GetUser } from '../../../common/decorators/get-user.decorator';

@ApiTags('transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user transactions' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transactions retrieved successfully',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: TransactionType })
  @ApiQuery({ name: 'status', required: false, enum: TransactionStatus })
  async getUserTransactions(
    @GetUser() user: User,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: TransactionType,
    @Query('status') status?: TransactionStatus,
  ) {
    return this.transactionService.getUserTransactions(
      user.id,
      page || 1,
      limit || 10,
      type,
      status,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transaction retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Transaction not found',
  })
  async getTransactionById(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ) {
    const transaction = await this.transactionService.getTransactionById(id);

    // Ensure user only accesses their own transactions
    if (transaction.userId !== user.id) {
      throw new Error('Unauthorized');
    }

    return transaction;
  }
}
