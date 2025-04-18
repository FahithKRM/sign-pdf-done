import { Module } from '@nestjs/common';
import { ProcessedPdfsController } from './processed-pdfs.controller';
import { ProcessedPdfsService } from './processed-pdfs.service';

@Module({
  controllers: [ProcessedPdfsController],
  providers: [ProcessedPdfsService],
})
export class ProcessedPdfsModule {}
