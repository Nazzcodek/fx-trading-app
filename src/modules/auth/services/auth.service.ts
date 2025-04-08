import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { RegisterDto } from '../dto/register.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { LoginDto } from '../dto/login.dto';
import { MailService } from './mail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { email, password } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Generate verification code
    const verificationCode = this.generateVerificationCode();
    const verificationExpiresAt = new Date();
    verificationExpiresAt.setHours(verificationExpiresAt.getHours() + 24);

    // Create new user
    const user = this.userRepository.create({
      email,
      password,
      verification_code: verificationCode,
      verification_expires_at: verificationExpiresAt,
    });

    await this.userRepository.save(user);

    // Send verification email
    try {
      await this.mailService.sendVerificationEmail(email, verificationCode);
    } catch (error) {
      this.logger.error(`Failed to send verification email: ${error.message}`);
      // We still return success to user but log the error
    }

    return {
      message:
        'Registration successful. Please check your email for verification code.',
    };
  }

  async verifyEmail(
    verifyEmailDto: VerifyEmailDto,
  ): Promise<{ message: string }> {
    const { email, code } = verifyEmailDto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.is_verified) {
      return { message: 'Email already verified' };
    }

    if (user.verification_code !== code) {
      throw new BadRequestException('Invalid verification code');
    }

    if (
      !user.verification_expires_at ||
      user.verification_expires_at < new Date()
    ) {
      throw new BadRequestException('Verification code expired');
    }

    // Update user verification status
    user.is_verified = true;
    user.verification_code = null;
    user.verification_expires_at = null;
    await this.userRepository.save(user);

    return { message: 'Email verification successful' };
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ access_token: string; user: Partial<User> }> {
    const { email, password } = loginDto;

    console.log(`Attempting login for: ${email}`);

    const user = await this.userRepository.findOne({
      where: { email },
    });

    console.log(`User found: ${!!user}`);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log(`Is user verified: ${user.is_verified}`);

    if (!user.is_verified) {
      throw new UnauthorizedException('Please verify your email first');
    }

    console.log(`Validating password...`);
    const isPasswordValid = await user.validatePassword(password);
    console.log(`Password valid: ${isPasswordValid}`);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    const {
      password: _,
      verification_code: __,
      verification_expires_at: ___,
      ...userResponse
    } = user;

    return {
      access_token: token,
      user: userResponse,
    };
  }

  async resendVerificationCode(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.is_verified) {
      return { message: 'Email already verified' };
    }

    // Generate new verification code
    const verificationCode = this.generateVerificationCode();
    const verificationExpiresAt = new Date();
    verificationExpiresAt.setHours(verificationExpiresAt.getHours() + 24);

    // Update user verification code
    user.verification_code = verificationCode;
    user.verification_expires_at = verificationExpiresAt;
    await this.userRepository.save(user);

    // Send verification email
    try {
      await this.mailService.sendVerificationEmail(email, verificationCode);
    } catch (error) {
      this.logger.error(`Failed to send verification email: ${error.message}`);
      // We still return success to user but log the error
    }

    return { message: 'Verification code sent. Please check your email.' };
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
