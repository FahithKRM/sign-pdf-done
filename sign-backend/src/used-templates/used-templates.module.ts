import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsedTemplatesService } from './used-templates.service';
import { UsedTemplatesController } from './used-templates.controller';
import { UsedTemplate } from '../entities/used-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UsedTemplate])],
  controllers: [UsedTemplatesController],
  providers: [UsedTemplatesService],
})
export class UsedTemplatesModule {}