"use client";

import React, { useState, useEffect } from "react";
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
import { useDebounce } from "~/hooks/useDebounce";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import Image from "next/image";

// 定义搜索结果的类型
type SearchResult = {
  id: string;
  title: string;
  author: string;
  cover: string | null;
  price: string | number;
};

export const Header: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { isOpen, onOpen, onClose } = useLoginModal();
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const { data: balance } = api.users.fetchUserBalance.useQuery(undefined, {
    enabled: !!session,
  });

  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const { mutateAsync: searchBooks } = api.books.search.useMutation();

  useEffect(() => {
    const search = async () => {
      if (debouncedSearch.length === 0) {
        setSearchResults([]);
        return;
      }

      try {
        setIsSearching(true);
        const results = await searchBooks({ query: debouncedSearch });
        // 确保类型匹配
        setSearchResults(results as unknown as SearchResult[]);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    void search();
  }, [debouncedSearch, searchBooks]);
  console.log(searchResults, "searchResults");
  console.log(searchQuery, "searchQuery");

  // 处理弹窗打开关闭
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // 关闭弹窗时清除所有搜索相关状态
      setSearchQuery("");
      setSearchResults([]);
      setIsSearching(false);
    }
  };

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
            {/* 搜索按钮 */}
            <Button
              variant="outline"
              className="hidden md:flex"
              onClick={() => setOpen(true)}
            >
              <Search className="mr-2 h-4 w-4" />
              搜索书籍...
              <kbd className="pointer-events-none ml-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>

            {/* 移动端搜索按钮 */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setOpen(true)}
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

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>搜索书籍</DialogTitle>
          </DialogHeader>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索书籍..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="relative mt-4 max-h-[60vh] space-y-4 overflow-y-auto">
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((book) => (
                  <div
                    key={book.id}
                    className="flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                    onClick={() => {
                      if (session) {
                        router.push(`/bookdetail/${book.id}`);
                        setOpen(false);
                      } else {
                        onOpen(true);
                      }
                    }}
                  >
                    {book.cover && (
                      <Image
                        src={book.cover}
                        alt={book.title}
                        width={100}
                        height={100}
                        className="h-16 w-12 rounded-sm object-cover"
                      />
                    )}
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{book.title}</span>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{book.author}</span>
                        <span>·</span>
                        <span>¥{Number(book.price).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                未找到相关书籍
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                请输入搜索关键词
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};
