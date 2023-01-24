import { Body, Controller, Post, Logger } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('createRazorpayOrder')
  async createRazorpayOrder(@Body() data: any) {
    try {
      Logger.warn(
        '-----------------request-START paymentService/createRazorpayOrder----------',
      );
      Logger.warn(data);
      const result = await this.paymentService.createRazorpayOrder(data);
      Logger.warn(
        '////request-END paymentService/createRazorpayOrder/////////',
      );
      return result;
    } catch (error) {
      throw error;
    }
  }
  @Post('verifyPayment')
  async verifyPayment(@Body() data: any) {
    try {
      const result = await this.paymentService.verifyPayment(data);
      return result;
    } catch (error) {
      throw error;
    }
  }
  @Post('getOrderStatus')
  async getOrderStatus(@Body() data: any) {
    try {
      const result = await this.paymentService.getOrderStatus(data);
      return result;
    } catch (error) {
      throw error;
    }
  }
}
