import { DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';

export const calculatePagination = (
  page: number | undefined,
  pageSize: number | undefined,
) => {
  const skip = (Number(page) - 1) * Number(pageSize);
  const limit = Number(pageSize);
  return {
    skip: skip || 0,
    limit: limit || DEFAULT_PAGE_SIZE,
  };
};
