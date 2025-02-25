"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "~/components/ui/table/table";
import { api } from "~/trpc/react";
import { formatDate } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";
import type {
  Filter,
  FilterValue,
} from "~/components/ui/table/data-table-filter-box";
import { type UserRole } from "@prisma/client";
import { type Decimal } from "@prisma/client/runtime/library";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { toast } from "sonner";
import { Loader2} from 'lucide-react'

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
      column: "name",
      label: "用户名",
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
      column: "createdAt",
      label: "注册时间",
      type: "date-range",
    },
    {
      column: "balance",
      label: "余额",
      type: "number-range",
      precision: 2,
    },
  ]);

  const [searchParams, setSearchParams] = useState({
    page: 1,
    pageSize: 10,
  });

  // 余额修改相关状态
  const [isBalanceDialogOpen, setIsBalanceDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newBalance, setNewBalance] = useState("");

  const { data, isLoading, refetch } =
    api.users.fetchAllUsers.useQuery(searchParams);

  // 余额更新 mutation
  const updateBalanceMutation = api.users.updateUserBalance.useMutation({
    onSuccess: () => {
      toast.success("余额更新成功");
      setIsBalanceDialogOpen(false);
      void refetch();
    },
    onError: (error) => {
      toast.error(`更新失败: ${error.message}`);
    },
  });

  // 处理余额更新
  const handleUpdateBalance = () => {
    if (!selectedUser || !newBalance || isNaN(Number(newBalance))) {
      toast.error("请输入有效的余额");
      return;
    }

    updateBalanceMutation.mutate({
      id: selectedUser.id,
      balance: Number(newBalance),
    });
  };

  // 打开余额修改对话框
  const openBalanceDialog = (user: User) => {
    setSelectedUser(user);
    setNewBalance(user.balance.toString());
    setIsBalanceDialogOpen(true);
  };

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
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
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
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openBalanceDialog(user)}
            >
              修改余额
            </Button>
          </div>
        );
      },
    },
  ];

  const handleSearch = (filterValues: Record<string, FilterValue>) => {
    console.log("搜索参数:", filterValues);

    // 构建新的搜索参数
    const newParams: Record<string, unknown> = {
      page: 1, // 重置到第一页
      pageSize: searchParams.pageSize,
    };

    // 处理普通字段
    if (filterValues.name) {
      newParams.name = filterValues.name;
    }

    if (filterValues.role) {
      newParams.role = filterValues.role;
    }

    // 处理日期范围
    if (Array.isArray(filterValues.createdAt) && filterValues.createdAt[0]) {
      const [startDate, endDate] = filterValues.createdAt;
      if (startDate) {
        newParams.createdAtStart = new Date(
          startDate.setHours(0, 0, 0, 0),
        ).toISOString();
      }
      if (endDate) {
        newParams.createdAtEnd = new Date(
          endDate.setHours(23, 59, 59, 999),
        ).toISOString();
      }
    }

    // 处理数字范围
    if (filterValues.balanceMin) {
      newParams.balanceMin = filterValues.balanceMin;
    }

    if (filterValues.balanceMax) {
      newParams.balanceMax = filterValues.balanceMax;
    }

    console.log("新的搜索参数:", newParams);

    // 更新搜索参数
    setSearchParams(newParams as typeof searchParams);
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
        onSearch={handleSearch}
        pagination={{
          pageCount: data?.metadata.pageCount ?? 0,
          page: data?.metadata.page ?? 1,
          pageSize: data?.metadata.pageSize ?? 10,
          total: data?.metadata.total ?? 0,
          onPageChange: (page: number) => {
            setSearchParams({ ...searchParams, page });
          },
        }}
        totalItems={data?.metadata.total}
      />

      {/* 修改余额对话框 */}
      <Dialog open={isBalanceDialogOpen} onOpenChange={setIsBalanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>修改用户余额</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                用户
              </Label>
              <div className="col-span-3">{selectedUser?.name}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newBalance" className="text-right">
                余额
              </Label>
              <Input
                id="newBalance"
                type="number"
                step="0.01"
                min="0"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBalanceDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              onClick={handleUpdateBalance}
              disabled={updateBalanceMutation.isPending}
            >
              {updateBalanceMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  更新中...
                </>
              ) : (
                "确认更新"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
