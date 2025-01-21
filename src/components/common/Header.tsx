"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import UserProfile from "~/components/user/UserProfile";
import LoginModal from "~/components/LoginDialog";
import { Search, BookOpen } from "lucide-react";
import { Input } from "~/components/ui/input";
import { ThemeSwitch } from "~/components/ThemeSwitch";

export const Header: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo 部分 */}
          <div
            onClick={() => router.push("/")}
            className="flex cursor-pointer items-center gap-2 transition-colors hover:opacity-80"
          >
            <BookOpen className="text-primary h-6 w-6" />
            <span className="text-xl font-bold">智慧书城</span>
          </div>

          {/* 搜索框 */}
          <div className="hidden flex-1 md:block lg:max-w-xl">
            <div className="relative">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                placeholder="搜索书籍、作者或分类..."
                className="bg-muted/50 w-full pl-10"
              />
            </div>
          </div>
          {/* 导航菜单 */}
          <nav className="hidden items-center gap-6 md:flex">
            <Button
              variant="ghost"
              className="text-foreground/60 hover:text-foreground/80"
              onClick={() => router.push("/books")}
            >
              全部书籍
            </Button>
            <Button
              variant="ghost"
              className="text-foreground/60 hover:text-foreground/80"
              onClick={() => router.push("/categories")}
            >
              分类浏览
            </Button>
            {/* {session?.user?.role === "ADMIN" && (
              <Button
                variant="ghost"
                className="text-foreground/60 hover:text-foreground/80"
                onClick={() => router.push("/admin")}
              >
                后台管理
              </Button>
            )} */}
          </nav>
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
              <UserProfile />
            ) : (
              <div className="flex gap-2">
                <Button onClick={() => setIsOpen(true)}>登录</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 移动端导航菜单 */}
      <nav className="border-t md:hidden">
        <div className="container flex justify-between px-4 py-2">
          <Button
            variant="ghost"
            className="text-foreground/60 hover:text-foreground/80 flex-1"
            onClick={() => router.push("/books")}
          >
            书籍
          </Button>
          <Button
            variant="ghost"
            className="text-foreground/60 hover:text-foreground/80 flex-1"
            onClick={() => router.push("/categories")}
          >
            分类
          </Button>
        </div>
      </nav>

      <LoginModal isOpen={isOpen} setIsOpen={setIsOpen} />
    </header>
  );
};
