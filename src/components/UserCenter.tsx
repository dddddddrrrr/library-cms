"use client";

import { api } from "~/trpc/react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  Heart,
  History,
  ShoppingBag,
  Mail,
  Calendar,
  Wallet,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { formatDate } from "~/lib/utils";
import { Skeleton } from "./ui/skeleton";
import LikesDialog from "./user/LikesDialog";
import { useState } from "react";
import ViewsDialog from "./user/ViewsDialog";
import OrdersDialog from "./user/OrdersDialog";
import { motion } from "framer-motion";

const UserCenter = ({ id }: { id: string }) => {
  const { data: user, isLoading } = api.users.getUser.useQuery({ id });
  const [isLikesDialogOpen, setIsLikesDialogOpen] = useState(false);
  const [isViewsDialogOpen, setIsViewsDialogOpen] = useState(false);
  const [isOrdersDialogOpen, setIsOrdersDialogOpen] = useState(false);

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
      {/* 顶部背景 - 添加渐变动画 */}
      <div className="relative h-[35vh] w-full overflow-hidden bg-gradient-to-b from-primary/20 via-primary/10 to-background">
        <div className="absolute inset-0 backdrop-blur-3xl">
          <div className="bg-grid-white/10 absolute inset-0" />
        </div>
      </div>

      {/* 主要内容 */}
      <div className="relative mx-auto max-w-5xl px-4 py-8">
        <div className="lg:-mt-40">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="overflow-hidden border-2">
              {/* 用户基本信息 */}
              <div className="relative border-b border-border/50 bg-card/50 p-8 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
                  <Avatar className="h-28 w-28 border-4 border-background shadow-xl">
                    <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
                    <AvatarFallback className="text-2xl">
                      {user.name?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center sm:text-left">
                    <h1 className="bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-4xl font-bold tracking-tight">
                      {user.name}
                    </h1>
                    <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground sm:justify-start">
                      {user.email && (
                        <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1">
                          <Mail className="h-4 w-4" />
                          <span>{user.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1">
                        <Calendar className="h-4 w-4" />
                        <span>加入于 {formatDate(user.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1">
                        <Wallet className="h-4 w-4" />
                        <span>
                          余额：
                          <span className="font-medium">
                            ¥{user.balance.toString()}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 用户数据统计 */}
              <div className="grid grid-cols-3 divide-x divide-border/50 bg-gradient-to-r from-muted/50 to-background">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-8 text-center hover:bg-muted/50"
                >
                  <p className="text-3xl font-bold">
                    {user._count?.likes ?? 0}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">点赞</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-8 text-center transition-colors hover:bg-muted/50"
                >
                  <p className="text-3xl font-bold">
                    {user._count?.views ?? 0}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">浏览</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-8 text-center transition-colors hover:bg-muted/50"
                >
                  <p className="text-3xl font-bold">
                    {user._count?.orders ?? 0}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">订单</p>
                </motion.div>
              </div>
            </Card>
          </motion.div>

          {/* 操作按钮 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            <Button
              variant="outline"
              className="group h-auto gap-3 border-2 p-6 transition-all hover:border-primary/50 hover:bg-primary/5"
              onClick={() => {
                setIsLikesDialogOpen(true);
              }}
            >
              <Heart className="h-6 w-6 transition-colors group-hover:text-primary" />
              <div className="flex flex-col items-start">
                <span className="text-base font-semibold">我的点赞</span>
                <span className="text-sm text-muted-foreground">
                  查看点赞过的图书
                </span>
              </div>
            </Button>
            <Button
              variant="outline"
              className="group h-auto gap-3 border-2 p-6 transition-all hover:border-primary/50 hover:bg-primary/5"
              onClick={() => {
                setIsViewsDialogOpen(true);
              }}
            >
              <History className="h-6 w-6 transition-colors group-hover:text-primary" />
              <div className="flex flex-col items-start">
                <span className="text-base font-semibold">浏览历史</span>
                <span className="text-sm text-muted-foreground">
                  查看最近浏览的图书
                </span>
              </div>
            </Button>
            <Button
              variant="outline"
              className="group h-auto gap-3 border-2 p-6 transition-all hover:border-primary/50 hover:bg-primary/5"
              onClick={() => {
                setIsOrdersDialogOpen(true);
              }}
            >
              <ShoppingBag className="h-6 w-6 transition-colors group-hover:text-primary" />
              <div className="flex flex-col items-start">
                <span className="text-base font-semibold">我的订单</span>
                <span className="text-sm text-muted-foreground">
                  查看购买记录
                </span>
              </div>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Dialogs */}
      <LikesDialog
        isOpen={isLikesDialogOpen}
        setIsOpen={setIsLikesDialogOpen}
      />
      <ViewsDialog
        isOpen={isViewsDialogOpen}
        setIsOpen={setIsViewsDialogOpen}
      />
      <OrdersDialog
        isOpen={isOrdersDialogOpen}
        setIsOpen={setIsOrdersDialogOpen}
      />
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
