import { Body, Controller, Post, Logger, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ReportGenerationService } from "./report.generation.service";

@Controller()
export class ReportGenerationController {
  constructor(private readonly reportGenerationService: ReportGenerationService) {}
 
  @Post('generateReport')
  @UseInterceptors(FileInterceptor('file'))
  async generateReport(@UploadedFile() file : Express.Multer.File, @Body() data : any) {
    console.log(file);
    console.log(data);
    const result = await this.reportGenerationService.generateReport(file,data)
    return result;
  }
}
