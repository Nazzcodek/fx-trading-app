import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../entities/transaction.entity';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  Min,
  MinLength,
  MaxLength,
  IsOptional,
  ValidateNested,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TransactionDetailDto {
  @ApiProperty({
    description:
      'The unique identifier of the wallet balance involved in the transaction',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  wallet_balance_id: string;

  @ApiProperty({
    description: 'Currency code for the transaction (ISO 4217)',
    example: 'USD',
    minLength: 3,
    maxLength: 3,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency_code: string;

  @ApiProperty({
    description: 'Amount of the transaction in the specified currency',
    example: 250.75,
    minimum: 0.000001,
  })
  @IsNumber()
  @Min(0.000001)
  amount: number;

  @ApiProperty({
    description: 'Indicates whether this is a debit (outgoing) transaction',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  is_debit: boolean;

  @ApiProperty({
    description: 'Exchange rate applied for currency conversions',
    example: 0.82436,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  exchange_rate?: number;

  @ApiProperty({
    description: 'External reference identifier for the transaction',
    example: 'PAY-1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  reference_id?: string;

  @ApiProperty({
    description: 'Additional metadata for the transaction detail',
    example: { description: 'Forex conversion fee' },
    required: false,
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  readonly userId: string;

  @ApiProperty({
    description: 'Type of transaction',
    enum: TransactionType,
    example: 'DEPOSIT',
  })
  @IsEnum(TransactionType)
  readonly type: TransactionType;

  @ApiProperty({
    description: 'Transaction details',
    type: [TransactionDetailDto],
  })
  @ValidateNested({ each: true })
  @Type(() => TransactionDetailDto)
  readonly details: TransactionDetailDto[];

  @ApiProperty({
    description: 'Amount of the transaction in the source currency',
    example: 100.5,
    minimum: 0.01,
    required: false,
  })
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  readonly amount?: number;

  @ApiProperty({
    description: 'Currency code for the transaction amount (ISO 4217)',
    example: 'USD',
    minLength: 3,
    maxLength: 3,
    required: false,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  @IsOptional()
  readonly currency?: string;

  @ApiProperty({
    description: 'Amount in the target currency (for currency exchanges)',
    example: 90.45,
    minimum: 0,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  readonly targetAmount?: number;

  @ApiProperty({
    description: 'Target currency code (ISO 4217) for currency exchanges',
    example: 'EUR',
    minLength: 3,
    maxLength: 3,
    required: false,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  @IsOptional()
  readonly targetCurrency?: string;

  @ApiProperty({
    description: 'Exchange rate applied for currency conversions',
    example: 0.9045,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  readonly exchangeRate?: number;

  @ApiProperty({
    description: 'Unique reference code for the transaction',
    example: 'TRX12345678',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly reference?: string;

  @ApiProperty({
    description: 'Additional metadata related to the transaction',
    example: { paymentMethod: 'card', cardLastFour: '4242' },
    required: false,
  })
  @IsObject()
  @IsOptional()
  readonly metadata?: Record<string, any>;
}
