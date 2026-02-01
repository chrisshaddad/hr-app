import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './auth/decorators';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Health check',
    description: 'Returns a simple greeting to verify the API is running',
  })
  @ApiOkResponse({
    description: 'API is running',
    schema: { type: 'string', example: 'Hello World!' },
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
