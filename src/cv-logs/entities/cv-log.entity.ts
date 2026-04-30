// cv-logs/entities/cv-log.entity.ts

import { Entity } from "typeorm";
import { Column, PrimaryGeneratedColumn } from "typeorm";
@Entity()
export class CvLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string; // 'CREATE' | 'UPDATE' | 'DELETE'

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @Column()
  cvId: number;

  @Column()
  userId: number; // qui a fait l'opération
}