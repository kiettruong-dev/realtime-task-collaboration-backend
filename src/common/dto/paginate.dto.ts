import { Transform } from 'class-transformer';
import { IsOptional, Max, Min } from 'class-validator';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from '../constants/pagination.constant';

export class PaginateDto {
  @IsOptional()
  @Min(1)
  @Transform(({ value }: { value: string }) => parseInt(value) || DEFAULT_PAGE)
  page?: number = 1;

  @IsOptional()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  @Transform(
    ({ value }: { value: string }) => parseInt(value) || DEFAULT_PAGE_SIZE,
  )
  pageSize?: number = 10;
}
