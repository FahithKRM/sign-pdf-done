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
          filename: (req, file, cb) => {
            const randomName = Array(32)
              .fill(null)
              .map(() => Math.round(Math.random() * 16).toString(16))
              .join('');
            return cb(null, `${randomName}${extname(file.originalname)}`);
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
      return this.usedTemplatesService.create(file, name, description, JSON.parse(replacements));
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