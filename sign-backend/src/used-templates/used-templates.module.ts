import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsedTemplatesService } from './used-templates.service';
import { UsedTemplatesController } from './used-templates.controller';
import { UsedTemplate } from './used-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UsedTemplate])],
  providers: [UsedTemplatesService],
  controllers: [UsedTemplatesController],
})
export class UsedTemplatesModule {}
