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
} from "@tanstack/react-table";
import { useState } from "react";
import { DataTableFilterBox } from "./data-table-filter-box";
import { DataTablePagination } from "./data-table-pagination";
import Image from "next/image";
import type { FilterValue } from "./data-table-filter-box";
import React from "react";

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
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalItems?: number;
  pageSizeOptions?: number[];
  filters?: Filter[];
  onSearch?: (values: Record<string, FilterValue>) => void;
  defaultValues?: Record<string, FilterValue>;
  filterLoading?: Record<string, boolean>;
  onFilterChange?: (column: string, value: FilterValue) => void;
  pagination?: {
    pageCount: number;
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  loading?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  totalItems,
  pageSizeOptions = [10, 20, 30, 40, 50],
  filters,
  onSearch,
  defaultValues,
  filterLoading,
  onFilterChange,
  pagination,
  loading,
}: DataTableProps<TData, TValue>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const paginationState = {
    pageIndex: currentPage - 1, // zero-based index for React Table
    pageSize: pageSize,
  };

  const pageCount = Math.ceil((totalItems ?? 0) / pageSize);

  const handlePaginationChange = (
    updaterOrValue:
      | PaginationState
      | ((old: PaginationState) => PaginationState),
  ) => {
    const pagination =
      typeof updaterOrValue === "function"
        ? updaterOrValue(paginationState)
        : updaterOrValue;

    setCurrentPage(pagination.pageIndex + 1); // converting zero-based index to one-based
    setPageSize(pagination.pageSize);
  };

  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount,
    state: {
      pagination: paginationState,
    },
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualFiltering: true,
  });

  return (
    <div className="space-y-4">
      {filters && (
        <DataTableFilterBox
          key="filter-box"
          table={table}
          filters={filters}
          onSearch={
            onSearch ??
            (() => {
              // Implement default search behavior if needed
              console.log("默认搜索行为");
            })
          }
          defaultValues={defaultValues}
          filterLoading={filterLoading}
          onFilterChange={onFilterChange}
        />
      )}

      <ScrollArea className="grid h-[calc(80vh-220px)] rounded-md border bg-white dark:bg-[hsl(var(--card))] md:h-[calc(90dvh-240px)]">
        <div className="min-w-max">
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
              {loading ? (
                // 加载状态
                <>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      {columns.map((_, cellIndex) => (
                        <TableCell key={cellIndex}>
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </>
              ) : data.length === 0 ? (
                // 空数据状态
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-[350px]">
                    <div className="flex h-full w-full flex-col items-center justify-center">
                      <div className="relative">
                        <Image
                          src={"/no-data.svg"}
                          alt={"no-data"}
                          width={250}
                          height={250}
                          loading="lazy"
                          className="object-cover"
                        />
                        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-muted-foreground">
                          暂无数据
                        </span>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                // 数据展示
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const value = cell.getValue();
                      const content = flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      );

                      return (
                        <TableCell key={cell.id}>
                          {cell.column.id === "actions"
                            ? content
                            : value === "" ||
                                value === null ||
                                value === undefined
                              ? "-"
                              : content}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <DataTablePagination
        table={table}
        pageCount={
          pagination?.pageCount ??
          Math.ceil((totalItems ?? 0) / (pageSize ?? 10))
        }
        currentPage={pagination?.page ?? currentPage}
        pageSize={pagination?.pageSize ?? pageSize}
        total={pagination?.total ?? totalItems ?? 0}
        onPageChange={(page) => {
          if (pagination?.onPageChange) {
            pagination.onPageChange(page);
          } else {
            setCurrentPage(page);
          }
        }}
        loading={loading}
      />
    </div>
  );
}
