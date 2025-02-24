"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { Table } from "@tanstack/react-table";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Skeleton } from "~/components/ui/skeleton";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  pageCount?: number;
  page?: number;
  currentPage?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  loading?: boolean;
  pageSizeOptions?: number[];
}

export function DataTablePagination<TData>({
  table,
  pageCount = table.getPageCount(),
  currentPage = table.getState().pagination.pageIndex + 1,
  pageSize = table.getState().pagination.pageSize,
  total = table.getFilteredRowModel().rows.length,
  onPageChange,
  loading = false,
  pageSizeOptions = [10, 20, 30, 40, 50],
}: DataTablePaginationProps<TData>) {
  const startRow = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRow = Math.min(currentPage * pageSize, total);

  if (loading) {
    return (
      <div className="flex items-center justify-end space-x-4 px-2">
        <Skeleton className="h-4 w-[200px]" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    );
  }

  if (!pageCount || pageCount <= 0) {
    return (
      <div className="flex items-center justify-end space-x-4 px-2">
        {total > 0 && (
          <div className="text-sm font-medium">总共 {total} 条</div>
        )}
      </div>
    );
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    // 总是显示第一页
    pages.push(1);

    // 当前页前面的省略号
    if (currentPage > 4) {
      pages.push("...");
    }

    // 当前页附近的页码
    for (
      let i = Math.max(2, currentPage - 2);
      i <= Math.min(pageCount - 1, currentPage + 2);
      i++
    ) {
      if (i > 1 && i < pageCount) {
        pages.push(i);
      }
    }

    // 当前页后面的省略号
    if (currentPage < pageCount - 3) {
      pages.push("...");
    }

    // 如果有多页，总是显示最后一页
    if (pageCount > 1) {
      pages.push(pageCount);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-end space-x-4 px-2">
      <div className="flex items-center space-x-2">
        <div className="text-sm font-medium">
          {pageCount && (
            <>
              {total === 0 ? "第 0-0 条" : `第 ${startRow}-${endRow} 条`} / 总共{" "}
              {total} 条
            </>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        {pageNumbers.map((page, index) => {
          if (page === "...") {
            return (
              <div key={`ellipsis-${index}`} className="w-8 text-center">
                ...
              </div>
            );
          }

          const pageNum = page as number;
          return (
            <Button
              key={pageNum}
              variant="ghost"
              className={cn(
                "h-8 w-8 p-0",
                currentPage === pageNum
                  ? "border border-primary bg-transparent text-primary hover:bg-primary/10"
                  : "border-none hover:bg-muted-foreground/5",
              )}
              onClick={() => onPageChange?.(pageNum)}
            >
              {pageNum}
            </Button>
          );
        })}
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange?.(currentPage + 1)}
          disabled={currentPage >= pageCount}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
