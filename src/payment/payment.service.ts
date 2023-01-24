import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import * as Razorpay from 'razorpay';
import * as crypto from 'crypto';
@Injectable()
export class PaymentService {
  async createRazorpayOrder(data: any) {
    try {
      Logger.warn(data);
      const razorpayInstanse = new Razorpay({
        key_id: process.env.RAZERPAY_KEY_ID,
        key_secret: process.env.RAZERPAY_KEY_SECRET,
      });
      const options = {
        amount: data.amount,
        currency: data.currency,
        receipt: data.receipt,
      };
      const response = await razorpayInstanse.orders.create(options);
      if (response == null) {
        return {
          statusCode: 200,
          message: 'failure',
          result: null,
        };
      } else {
        return {
          statusCode: 200,
          message: 'success',
          result: response,
        };
      }
    } catch (error) {
      throw error;
    }
  }
  async verifyPayment(data: any) {
    try {
      Logger.warn(data);
      const body =
        data.response.razorpay_order_id +
        '|' +
        data.response.razorpay_payment_id;

      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZERPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature === data.response.razorpay_signature) {
        return {
          statusCode: 200,
          message: 'success',
          result: { signatureIsValid: 'true' },
        };
      } else {
        return {
          statusCode: 200,
          message: 'success',
          result: { signatureIsValid: 'false' },
        };
      }
    } catch (error) {
      throw error;
    }
  }
  async getOrderStatus(data: any) {
    try {
      Logger.warn(data);
      const razorpayInstanse = new Razorpay({
        key_id: process.env.RAZERPAY_KEY_ID,
        key_secret: process.env.RAZERPAY_KEY_SECRET,
      });
      const response = await razorpayInstanse.orders.fetch(data.orderId);
      if (response == null) {
        return {
          statusCode: 200,
          message: 'failure',
          result: null,
        };
      } else {
        return {
          statusCode: 200,
          message: 'success',
          result: response,
        };
      }
    } catch (error) {
      throw error;
    }
  }
}
