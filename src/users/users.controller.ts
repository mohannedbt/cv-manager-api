import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MyGuard } from 'src/auth/auth.myguard';
import { User } from './entities/user.entity';
import { AdminRoles } from 'src/auth/enums/auth.adminroles';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
  @UseGuards(MyGuard) // Make it so only users with admin roles can access the following endpoints
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    const loggedInUser = req.user; 
    const targetId = +id;         
    if (loggedInUser.id === targetId || loggedInUser.role in AdminRoles) {
      return this.usersService.findOne(targetId);
    }

    throw new ForbiddenException("You do not have permission to view this profile.");
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
