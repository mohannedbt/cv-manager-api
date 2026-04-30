import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CvLogsService } from './cv-logs.service';
import { AuthGuard } from '@nestjs/passport';

// cv-logs/cv-logs.controller.ts
@Controller('cv-logs')
@UseGuards(AuthGuard('jwt'))
export class CvLogsController {
  constructor(private cvLogsService: CvLogsService) {}

  @Get()
  findAll() {
    return this.cvLogsService.findAll();
  }

  @Get(':cvId')
  findByCv(@Param('cvId', ParseIntPipe) cvId: number) {
    return this.cvLogsService.findByCv(cvId);
  }
}
