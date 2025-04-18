import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface ProcessedPdf {
  id: string;
  name: string;
  description: string;
  date: string;
  pdfBase64: string;
}

@Injectable()
export class ProcessedPdfsService {
  private processedPdfs: ProcessedPdf[] = [];

  saveProcessedPdf(
    file: Express.Multer.File,
    name: string,
    description: string,
  ): ProcessedPdf {
    const id = uuidv4();
    const date = new Date().toISOString();
    const pdfBase64 = file.buffer.toString('base64');

    const processedPdf: ProcessedPdf = {
      id,
      name,
      description,
      date,
      pdfBase64,
    };
    this.processedPdfs.push(processedPdf);
    return processedPdf;
  }

  getProcessedPdfs(): ProcessedPdf[] {
    return this.processedPdfs.map(({ id, name, description, date }) => ({
      id,
      name,
      description,
      date,
      pdfBase64: '', // Exclude PDF content for listing
    }));
  }

  getProcessedPdfById(id: string): ProcessedPdf {
    const pdf = this.processedPdfs.find((p) => p.id === id);
    if (!pdf) {
      throw new Error('Processed PDF not found');
    }
    return pdf;
  }

  updateProcessedPdf(
    id: string,
    name: string,
    description: string,
  ): ProcessedPdf {
    const pdf = this.processedPdfs.find((p) => p.id === id);
    if (!pdf) {
      throw new Error('Processed PDF not found');
    }
    pdf.name = name;
    pdf.description = description;
    pdf.date = new Date().toISOString();
    return pdf;
  }

  deleteProcessedPdf(id: string): void {
    const index = this.processedPdfs.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error('Processed PDF not found');
    }
    this.processedPdfs.splice(index, 1);
  }
}