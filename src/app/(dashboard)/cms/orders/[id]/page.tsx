"use client";

import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { ArrowLeft, Package, User, Calendar, CreditCard } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { OrderStatus } from "@prisma/client";
import { format } from "date-fns";
import Image from "next/image";
import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const { data: order, isLoading } = api.orders.getById.useQuery(
    { id: orderId },
    {
      enabled: !!orderId,
      retry: false,
      onError: () => {
        router.push("/dashboard/cms/orders");
      },
    },
  );

  // 订单状态映射
  const statusMap = {
    [OrderStatus.PENDING]: { label: "待付款", variant: "warning" },
    [OrderStatus.PAID]: { label: "已付款", variant: "default" },
    [OrderStatus.SHIPPED]: { label: "已发货", variant: "secondary" },
    [OrderStatus.DELIVERED]: { label: "已送达", variant: "success" },
    [OrderStatus.CANCELLED]: { label: "已取消", variant: "destructive" },
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-40" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="mt-6 h-96" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="mb-4 text-2xl font-bold">订单不存在</h2>
          <Button onClick={() => router.push("/dashboard/cms/orders")}>
            返回订单列表
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = statusMap[order.status] || {
    label: order.status,
    variant: "outline",
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/cms/orders")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          返回订单列表
        </Button>
        <h1 className="text-2xl font-bold">订单详情</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 订单信息卡片 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              订单信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">订单编号</span>
                <span className="font-medium">{order.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">订单状态</span>
                <Badge variant={statusInfo.variant as any}>
                  {statusInfo.label}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">订单总额</span>
                <span className="font-medium">
                  ¥{Number(order.totalAmount).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">创建时间</span>
                <span>
                  {format(new Date(order.createdAt), "yyyy-MM-dd HH:mm:ss")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">更新时间</span>
                <span>
                  {format(new Date(order.updatedAt), "yyyy-MM-dd HH:mm:ss")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 用户信息卡片 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              用户信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">用户ID</span>
                <span className="font-medium">{order.user.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">用户名</span>
                <span className="font-medium">{order.user.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">邮箱</span>
                <span>{order.user.email}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 订单项目表格 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            订单项目
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">图片</TableHead>
                <TableHead>书籍</TableHead>
                <TableHead className="text-right">单价</TableHead>
                <TableHead className="text-right">数量</TableHead>
                <TableHead className="text-right">小计</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.orderItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.book.cover ? (
                      <div className="relative h-16 w-12 overflow-hidden rounded">
                        <Image
                          src={item.book.cover}
                          alt={item.book.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-16 w-12 items-center justify-center rounded bg-muted">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{item.book.title}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    ¥{Number(item.price).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right font-medium">
                    ¥{(Number(item.price) * item.quantity).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4} className="text-right font-medium">
                  总计
                </TableCell>
                <TableCell className="text-right font-bold">
                  ¥{Number(order.totalAmount).toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
