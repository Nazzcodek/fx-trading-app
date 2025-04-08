import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  return {
    type: 'mysql',
    host: configService.get<string>('MYSQL_HOST'),
    port: configService.get<number>('MYSQL_PORT'),
    username: configService.get<string>('MYSQL_USERNAME'),
    password: configService.get<string>('MYSQL_PASSWORD'),
    database: configService.get<string>('MYSQL_DATABASE'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: configService.get<boolean>('DB_SYNCHRONIZE'),
    logging: configService.get<string>('NODE_ENV') === 'development',
    migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
    migrationsRun: true,
  };
};
