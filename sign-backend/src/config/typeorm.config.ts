import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UsedTemplate } from '../entities/used-template.entity';
import { Template } from 'src/entities/template.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: 'pdf_templates.db',
  entities: [Template, UsedTemplate],
  synchronize: true, // Auto-create tables (use false in production)
};
