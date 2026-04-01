// supervisor.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AdminRoles } from './enums/auth.adminroles';

@Injectable()
export class MyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return user && user.role in AdminRoles;
  }
}