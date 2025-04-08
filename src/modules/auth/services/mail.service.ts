import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: false, // For port 587, use false
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
      // Add these TLS settings
      requireTLS: true,
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false,
      },
    });
  }

  async sendVerificationEmail(to: string, code: string): Promise<void> {
    const subject = 'Email Verification - FX Trading App';
    const text = `Your verification code is: ${code}. It will expire in 24 hours.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to FX Trading App!</h2>
        <p>Thank you for registering. To complete your registration, please use the verification code below:</p>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
          ${code}
        </div>
        <p>This code will expire in 24 hours.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
        <p>Best regards,<br>FX Trading App Team</p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_FROM'),
        to,
        subject,
        text,
        html,
      });
      this.logger.log(`Verification email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email: ${error.message}`);
      throw error;
    }
  }
}
