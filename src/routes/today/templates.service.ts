import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface Template {
  id: string;
  name: string;
  description: string;
  date: string;
  pdfBase64: string;
}

@Injectable()
export class TemplatesService {
  private templates: Template[] = [];

  saveTemplate(
    file: Express.Multer.File,
    name: string,
    description: string,
  ): Template {
    const id = uuidv4();
    const date = new Date().toISOString();
    const pdfBase64 = file.buffer.toString('base64');

    const template: Template = { id, name, description, date, pdfBase64 };
    this.templates.push(template);
    return template;
  }

  getTemplates(): Template[] {
    return this.templates.map(({ id, name, description, date }) => ({
      id,
      name,
      description,
      date,
      pdfBase64: '', // Exclude PDF content for listing
    }));
  }

  getTemplateById(id: string): Template {
    const template = this.templates.find((t) => t.id === id);
    if (!template) {
      throw new Error('Template not found');
    }
    return template;
  }

  updateTemplate(id: string, name: string, description: string): Template {
    const template = this.templates.find((t) => t.id === id);
    if (!template) {
      throw new Error('Template not found');
    }
    template.name = name;
    template.description = description;
    template.date = new Date().toISOString();
    return template;
  }

  deleteTemplate(id: string): void {
    const index = this.templates.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error('Template not found');
    }
    this.templates.splice(index, 1);
  }
}

// The TemplatesService class manages the templates in memory.
// It provides methods to save, retrieve, update, and delete templates.
// The templates are stored in an array, and each template has an ID, name, description, date, and PDF content in base64 format.
// The saveTemplate method takes a file, name, and description as input,
// generates a unique ID and date, converts the file to base64, and stores the template