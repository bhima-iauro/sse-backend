import { Module } from '@nestjs/common';
import { ReportGenerationController } from './repot.generation.controller';
import { ReportGenerationService } from './report.generation.service';

@Module({
  imports: [],
  controllers: [ReportGenerationController],
  providers: [ReportGenerationService],
})
export class ReportModule {}
