import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Template } from '../entities/template.entity';
import { UsedTemplate } from '../entities/used-template.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: 'pdf_templates.db',
  entities: [Template, UsedTemplate],
  synchronize: true, // Auto-create tables (use false in production)
};