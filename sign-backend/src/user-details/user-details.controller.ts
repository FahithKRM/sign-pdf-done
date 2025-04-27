import { Controller, Get } from '@nestjs/common';

@Controller('user-details')
export class UserDetailsController {
  @Get()
  getUserDetails() {
    // Mock data; replace with actual user data retrieval logic
    return {
      employeeName: 'Mohamed Fahith',
      employeeJobTitle: 'Software Engineer',
    };
  }
}
