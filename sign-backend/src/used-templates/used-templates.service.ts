import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsedTemplate } from '../entities/used-template.entity';
import { join } from 'path';
import * as fs from 'fs/promises';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

@Injectable()
export class UsedTemplatesService {
  constructor(
    @InjectRepository(UsedTemplate)
    private usedTemplateRepository: Repository<UsedTemplate>,
  ) {}

  async create(
    file: Express.Multer.File,
    name: string,
    description: string,
    replacements: {
      defaultText: string;
      newText: string;
      x: number;
      y: number;
      size: number;
      page: number;
    }[],
  ): Promise<UsedTemplate> {
    const pdfBuffer = await fs.readFile(file.path);
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    for (const { defaultText, newText, x, y, size, page } of replacements) {
      const pdfPage = pdfDoc.getPage(page - 1);
      const textWidth = font.widthOfTextAtSize(defaultText, size);
      const textHeight = size;

      // Cover old text with a white rectangle
      pdfPage.drawRectangle({
        x,
        y: pdfPage.getHeight() - y - textHeight,
        width: textWidth,
        height: textHeight,
        color: rgb(1, 1, 1),
      });

      // Draw new text
      pdfPage.drawText(newText, {
        x,
        y: pdfPage.getHeight() - y - textHeight,
        size,
        font,
        color: rgb(0, 0, 0),
      });
    }

    const pdfBytes = await pdfDoc.save();
    const newFileName = `modified_${file.filename}`;
    const newFilePath = join('uploads', newFileName);
    await fs.writeFile(newFilePath, pdfBytes);

    const usedTemplate = this.usedTemplateRepository.create({
      name,
      description,
      filePath: newFilePath,
    });
    return this.usedTemplateRepository.save(usedTemplate);
  }

  async findAll(): Promise<UsedTemplate[]> {
    return this.usedTemplateRepository.find();
  }

  async findOne(id: string): Promise<UsedTemplate> {
    const usedTemplate = await this.usedTemplateRepository.findOneBy({ id });
    if (!usedTemplate) {
      throw new Error(`UsedTemplate with ID ${id} not found.`);
    }
    return usedTemplate;
  }

  async remove(id: string): Promise<void> {
    const usedTemplate = await this.findOne(id);
    await fs.unlink(join(__dirname, '..', '..', usedTemplate.filePath));
    await this.usedTemplateRepository.delete(id);
  }
}
