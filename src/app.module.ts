import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentModule } from './payment/payment.module';
import { EmailModule } from './email/email.module';
import { ReportModule } from './report.generation/report.generation.module';

const ENV = `.env.${process.env.NODE_ENV}`;
@Module({
  imports: [
    PaymentModule,
    EmailModule,
    ReportModule,

    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ENV,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
