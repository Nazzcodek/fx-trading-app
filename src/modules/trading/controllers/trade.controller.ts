import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { TradingService } from '../services/trade.service';
import { CreateTradeDto } from '../dto/trade.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('trading')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('trading')
export class TradingController {
  constructor(private readonly tradingService: TradingService) {}

  @Get()
  @ApiOperation({ summary: 'Get all trades for the authenticated user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns all trades' })
  async getUserTrades(@Request() req) {
    return this.tradingService.getUserTrades(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific trade by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the requested trade',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Trade not found' })
  async getTrade(@Request() req, @Param('id') tradeId: string) {
    return this.tradingService.getTrade(req.user.id, tradeId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new trade' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Trade created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request or insufficient balance',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Currency not found',
  })
  async createTrade(@Request() req, @Body() createTradeDto: CreateTradeDto) {
    createTradeDto.from_currency = createTradeDto.from_currency.toUpperCase();
    createTradeDto.to_currency = createTradeDto.to_currency.toUpperCase();
    return this.tradingService.createTrade(req.user.id, createTradeDto);
  }
}
