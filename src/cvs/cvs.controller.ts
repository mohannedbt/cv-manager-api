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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedRequest, AuthenticatedUser } from '../common/interfaces/auth.interface';
import { CvsService } from './cvs.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';

@Controller('cvs')
export class CvsController {
  constructor(private readonly cvsService: CvsService) {}

  @Post()
  create(@Body() createCvDto: CreateCvDto, @CurrentUser() user: AuthenticatedUser) {
    return this.cvsService.create(createCvDto, user);
  }

  @Get()
  // TP auth stage: read routes use Passport JWT guard (Authorization: Bearer <token>).
  @UseGuards(AuthGuard('jwt'))
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('name') name?: string,
    @Query('age') age?: string,
  ) {
    return this.cvsService.findAll(user, {
      name,
      age: age ? Number(age) : undefined,
    });
  }

  @Get(':id')
  // Ownership/admin access is enforced in CvsService after authentication.
  @UseGuards(AuthGuard('jwt'))
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.cvsService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCvDto: UpdateCvDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.cvsService.update(id, updateCvDto, user);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.cvsService.remove(id, user);
  }
}
