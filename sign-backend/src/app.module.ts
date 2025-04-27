import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplatesModule } from './templates/templates.module';
import { UsedTemplatesModule } from './used-templates/used-templates.module';
import { UserDetailsModule } from './user-details/user-details.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'FAHITH#19f',
      database: 'sign_signature',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    TemplatesModule,
    UsedTemplatesModule,
    UserDetailsModule,
  ],
})
export class AppModule {}
