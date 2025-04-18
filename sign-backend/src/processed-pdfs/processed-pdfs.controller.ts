import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProcessedPdfsService, ProcessedPdf } from './processed-pdfs.service';

@Controller('processed-pdfs')
export class ProcessedPdfsController {
  constructor(private readonly processedPdfsService: ProcessedPdfsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('pdf'))
  createProcessedPdf(
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name: string,
    @Body('description') description: string,
  ): ProcessedPdf {
    return this.processedPdfsService.saveProcessedPdf(file, name, description);
  }

  @Get()
  getProcessedPdfs(): ProcessedPdf[] {
    return this.processedPdfsService.getProcessedPdfs();
  }

  @Get(':id')
  getProcessedPdf(@Param('id') id: string): ProcessedPdf {
    return this.processedPdfsService.getProcessedPdfById(id);
  }

  @Patch(':id')
  updateProcessedPdf(
    @Param('id') id: string,
    @Body('name') name: string,
    @Body('description') description: string,
  ): ProcessedPdf {
    return this.processedPdfsService.updateProcessedPdf(id, name, description);
  }

  @Delete(':id')
  deleteProcessedPdf(@Param('id') id: string): void {
    this.processedPdfsService.deleteProcessedPdf(id);
  }
}