import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  // Debug logging
  console.log('Database config:', {
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    database: configService.get<string>('DB_DATABASE'),
  });

  return {
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'fxuser',
    password: 'fxpassword',
    database: 'fx_trading_app',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: configService.get<boolean>('DB_SYNCHRONIZE'),
    logging: configService.get<string>('NODE_ENV') === 'development',
    migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
    migrationsRun: true,
  };
};
