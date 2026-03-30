import {
	IsArray,
	IsInt,
	IsOptional,
	IsString,
	Max,
	Min,
} from 'class-validator';

export class CreateCvDto {
	@IsString()
	name: string;

	@IsString()
	firstname: string;

	@IsInt()
	@Min(16)
	@Max(100)
	age: number;

	@IsString()
	cin: string;

	@IsString()
	job: string;

	@IsOptional()
	@IsString()
	path?: string | null;

	@IsOptional()
	@IsInt()
	userId?: number;

	@IsOptional()
	@IsArray()
	@IsInt({ each: true })
	skillIds?: number[];
}
