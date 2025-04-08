import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConvertCurrencyDto {
  @ApiProperty({
    description: 'Amount to convert',
    example: 1000,
  })
  @IsNotEmpty({ message: 'Amount is required' })
  @IsNumber({}, { message: 'Amount must be a number' })
  @Min(1, { message: 'Amount must be greater than 0' })
  amount: number;

  @ApiProperty({
    description: 'Source currency code',
    example: 'NGN',
  })
  @IsNotEmpty({ message: 'Source currency code is required' })
  @IsString()
  from_currency: string;

  @ApiProperty({
    description: 'Target currency code',
    example: 'USD',
  })
  @IsNotEmpty({ message: 'Target currency code is required' })
  @IsString()
  to_currency: string;
}
