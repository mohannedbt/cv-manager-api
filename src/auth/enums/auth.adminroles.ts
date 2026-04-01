//use this file to store any enums related to admin roles in the system
// u can add ur own roles here and then use them in the MyGuard to check for permissions
export enum AdminRoles {
  SUPER_ADMIN = 'super_admin',
  MODERATOR = 'moderator',
  CONTENT_EDITOR = 'editor',
}