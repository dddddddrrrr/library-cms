"use client";

import { api } from "~/trpc/react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  Settings,
  Sun,
  Moon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "~/lib/utils";
import { useTheme } from "next-themes";

interface ReadBookProps {
  bookId: string;
  chapterId?: string;
}

const ReadBook = ({ bookId, chapterId }: ReadBookProps) => {
  const { data: session } = useSession();
  const router = useRouter();

  const { theme, setTheme } = useTheme();
  const [fontSize, setFontSize] = useState(18);
  const [showToolbar, setShowToolbar] = useState(true);

  // 获取书籍信息
  const { data: book } = api.books.getBookById.useQuery({ id: bookId });

  // 获取章节列表
  const { data: chapters } = api.books.getChapters.useQuery({ bookId });

  // 获取当前章节
  const { data: currentChapter, isLoading: isLoadingChapter } =
    api.books.getChapter.useQuery(
      {
        bookId,
        chapterId: chapterId ?? chapters?.[0]?.id ?? "",
      },
      {
        enabled: !!bookId && (!!chapterId || !!chapters?.[0]?.id),
        retry: 3,
      },
    );

  // 更新阅读进度
  const updateProgress = api.books.updateReadingProgress.useMutation();

  // 自动保存阅读进度
  useEffect(() => {
    if (session && currentChapter) {
      const timer = setTimeout(() => {
        updateProgress.mutate({
          chapterId: currentChapter.id,
          progress: 100, // 简单起见，这里假设读完整章
        });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [session, currentChapter, updateProgress]);

  if (!book || isLoadingChapter) {
    return <LoadingSkeleton />;
  }

  const currentIndex =
    chapters?.findIndex((c) => c.id === currentChapter?.id) ?? 0;

  return (
    <div className="min-h-screen">
      {/* 顶部工具栏 */}
      <AnimatePresence>
        {showToolbar && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed left-0 right-0 top-0 z-50 border-b bg-background/80 backdrop-blur-sm"
          >
            <div className="container flex h-16 items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push(`/my-book/${session?.user.id}`)}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-lg font-medium">{book.title}</h1>
              </div>

              <div className="flex items-center gap-2">
                {/* 章节目录 */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <SheetHeader>
                      <SheetTitle>目录</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="mt-4 h-[calc(100vh-8rem)]">
                      <div className="space-y-1">
                        {chapters?.map((chapter) => (
                          <Button
                            key={chapter.id}
                            variant="ghost"
                            className={cn(
                              "w-full justify-start",
                              chapter.id === currentChapter?.id &&
                                "bg-primary/10 font-medium text-primary",
                            )}
                            onClick={() =>
                              router.push(`/read-book/${bookId}/${chapter.id}`)
                            }
                          >
                            {chapter.title}
                          </Button>
                        ))}
                      </div>
                    </ScrollArea>
                  </SheetContent>
                </Sheet>

                {/* 设置 */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>设置</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4 space-y-4">
                      {/* 主题切换 */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">主题</h3>
                        <div className="flex gap-2">
                          <Button
                            variant={theme === "light" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTheme("light")}
                            className="w-24"
                          >
                            <Sun className="mr-2 h-4 w-4" />
                            浅色
                          </Button>
                          <Button
                            variant={theme === "dark" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTheme("dark")}
                            className="w-24"
                          >
                            <Moon className="mr-2 h-4 w-4" />
                            深色
                          </Button>
                        </div>
                      </div>

                      {/* 字体大小 */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">字体大小</h3>
                        <div className="flex items-center gap-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setFontSize((s) => Math.max(14, s - 2))
                            }
                          >
                            A-
                          </Button>
                          <span className="min-w-[3ch] text-center">
                            {fontSize}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setFontSize((s) => Math.min(24, s + 2))
                            }
                          >
                            A+
                          </Button>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 阅读区域 */}
      <div
        className="mx-auto max-w-2xl px-4 py-8"
        onClick={() => setShowToolbar((show) => !show)}
      >
        <div
          className="prose prose-lg mx-auto dark:prose-invert"
          style={{ fontSize: `${fontSize}px` }}
        >
          <h2 className="text-center">{currentChapter?.title}</h2>
          <div
            className="whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: currentChapter?.content ?? "" }}
          />
        </div>

        {/* 翻页按钮 */}
        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={() =>
              router.push(
                `/read-book/${bookId}/${chapters?.[currentIndex - 1]?.id}`,
              )
            }
            disabled={currentIndex <= 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            上一章
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              router.push(
                `/read-book/${bookId}/${chapters?.[currentIndex + 1]?.id}`,
              )
            }
            disabled={currentIndex >= (chapters?.length ?? 0) - 1}
          >
            下一章
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="min-h-screen">
    <div className="fixed left-0 right-0 top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center">
        <Skeleton className="h-6 w-32" />
      </div>
    </div>
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-8">
      <Skeleton className="mx-auto h-8 w-48" />
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton key={i} className="h-6 w-full" />
      ))}
    </div>
  </div>
);

export default ReadBook;
