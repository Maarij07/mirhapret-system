import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  User,
  Category,
  Product,
  ProductSizeInventory,
  Promotion,
  PromoCode,
  PromoCodeUsage,
  Order,
  OrderItem,
  PaymentTransaction,
  CustomerAddress,
  Wishlist,
  ProductAnalytic,
} from './entities';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { UsersModule } from './modules/users/users.module';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    // Environment Configuration - must be first
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.example'],
      expandVariables: true,
    }),

    // Database Configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: +config.get('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_DATABASE'),
        entities: [
          User,
          Category,
          Product,
          ProductSizeInventory,
          Promotion,
          PromoCode,
          PromoCodeUsage,
          Order,
          OrderItem,
          PaymentTransaction,
          CustomerAddress,
          Wishlist,
          ProductAnalytic,
        ],
        synchronize: config.get('DB_SYNCHRONIZE') === 'true',
        logging: config.get('DB_LOGGING') === 'true',
        ssl:
          config.get('NODE_ENV') === 'production'
            ? { rejectUnauthorized: false }
            : false,
      }),
      inject: [ConfigService],
    }),

    // Bull Queue Configuration (Redis-based job queue)
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST'),
          port: +config.get('REDIS_PORT'),
          db: +config.get('REDIS_DB', 0),
        },
      }),
      inject: [ConfigService],
    }),

    // Rate Limiting/Throttling
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute window
        limit: 100, // 100 requests per minute
      },
    ]),

    // Feature Modules
    AuthModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
    InventoryModule,
    PromotionsModule,
    AnalyticsModule,
    CloudinaryModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
