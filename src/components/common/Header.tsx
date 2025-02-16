"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import UserProfile from "~/components/user/UserProfile";
import LoginModal from "~/components/LoginDialog";
import { Search, BookOpen, Wallet, Plus } from "lucide-react";
import { ThemeSwitch } from "~/components/ThemeSwitch";
import RechargeDialog from "~/components/RechargeDialog";
import { useLoginModal } from "~/hooks/useStore";
import { api } from "~/trpc/react";

export const Header: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { isOpen, onOpen, onClose } = useLoginModal();
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const { data: balance } = api.users.fetchUserBalance.useQuery(undefined, {
    enabled: !!session,
  });

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
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                      <span>
                        余额：
                        <span className="font-medium">
                          ¥{balance ?? "0.00"}
                        </span>
                      </span>
                    </div>
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <UserProfile />
              </div>
            ) : (
              <div className="flex gap-2">
                <Button onClick={() => onOpen(true)}>登录</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <LoginModal isOpen={isOpen} onClose={() => onClose(false)} />
      <RechargeDialog isOpen={isRechargeOpen} setIsOpen={setIsRechargeOpen} />
    </header>
  );
};
