import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Cv } from '../../cvs/entities/cv.entity';

@Entity()
export class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })       
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;               

  @Column({ default: 'user' })    
  role: string;

  @OneToMany(() => Cv, cv => cv.user)   
  cvs: Cv[];                            
}