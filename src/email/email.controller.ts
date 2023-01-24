import { Body, Controller, Post, Logger } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller()
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('saveDetailsAndSendEmail')
  async saveDetailsAndSendEmail(@Body() data: any) {
    try {
      const result = await this.emailService.saveDetailsAndSendEmail(data);
      return result;
    } catch (error) {
      throw error;
    }
  }
}
