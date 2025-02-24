"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "~/components/ui/table/table";
import { api } from "~/trpc/react";
import { formatDate } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";
import type { Filter } from "~/components/ui/table/data-table-filter-box";
import { type UserRole } from "@prisma/client";
import { type Decimal } from "@prisma/client/runtime/library";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  balance: Decimal;
  createdAt: Date;
  updatedAt: Date;
}

export default function UserPage() {
  const [filters] = useState<Filter[]>([
    {
      column: "search",
      label: "搜索",
      type: "input",
    },
    {
      column: "role",
      label: "角色",
      type: "select",
      options: [
        { label: "管理员", value: "ADMIN" },
        { label: "用户", value: "USER" },
      ],
    },
    {
      column: "balance",
      label: "余额",
      type: "number-range",
      precision: 2,
    },
    {
      column: "createdAt",
      label: "注册时间",
      type: "date-range",
    },
  ]);

  const [searchParams, setSearchParams] = useState({
    page: 1,
    pageSize: 10,
  });

  const { data, isLoading } = api.users.fetchAllUsers.useQuery(searchParams);

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "用户名",
    },
    {
      accessorKey: "email",
      header: "邮箱",
    },
    {
      accessorKey: "role",
      header: "角色",
      cell: ({ row }) => {
        const role = row.getValue("role");
        return (
          <Badge variant={role === "ADMIN" ? "default" : "secondary"}>
            {role === "ADMIN" ? "管理员" : "用户"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "balance",
      header: "余额",
      cell: ({ row }) => {
        const balance = row.getValue("balance");
        return `¥${balance}`;
      },
    },
    {
      accessorKey: "createdAt",
      header: "注册时间",
      cell: ({ row }) => {
        return formatDate(row.getValue("createdAt"));
      },
    },
  ];

  const handleSearch = (filterValues: Record<string, unknown>) => {
    const newParams = {
      page: 1,
      pageSize: 10,
      search: filterValues.search as string,
      role: filterValues.role as UserRole | undefined,
      balanceRange: filterValues.balance
        ? {
            min: (filterValues.balance as [number, number])[0],
            max: (filterValues.balance as [number, number])[1],
          }
        : undefined,
      dateRange: filterValues.createdAt
        ? {
            from: (filterValues.createdAt as [Date, Date])[0],
            to: (filterValues.createdAt as [Date, Date])[1],
          }
        : undefined,
    };

    setSearchParams(newParams);
  };

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({
      ...prev,
      page,
    }));
  };

  return (
    <div className="space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">用户管理</h1>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        loading={isLoading}
        filters={filters}
        onStateChange={(state) => {
          const newParams = {
            page: state.pagination.pageIndex + 1,
            pageSize: state.pagination.pageSize,
            ...state.filters,
          };
          setSearchParams(newParams);
        }}
        totalItems={data?.metadata.total}
      />
    </div>
  );
}
