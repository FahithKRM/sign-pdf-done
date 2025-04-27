import { Module } from '@nestjs/common';
import { UserDetailsController } from './user-details.controller';

@Module({
  controllers: [UserDetailsController],
})
export class UserDetailsModule {}
