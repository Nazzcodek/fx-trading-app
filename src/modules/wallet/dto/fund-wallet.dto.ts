import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FundWalletDto {
  @ApiProperty({
    description: 'Amount to fund',
    example: 1000,
  })
  @IsNotEmpty({ message: 'Amount is required' })
  @IsNumber({}, { message: 'Amount must be a number' })
  @Min(1, { message: 'Amount must be greater than 0' })
  amount: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'NGN',
  })
  @IsNotEmpty({ message: 'Currency code is required' })
  @IsString()
  currency_code: string;

  @ApiProperty({
    description: 'Reference ID for the transaction',
    example: 'TRX-123456',
    required: false,
  })
  @IsString()
  reference_id?: string;
}
