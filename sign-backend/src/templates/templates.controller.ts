import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('pdf', {
      storage: diskStorage({
        destination: './Uploads/templates',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name: string,
    @Body('description') description: string,
    @Body('tags') tags: string,
  ) {
    const parsedTags = tags ? JSON.parse(tags) : [];
    return this.templatesService.create({
      name,
      description,
      filePath: file.path,
      tags: parsedTags,
    });
  }

  @Get()
  async findAll() {
    return this.templatesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }

  @Get('file/:id')
  async getFile(@Param('id') id: string, @Res() res: Response) {
    const template = await this.templatesService.findOne(id);
    if (!template) {
      throw new Error('Template not found');
    }
    return res.sendFile(template.filePath, { root: '.' });
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('pdf', {
      storage: diskStorage({
        destination: './Uploads/templates',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name: string,
    @Body('description') description: string,
    @Body('tags') tags: string,
  ) {
    const parsedTags = tags ? JSON.parse(tags) : [];
    const updateDto = {
      name,
      description,
      filePath: file ? file.path : undefined,
      tags: parsedTags,
    };
    return this.templatesService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.templatesService.remove(id);
  }
}
