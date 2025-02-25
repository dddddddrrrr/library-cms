"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { DataTable } from "~/components/ui/table/table";
import { api } from "~/trpc/react";
import {
  type Filter,
  type FilterValue,
} from "~/components/ui/table/data-table-filter-box";
import { useState } from "react";
import Image from "next/image";

interface View {
  id: string;
  userId: string;
  bookId: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  book: {
    id: string;
    title: string;
    author: string;
    cover: string | null;
  };
}

interface SearchParams {
  page: number;
  pageSize: number;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  sortBy?: "createdAt";
  sortOrder?: "asc" | "desc";
}

export function ViewsDataTable() {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    page: 1,
    pageSize: 10,
  });

  const { data, isLoading } = api.views.getAll.useQuery(searchParams);

  const columns: ColumnDef<View>[] = [
    {
      accessorKey: "book.cover",
      header: "封面",
      cell: ({ row }) => {
        const cover = row.original.book.cover;
        return cover ? (
          <Image
            src={cover}
            alt={row.original.book.title}
            width={40}
            height={60}
            className="rounded-sm object-cover"
          />
        ) : (
          <div className="h-[60px] w-[40px] rounded-sm bg-muted" />
        );
      },
    },
    {
      accessorKey: "book.title",
      header: "书名",
    },
    {
      accessorKey: "book.author",
      header: "作者",
    },
    {
      accessorKey: "user.name",
      header: "用户名",
      cell: ({ row }) => row.original.user.name ?? "-",
    },
    {
      accessorKey: "user.email",
      header: "用户邮箱",
      cell: ({ row }) => row.original.user.email ?? "-",
    },
    {
      accessorKey: "createdAt",
      header: "浏览时间",
      cell: ({ row }) =>
        format(new Date(row.original.createdAt), "yyyy-MM-dd HH:mm:ss"),
    },
  ];

  const filters: Filter[] = [
    {
      column: "bookTitle",
      label: "书名",
      type: "input",
    },
    {
      column: "bookAuthor",
      label: "作者",
      type: "input",
    },
    {
      column: "userName",
      label: "用户名",
      type: "input",
    },
    {
      column: "userEmail",
      label: "用户邮箱",
      type: "input",
    },
    {
      column: "createdAt",
      label: "浏览时间",
      type: "date-range",
    },
  ];

  const handleSearch = (filterValues: Record<string, FilterValue>) => {
    console.log("筛选参数:", filterValues);

    // 构建新的搜索参数
    const newParams: SearchParams = {
      page: 1, // 重置到第一页
      pageSize: searchParams.pageSize,
    };

    // 构建搜索字符串
    const searchTerms: string[] = [];

    if (filterValues.bookTitle) {
      searchTerms.push(filterValues.bookTitle as string);
    }

    if (filterValues.bookAuthor) {
      searchTerms.push(filterValues.bookAuthor as string);
    }

    if (filterValues.userName) {
      searchTerms.push(filterValues.userName as string);
    }

    if (filterValues.userEmail) {
      searchTerms.push(filterValues.userEmail as string);
    }

    if (searchTerms.length > 0) {
      newParams.search = searchTerms.join(" ");
    }

    // 处理日期范围
    if (filterValues.createdAtStart) {
      newParams.startDate = new Date(filterValues.createdAtStart as string);
    }

    if (filterValues.createdAtEnd) {
      newParams.endDate = new Date(filterValues.createdAtEnd as string);
    }

    console.log("新的搜索参数:", newParams);

    // 更新搜索参数
    setSearchParams(newParams);
  };

  return (
    <DataTable
      columns={columns}
      data={data?.views ?? []}
      filters={filters}
      onSearch={handleSearch}
      loading={isLoading}
      pagination={{
        pageCount: data?.pageCount ?? 0,
        page: data?.page ?? 1,
        pageSize: data?.pageSize ?? 10,
        total: data?.total ?? 0,
        onPageChange: (page: number) => {
          setSearchParams({ ...searchParams, page });
        },
      }}
      totalItems={data?.total}
    />
  );
}
