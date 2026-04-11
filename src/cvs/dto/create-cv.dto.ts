import {
	IsArray,
	IsInt,
	ValidateIf,
	IsOptional,
	IsString,
	Max,
	Min,
} from 'class-validator';

export class CreateCvDto {
	@IsString()
	name!: string;

	@IsString()
	firstname!: string;

	@IsInt()
	@Min(16)
	@Max(100)
	age!: number;

	@IsString()
	cin!: string;

	@IsString()
	job!: string;

	@IsOptional()
	@IsString()
	path?: string | null;

	@ValidateIf((_, value) => value !== undefined)
	@IsInt()
	userId?: number;

	@ValidateIf((_, value) => value !== undefined)
	@IsArray()
	@IsInt({ each: true })
	skillIds?: number[];
}
