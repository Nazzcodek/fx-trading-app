import { ApiProperty } from '@nestjs/swagger';

export class ConversionRequestDto {
  @ApiProperty({
    description: 'Source currency code (ISO 4217)',
    example: 'USD',
    minLength: 3,
    maxLength: 3,
  })
  readonly fromCurrency: string;

  @ApiProperty({
    description: 'Target currency code (ISO 4217)',
    example: 'EUR',
    minLength: 3,
    maxLength: 3,
  })
  readonly toCurrency: string;

  @ApiProperty({
    description: 'Amount to convert in the source currency',
    example: 100.5,
    minimum: 0.01,
  })
  readonly amount: number;
}
