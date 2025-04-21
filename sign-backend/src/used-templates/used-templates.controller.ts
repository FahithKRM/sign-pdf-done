import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsedTemplatesService } from './used-templates.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('used-templates')
export class UsedTemplatesController {
  constructor(private readonly usedTemplatesService: UsedTemplatesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (
          req: Express.Request,
          file: Express.Multer.File,
          cb: (error: Error | null, filename: string) => void,
        ) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name: string,
    @Body('description') description: string,
    @Body('replacements') replacements: string,
  ) {
    const parsedReplacements = JSON.parse(replacements) as {
      defaultText: string;
      newText: string;
      x: number;
      y: number;
      size: number;
      page: number;
    }[];

    if (!Array.isArray(parsedReplacements)) {
      throw new Error('Invalid replacements format');
    }

    return this.usedTemplatesService.create(
      file,
      name,
      description,
      parsedReplacements,
    );
  }

  @Get()
  findAll() {
    return this.usedTemplatesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usedTemplatesService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usedTemplatesService.remove(id);
  }
}
