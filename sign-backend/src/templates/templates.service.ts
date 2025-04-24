import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template } from './template.entity';
import { unlink } from 'fs/promises';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(Template)
    private templatesRepository: Repository<Template>,
  ) {}

  async create(dto: {
    name: string;
    description: string;
    filePath: string;
    tags: any[];
  }) {
    const template = this.templatesRepository.create({
      name: dto.name,
      description: dto.description,
      filePath: dto.filePath,
      tags: dto.tags,
    });
    return this.templatesRepository.save(template);
  }

  async findAll() {
    return this.templatesRepository.find();
  }

  async findOne(id: string) {
    const template = await this.templatesRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }
    return template;
  }

  async update(
    id: string,
    updateDto: {
      name?: string;
      description?: string;
      filePath?: string;
      tags?: any[];
    },
  ) {
    const template = await this.findOne(id);
    if (updateDto.name) template.name = updateDto.name;
    if (updateDto.description) template.description = updateDto.description;
    if (updateDto.filePath) {
      await unlink(template.filePath).catch(() => {}); // Delete old file if exists
      template.filePath = updateDto.filePath;
    }
    if (updateDto.tags) template.tags = updateDto.tags;
    return this.templatesRepository.save(template);
  }

  async remove(id: string) {
    const template = await this.findOne(id);
    await unlink(template.filePath).catch(() => {}); // Delete file if exists
    return this.templatesRepository.remove(template);
  }
}
