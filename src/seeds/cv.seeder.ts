import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { CvsService } from '../cvs/cvs.service';
import { UsersService } from '../users/users.service';
import { SkillsService } from '../skills/skills.service';
import { Skill } from '../skills/entities/skill.entity';
import { User } from '../users/entities/user.entity';
import { randFirstName, randLastName, randJobTitle, randNumber, randEmail, randUserName } from '@ngneat/falso';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const usersService = app.get(UsersService);
  const skillsService = app.get(SkillsService);
  const cvsService = app.get(CvsService);

  // 1. Seed Skills
  const skillNames = ['JavaScript', 'TypeScript', 'NestJS', 'React', 'Docker', 'SQL',"Python", "Java", "C#", "AWS"];
  const skills: Skill[] = []; 

  for (const name of skillNames) {
    const skill = await skillsService.create({ designation: name });
    skills.push(skill);
  }

  // 2. Seed Users
  const users: User[] = [];  

  for (let i = 0; i < 5; i++) {
    const user = await usersService.create({
      username: randUserName(),
      email: randEmail(),
      password: 'thisisapassword',
      role: i === 0 ? 'admin' : 'user',
    });
    users.push(user);
  }

  for (let i = 0; i < 10; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomSkills = skills
      .sort(() => 0.5 - Math.random())
      .slice(0, randNumber({ min: 1, max: 3 }));

    await cvsService.create({
      name: randLastName(),
      firstname: randFirstName(),
      age: randNumber({ min: 20, max: 60 }),
      cin: `TN${randNumber({ min: 10000000, max: 99999999 })}`,
      job: randJobTitle(),
      path: null,
      userId: randomUser.id,
      skillIds: randomSkills.map(s => s.id),
    });
  }

  await app.close();
  console.log('Seeding has been completed successfully');
}

bootstrap();