/* eslint-disable */
"use client";

import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  type PaginationState,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { useState } from "react";
import { DataTableFilterBox } from "./data-table-filter-box";
import { DataTablePagination } from "./data-table-pagination";
import Image from "next/image";
import type { FilterValue } from "./data-table-filter-box";

export interface FilterOption {
  label: string;
  value: string | number;
}

export interface Filter {
  column: string;
  label: string;
  type: "input" | "select" | "date-range" | "date-single" | "number-range";
  options?: FilterOption[];
  precision?: number;
}

export interface TableState {
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  sorting: {
    column: string;
    direction: "asc" | "desc" | null;
  };
  filters: Record<string, FilterValue>;
}

export interface DataTableProps<TData, TValue> {
  // 基础数据
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalItems?: number;

  // 功能开关
  enablePagination?: boolean;
  enableSorting?: boolean;
  enableFilters?: boolean;

  // 配置
  pageSizeOptions?: number[];
  filters?: Filter[];
  defaultValues?: Record<string, FilterValue>;

  // 状态回调
  onStateChange?: (state: TableState) => void;

  // 加载状态
  loading?: boolean;

  // 自定义渲染
  emptyContent?: React.ReactNode;
  loadingContent?: React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  totalItems,
  enablePagination = true,
  enableSorting = true,
  enableFilters = true,
  pageSizeOptions = [10, 20, 30, 40, 50],
  filters,
  defaultValues,
  onStateChange,
  loading = false,
  emptyContent,
  loadingContent,
}: DataTableProps<TData, TValue>) {
  // 使用普通的 state 替代 useQueryState
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const paginationState = {
    pageIndex: currentPage - 1,
    pageSize: pageSize,
  };

  const pageCount = Math.ceil((totalItems ?? 0) / pageSize);

  // 表格实例
  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount,
    state: {
      pagination: paginationState,
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newPagination = updater(paginationState);
        setCurrentPage(newPagination.pageIndex + 1);
        setPageSize(newPagination.pageSize);
      } else {
        setCurrentPage(updater.pageIndex + 1);
        setPageSize(updater.pageSize);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableSorting,
    enableFilters,
    manualPagination: true,
  });

  // 渲染加载状态
  if (loading) {
    return (
      loadingContent || (
        <div className="space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      )
    );
  }

  return (
    <div className="space-y-4">
      {enableFilters && filters && (
        <DataTableFilterBox
          table={table}
          filters={filters}
          defaultValues={defaultValues}
          onSearch={(values) => {
            onStateChange?.({
              pagination: paginationState,
              sorting: { column: "", direction: null },
              filters: values,
            });
          }}
        />
      )}

      <ScrollArea className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => {
                    const value = cell.getValue();
                    return (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {emptyContent || (
                    <div className="flex h-full w-full flex-col items-center justify-center">
                      <div className="relative">
                        <Image
                          src="/images/no-data.svg"
                          alt="no-data"
                          width={250}
                          height={250}
                          loading="lazy"
                        />
                        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-muted-foreground">
                          暂无数据
                        </span>
                      </div>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {enablePagination && (
        <DataTablePagination
          table={table}
          pageSizeOptions={pageSizeOptions}
          onPageChange={(page) => {
            setCurrentPage(page);
          }}
          {...{
            pageCount,
            page: currentPage,
            pageSize,
            total: totalItems ?? 0,
          }}
        />
      )}
    </div>
  );
}
