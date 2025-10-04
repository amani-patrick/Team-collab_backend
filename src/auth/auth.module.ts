/* eslint-disable @typescript-eslint/require-await */
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from '../entity/organization.entity'; 
import { User } from '../entity/user.entity';


@Module({
  imports: [
    UsersModule, // Provides UsersService and User Repository
    PassportModule,
    ConfigModule,
    TypeOrmModule.forFeature([Organization, User]), // Used for transactional registration
    
    // Asynchronous JwtModule configuration using environment variables
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), 
        signOptions: { expiresIn: '60m' }, 
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy], 
  exports: [AuthService, JwtModule], // Export to be used by JwtAuthGuard and other modules
})
export class AuthModule {}