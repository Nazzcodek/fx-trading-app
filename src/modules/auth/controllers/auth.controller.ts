import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { LoginDto } from '../dto/login.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered successfully',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User already exists',
  })
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify user email with OTP' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Email verified successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid verification code',
  })
  @ApiBody({ type: VerifyEmailDto })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User logged in successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend verification code to email' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Verification code sent',
  })
  @ApiBody({ schema: { properties: { email: { type: 'string' } } } })
  async resendVerificationCode(@Body('email') email: string) {
    return this.authService.resendVerificationCode(email);
  }
}
