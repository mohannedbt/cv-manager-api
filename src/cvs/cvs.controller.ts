import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { AuthenticatedRequest, AuthenticatedUser } from '../common/interfaces/auth.interface';
import { CvsService } from './cvs.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';

@Controller('cvs')
export class CvsController {
  constructor(private readonly cvsService: CvsService) {}

  private getActor(req: AuthenticatedRequest): AuthenticatedUser {
    // Service-level authorization relies on a normalized authenticated actor object.
    if (!req.user) {
      throw new UnauthorizedException('Authentication required');
    }

    return req.user;
  }

  @Post()
  create(@Body() createCvDto: CreateCvDto, @Req() req: AuthenticatedRequest) {
    return this.cvsService.create(createCvDto, this.getActor(req));
  }

  @Get()
  // TP auth stage: read routes use Passport JWT guard (Authorization: Bearer <token>).
  @UseGuards(AuthGuard('jwt'))
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query('name') name?: string,
    @Query('age') age?: string,
  ) {
    return this.cvsService.findAll(this.getActor(req), {
      name,
      age: age ? Number(age) : undefined,
    });
  }

  @Get(':id')
  // Ownership/admin access is enforced in CvsService after authentication.
  @UseGuards(AuthGuard('jwt'))
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.cvsService.findOne(id, this.getActor(req));
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCvDto: UpdateCvDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.cvsService.update(id, updateCvDto, this.getActor(req));
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.cvsService.remove(id, this.getActor(req));
  }
}
