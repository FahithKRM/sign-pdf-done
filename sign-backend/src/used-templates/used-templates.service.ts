import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsedTemplate } from './used-template.entity';
import { unlink } from 'fs/promises';

@Injectable()
export class UsedTemplatesService {
  constructor(
    @InjectRepository(UsedTemplate)
    private usedTemplatesRepository: Repository<UsedTemplate>,
  ) {}

  async create(dto: { name: string; description: string; filePath: string }) {
    const template = this.usedTemplatesRepository.create({
      name: dto.name,
      description: dto.description,
      filePath: dto.filePath,
    });
    return this.usedTemplatesRepository.save(template);
  }

  async findAll() {
    return this.usedTemplatesRepository.find();
  }

  async findOne(id: string) {
    const template = await this.usedTemplatesRepository.findOne({
      where: { id },
    });
    if (!template) {
      throw new NotFoundException(`Used template with ID ${id} not found`);
    }
    return template;
  }

  async update(id: string, updateDto: { name?: string; description?: string }) {
    const template = await this.findOne(id);
    if (updateDto.name) template.name = updateDto.name;
    if (updateDto.description) template.description = updateDto.description;
    return this.usedTemplatesRepository.save(template);
  }

  async remove(id: string) {
    const template = await this.findOne(id);
    await unlink(template.filePath);
    return this.usedTemplatesRepository.remove(template);
  }
}
