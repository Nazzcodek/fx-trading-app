import { IsNotEmpty, IsString, IsNumber, Min, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTradeDto {
  @ApiProperty({
    description: 'Amount to trade',
    example: 1000,
  })
  @IsNotEmpty({ message: 'Amount is required' })
  @IsNumber({}, { message: 'Amount must be a number' })
  @Min(0.000001, { message: 'Amount must be greater than 0' })
  amount: number;

  @ApiProperty({
    description: 'From-currency code',
    example: 'NGN',
  })
  @IsNotEmpty({ message: 'Source currency code is required' })
  @IsString()
  @Length(3, 3, { message: 'Source currency code must be 3 characters long' })
  from_currency: string;

  @ApiProperty({
    description: 'To-currency code',
    example: 'USD',
  })
  @IsNotEmpty({ message: 'Target currency code is required' })
  @IsString()
  @Length(3, 3, { message: 'Target currency code must be 3 characters long' })
  to_currency: string;
}
