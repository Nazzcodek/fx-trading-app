import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { FxService } from '../services/fx.service';
import { ConversionRequestDto } from '../dto/conversion-request.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('fx')
@Controller('fx')
export class FxController {
  constructor(private readonly fxService: FxService) {}

  @Get('rates/:baseCurrency/:targetCurrency')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get exchange rate between two currencies' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Exchange rate retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Exchange rate not found',
  })
  async getExchangeRate(
    @Param('baseCurrency') baseCurrency: string,
    @Param('targetCurrency') targetCurrency: string,
  ) {
    return this.fxService.getExchangeRate(baseCurrency, targetCurrency);
  }

  @Post('convert')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Convert amount from one currency to another' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Currency converted successfully',
  })
  async convert(@Body() conversionRequest: ConversionRequestDto) {
    const convertedAmount = await this.fxService.convert(conversionRequest);
    return {
      fromCurrency: conversionRequest.fromCurrency,
      toCurrency: conversionRequest.toCurrency,
      originalAmount: conversionRequest.amount,
      convertedAmount,
    };
  }

  @Get('currencies')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get list of supported currencies' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Supported currencies retrieved successfully',
  })
  async getSupportedCurrencies() {
    const currencies = await this.fxService.getSupportedCurrencies();
    return { currencies };
  }
}
