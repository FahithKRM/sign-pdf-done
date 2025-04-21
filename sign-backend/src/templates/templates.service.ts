import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template } from '../entities/template.entity';
import { join } from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(Template)
    private templateRepository: Repository<Template>,
  ) {}

  async create(
    file: Express.Multer.File,
    name: string,
    description: string,
  ): Promise<Template> {
    const filePath = join('uploads', file.filename);
    const template = this.templateRepository.create({
      name,
      description,
      filePath,
    });
    return this.templateRepository.save(template);
  }

  async findAll(): Promise<Template[]> {
    return this.templateRepository.find();
  }

  async findOne(id: string): Promise<Template> {
    const template = await this.templateRepository.findOneBy({ id });
    if (!template) {
      throw new Error(`Template with ID ${id} not found.`);
    }
    return template;
  }

  async update(
    id: string,
    name: string,
    description: string,
  ): Promise<Template> {
    const template = await this.findOne(id);
    template.name = name;
    template.description = description;
    return this.templateRepository.save(template);
  }

  async remove(id: string): Promise<void> {
    const template = await this.findOne(id);
    await fs.unlink(join(__dirname, '..', '..', template.filePath));
    await this.templateRepository.delete(id);
  }
}
