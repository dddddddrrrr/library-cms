"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import UserProfile from "~/components/user/UserProfile";
import LoginModal from "~/components/LoginDialog";
import { Search, BookOpen, Wallet, Plus } from "lucide-react";
import { Input } from "~/components/ui/input";
import { ThemeSwitch } from "~/components/ThemeSwitch";
import { Badge } from "~/components/ui/badge";
import RechargeDialog from "~/components/RechargeDialog";

export const Header: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo 部分 */}
          <div
            onClick={() => router.push("/")}
            className="flex cursor-pointer items-center gap-2 transition-colors hover:opacity-80"
          >
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">智慧书城</span>
          </div>

          {/* 搜索框 */}
          <div className="hidden flex-1 md:block lg:max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder="搜索书籍、作者或分类..."
                className="w-full bg-muted/50 pl-10"
              />
            </div>
          </div>

          {/* 用户相关 */}
          <div className="flex items-center gap-4">
            {/* 移动端搜索按钮 */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => {
                /* TODO: 实现移动端搜索 */
              }}
            >
              <Search className="h-5 w-5" />
            </Button>
            <ThemeSwitch />

            {session ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className="flex cursor-pointer items-center gap-2 rounded-full bg-muted/50 px-4 py-2 hover:bg-muted"
                    onClick={() => setIsRechargeOpen(true)}
                  >
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      ¥{session.user.balance ?? "0.00"}
                    </span>
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <UserProfile />
              </div>
            ) : (
              <div className="flex gap-2">
                <Button onClick={() => setIsOpen(true)}>登录</Button>
              </div>
            )}
          </div>
        </div>
      </div>



      <LoginModal isOpen={isOpen} setIsOpen={setIsOpen} />
      <RechargeDialog isOpen={isRechargeOpen} setIsOpen={setIsRechargeOpen} />
    </header>
  );
};
