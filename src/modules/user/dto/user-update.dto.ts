import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class UpdateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description:
      'User password (min 8 chars with at least one number and one letter)',
    example: 'Password123',
  })
  @IsString()
  @IsOptional()
  @MinLength(8)
  password?: string;
}
