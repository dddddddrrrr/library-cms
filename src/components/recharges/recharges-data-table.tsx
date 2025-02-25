"use client";

import { PaymentChannel, RechargeStatus, type Prisma } from "@prisma/client";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface Recharge {
  id: string;
  userId: string;
  amount: number | Prisma.Decimal;
  status: RechargeStatus;
  channel: PaymentChannel;
  tradeNo?: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

interface SearchParams {
  page: number;
  pageSize: number;
  status?: RechargeStatus;
  channel?: PaymentChannel;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  sortBy?: "createdAt" | "amount";
  sortOrder?: "asc" | "desc";
}

export function RechargesDataTable() {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    page: 1,
    pageSize: 10,
  });

  const { data, isLoading } = api.recharges.getAll.useQuery(searchParams);

  const columns: ColumnDef<Recharge>[] = [
    {
      accessorKey: "id",
      header: "充值编号",
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
      accessorKey: "amount",
      header: "充值金额",
      cell: ({ row }) => {
        const amount = Number(row.original.amount);
        return `¥${amount.toFixed(2)}`;
      },
    },
    {
      accessorKey: "channel",
      header: "支付渠道",
      cell: ({ row }) => {
        const channel = row.original.channel;
        const channelMap: Record<PaymentChannel, string> = {
          [PaymentChannel.WECHAT]: "微信支付",
          [PaymentChannel.ALIPAY]: "支付宝",
          [PaymentChannel.BANK_CARD]: "银行卡",
        };
        return channelMap[channel] || channel;
      },
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => {
        const status = row.original.status;
        const statusMap: Record<
          RechargeStatus,
          { label: string; variant: BadgeProps["variant"] }
        > = {
          [RechargeStatus.PENDING]: { label: "待支付", variant: "secondary" },
          [RechargeStatus.SUCCESS]: { label: "支付成功", variant: "default" },
          [RechargeStatus.FAILED]: {
            label: "支付失败",
            variant: "destructive",
          },
          [RechargeStatus.CANCELLED]: { label: "已取消", variant: "outline" },
        };

        const statusInfo = statusMap[status] || {
          label: status,
          variant: "outline",
        };

        return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
      },
    },
    {
      accessorKey: "tradeNo",
      header: "交易号",
      cell: ({ row }) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="font-medium">
                {row.original.tradeNo?.substring(0, 8) ?? "-"}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{row.original.tradeNo}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
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
      label: "充值编号",
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
      label: "充值状态",
      type: "select",
      options: [
        { label: "全部状态", value: "all" },
        { label: "待支付", value: RechargeStatus.PENDING },
        { label: "支付成功", value: RechargeStatus.SUCCESS },
        { label: "支付失败", value: RechargeStatus.FAILED },
        { label: "已取消", value: RechargeStatus.CANCELLED },
      ],
    },
    {
      column: "channel",
      label: "支付渠道",
      type: "select",
      options: [
        { label: "全部渠道", value: "all" },
        { label: "微信支付", value: PaymentChannel.WECHAT },
        { label: "支付宝", value: PaymentChannel.ALIPAY },
        { label: "银行卡", value: PaymentChannel.BANK_CARD },
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

    // 构建搜索字符串
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

    // 处理状态
    if (filterValues.status && filterValues.status !== "all") {
      newParams.status = filterValues.status as RechargeStatus;
    }

    // 处理支付渠道
    if (filterValues.channel && filterValues.channel !== "all") {
      newParams.channel = filterValues.channel as PaymentChannel;
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
        data?.recharges?.map((recharge) => ({
          ...recharge,
          amount: Number(recharge.amount),
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
