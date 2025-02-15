"use client";

import { api } from "~/trpc/react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Heart, History, ShoppingBag, Mail, Calendar } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { formatDate } from "~/lib/utils";
import { Skeleton } from "./ui/skeleton";

const UserCenter = ({ id }: { id: string }) => {
  const { data: user, isLoading } = api.users.getUser.useQuery({ id });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <p className="text-lg text-muted-foreground">未找到该用户</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* 顶部背景 */}
      <div className="relative h-[30vh] w-full overflow-hidden bg-gradient-to-b from-primary/10 to-background">
        <div className="absolute inset-0 backdrop-blur-3xl" />
      </div>

      {/* 主要内容 */}
      <div className="relative mx-auto max-w-4xl px-4 py-8">
        <div className="lg:-mt-32">
          <Card className="overflow-hidden">
            {/* 用户基本信息 */}
            <div className="relative border-b border-border/50 bg-card p-8">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
                <Avatar className="h-24 w-24 border-4 border-background">
                  <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
                  <AvatarFallback>
                    {user.name?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left">
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground sm:justify-start">
                    {user.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        <span>{user.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>加入于 {formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 用户数据统计 */}
            <div className="grid grid-cols-3 divide-x divide-border/50">
              <div className="p-6 text-center">
                <p className="text-2xl font-bold">{user._count?.likes ?? 0}</p>
                <p className="text-sm text-muted-foreground">点赞</p>
              </div>
              <div className="p-6 text-center">
                <p className="text-2xl font-bold">{user._count?.views ?? 0}</p>
                <p className="text-sm text-muted-foreground">浏览</p>
              </div>
              <div className="p-6 text-center">
                <p className="text-2xl font-bold">{user._count?.orders ?? 0}</p>
                <p className="text-sm text-muted-foreground">订单</p>
              </div>
            </div>
          </Card>

          {/* 操作按钮 */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Button
              variant="outline"
              className="h-auto gap-2 p-4"
              onClick={() => {
                // TODO: 打开点赞历史弹窗
              }}
            >
              <Heart className="h-5 w-5" />
              <div className="flex flex-col items-start">
                <span className="text-base font-semibold">我的点赞</span>
                <span className="text-sm text-muted-foreground">
                  查看点赞过的图书
                </span>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto gap-2 p-4"
              onClick={() => {
                // TODO: 打开浏览历史弹窗
              }}
            >
              <History className="h-5 w-5" />
              <div className="flex flex-col items-start">
                <span className="text-base font-semibold">浏览历史</span>
                <span className="text-sm text-muted-foreground">
                  查看最近浏览的图书
                </span>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto gap-2 p-4"
              onClick={() => {
                // TODO: 打开订单历史弹窗
              }}
            >
              <ShoppingBag className="h-5 w-5" />
              <div className="flex flex-col items-start">
                <span className="text-base font-semibold">我的订单</span>
                <span className="text-sm text-muted-foreground">
                  查看购买记录
                </span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-muted/30">
    <div className="relative h-[30vh] w-full bg-gradient-to-b from-primary/10 to-background" />
    <div className="relative mx-auto max-w-4xl px-4 py-8">
      <div className="lg:-mt-32">
        <Card className="overflow-hidden">
          <div className="border-b border-border/50 bg-card p-8">
            <div className="flex gap-8">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-border/50">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-6">
                <Skeleton className="mx-auto h-8 w-16" />
                <Skeleton className="mx-auto mt-2 h-4 w-12" />
              </div>
            ))}
          </div>
        </Card>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default UserCenter;
