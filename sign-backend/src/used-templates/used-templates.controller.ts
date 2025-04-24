import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Patch,
  UseInterceptors,
  UploadedFile,
  Res,
  Body,
} from '@nestjs/common';
import { UsedTemplatesService } from './used-templates.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';

@Controller('used-templates')
export class UsedTemplatesController {
  constructor(private readonly usedTemplatesService: UsedTemplatesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('pdf', {
      storage: diskStorage({
        destination: './uploads/used_templates',
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
  ) {
    return this.usedTemplatesService.create({
      name,
      description,
      filePath: file.path,
    });
  }

  @Get()
  async findAll() {
    return this.usedTemplatesService.findAll();
  }

  @Get('file/:id')
  async getFile(@Param('id') id: string, @Res() res: Response) {
    const template = await this.usedTemplatesService.findOne(id);
    if (!template) {
      throw new Error('Used template not found');
    }
    return res.sendFile(template.filePath, { root: '.' });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: { name?: string; description?: string },
  ) {
    return this.usedTemplatesService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usedTemplatesService.remove(id);
  }
}
