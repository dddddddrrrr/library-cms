"use client";

import { OrderStatus, type Prisma } from "@prisma/client";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { DataTable } from "~/components/ui/table/table";
import { api } from "~/trpc/react";
import {
  type Filter,
  type FilterValue,
} from "~/components/ui/table/data-table-filter-box";
import { useState } from "react";
import { Badge, type BadgeProps } from "~/components/ui/badge";

// 定义订单类型，确保与API返回的数据结构匹配
interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  book: {
    id: string;
    title: string;
    cover?: string | null;
  };
}

interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number | Prisma.Decimal;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  orderItems: OrderItem[];
}

interface SearchParams {
  page: number;
  pageSize: number;
  status?: OrderStatus;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  sortBy?: "createdAt" | "totalAmount";
  sortOrder?: "asc" | "desc";
}

export function OrdersDataTable() {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    page: 1,
    pageSize: 10,
  });

  const { data, isLoading } = api.orders.getAll.useQuery(searchParams);

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "id",
      header: "订单编号",
      cell: ({ row }) => {
        return <span className="font-medium">{row.original.id}</span>;
      },
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
      accessorKey: "totalAmount",
      header: "总金额",
      cell: ({ row }) => {
        const amount = Number(row.original.totalAmount);
        return `¥${amount.toFixed(2)}`;
      },
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => {
        const status = row.original.status;
        const statusMap: Record<
          OrderStatus,
          { label: string; variant: BadgeProps["variant"] }
        > = {
          [OrderStatus.PENDING]: { label: "待付款", variant: "secondary" },
          [OrderStatus.PAID]: { label: "已付款", variant: "default" },
          [OrderStatus.SHIPPED]: { label: "已发货", variant: "secondary" },
          [OrderStatus.DELIVERED]: { label: "已送达", variant: "outline" },
          [OrderStatus.CANCELLED]: { label: "已取消", variant: "destructive" },
        };

        const statusInfo = statusMap[status] || {
          label: status,
          variant: "outline",
        };

        return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
      },
    },
    {
      accessorKey: "createdAt",
      header: "创建时间",
      cell: ({ row }) =>
        format(new Date(row.original.createdAt), "yyyy-MM-dd HH:mm:ss"),
    },
  ];

  const filters: Filter[] = [
    {
      column: "id",
      label: "订单编号",
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
      column: "status",
      label: "订单状态",
      type: "select",
      options: [
        { label: "待付款", value: OrderStatus.PENDING },
        { label: "已付款", value: OrderStatus.PAID },
        { label: "已发货", value: OrderStatus.SHIPPED },
        { label: "已送达", value: OrderStatus.DELIVERED },
        { label: "已取消", value: OrderStatus.CANCELLED },
      ],
    },
    {
      column: "createdAt",
      label: "创建时间",
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

    // 构建搜索字符串，组合订单ID、用户名和邮箱
    const searchTerms: string[] = [];

    if (filterValues.id) {
      searchTerms.push(filterValues.id as string);
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

    // 处理状态 (排除 "all" 值)
    if (filterValues.status && filterValues.status !== "all") {
      newParams.status = filterValues.status as OrderStatus;
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
      data={
        data?.orders?.map((order) => ({
          ...order,
          orderItems: order.orderItems.map((item) => ({
            ...item,
            price: Number(item.price),
          })),
        })) ?? []
      }
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
