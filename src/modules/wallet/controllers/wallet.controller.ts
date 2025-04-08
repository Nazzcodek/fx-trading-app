import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { WalletService } from '../services/wallet.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { FundWalletDto } from '../dto/fund-wallet.dto';
// import { ConvertCurrencyDto } from '../dto/convert-currency.dto';

@ApiTags('wallet')
@Controller('wallet')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all wallet balances for current authenticated user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Wallet balances retrieved successfully',
  })
  async getWalletBalances(@Request() req) {
    return this.walletService.getWalletBalances(req.user.id);
  }

  @Get(':currency')
  @ApiOperation({ summary: 'Get wallet balance for specific currency' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Wallet balance retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Currency not found',
  })
  async getWalletBalance(
    @Request() req,
    @Param('currency') currencyCode: string,
  ) {
    return this.walletService.getWalletBalance(req.user.id, currencyCode);
  }

  @Post('fund')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fund wallet with specified currency' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Wallet funded successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Currency not found',
  })
  @ApiBody({ type: FundWalletDto })
  async fundWallet(@Request() req, @Body() fundWalletDto: FundWalletDto) {
    return this.walletService.fundWallet(req.user.id, fundWalletDto);
  }

  // @Post('convert')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Convert currency using real-time FX rates' })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   description: 'Currency converted successfully',
  // })
  // @ApiResponse({
  //   status: HttpStatus.BAD_REQUEST,
  //   description: 'Invalid conversion parameters or insufficient funds',
  // })
  // @ApiBody({ type: ConvertCurrencyDto })
  // async convertCurrency(
  //   @Request() req,
  //   @Body() convertCurrencyDto: ConvertCurrencyDto,
  // ) {
  //   return this.walletService.convertCurrency(req.user.id, convertCurrencyDto);
  // }
}
