"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { api } from "~/trpc/react";
import { useState } from "react";
import Image from "next/image";
import { formatDate } from "~/lib/utils";
import { Badge } from "../ui/badge";
import { useRouter } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { Skeleton } from "../ui/skeleton";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Heart } from "lucide-react";
import { cn } from "~/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface LikesDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const LikesDialog = ({ isOpen, setIsOpen }: LikesDialogProps) => {
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const router = useRouter();
  const utils = api.useUtils();

  const { data, isLoading } = api.users.getUserLikes.useQuery(
    {
      page,
      pageSize,
    },
    {
      enabled: isOpen,
    },
  );

  // 添加日志来检查数据
  console.log("Likes data:", data);

  // 点赞/取消点赞
  const toggleLike = api.books.toggleLike.useMutation({
    onMutate: async ({ bookId }) => {
      // 取消之前的请求
      await utils.books.checkLiked.cancel({ bookId });
      await utils.users.getUserLikes.cancel();

      // 获取之前的数据
      const prevLiked = utils.books.checkLiked.getData({ bookId });
      const prevLikes = utils.users.getUserLikes.getData();

      // 乐观更新
      if (prevLikes) {
        utils.users.getUserLikes.setData(
          { page, pageSize },
          {
            ...prevLikes,
            items: prevLikes.items.filter((like) => like.book.id !== bookId),
            metadata: {
              ...prevLikes.metadata,
              total: prevLikes.metadata.total - 1,
            },
          },
        );
      }

      return { prevLiked, prevLikes };
    },
    onError: (err, newTodo, context) => {
      // 发生错误时恢复数据
      if (context?.prevLikes) {
        utils.users.getUserLikes.setData({ page, pageSize }, context.prevLikes);
      }
    },
    onSettled: () => {
      // 重新获取数据
      void utils.users.getUserLikes.invalidate();
      void utils.users.getUser.invalidate();
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>我的点赞</DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {Array.from({ length: pageSize }).map((_, i) => (
                <Card key={i} className="space-y-2 p-3">
                  <Skeleton className="aspect-[3/4]" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </Card>
              ))}
            </motion.div>
          ) : data?.items.length ? (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.items.map((like, index) => (
                  <motion.div
                    key={like.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="group relative overflow-hidden p-3 transition-colors hover:bg-muted/50">
                      <div
                        className="cursor-pointer"
                        onClick={() => {
                          setIsOpen(false);
                          router.push(`/bookdetail/${like.book.id}`);
                        }}
                      >
                        <div className="relative aspect-[3/4] overflow-hidden rounded-md">
                          <Image
                            src={like.book.cover ?? ""}
                            alt={like.book.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                        <div className="mt-3">
                          <h3 className="line-clamp-1 font-medium">
                            {like.book.title}
                          </h3>
                          <div className="mt-2 flex items-center gap-2">
                            <Badge variant="outline">
                              {like.book.category.name}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(like.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="default"
                        size="icon"
                        className="absolute bottom-4 right-4 bg-background/80 backdrop-blur hover:bg-background/90"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike.mutate({ bookId: like.book.id });
                        }}
                        disabled={toggleLike.isPending}
                      >
                        <Heart
                          className={cn(
                            "h-4 w-4",
                            "fill-current",
                            toggleLike.isPending && "opacity-50",
                          )}
                        />
                      </Button>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* 分页器 */}
              {data.metadata.pageCount > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Pagination className="mt-4">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          aria-disabled={page === 1}
                        />
                      </PaginationItem>

                      {Array.from({ length: data.metadata.pageCount }).map(
                        (_, i) => {
                          const pageNumber = i + 1;
                          // 显示第一页、最后一页、当前页及其相邻页
                          if (
                            pageNumber === 1 ||
                            pageNumber === data.metadata.pageCount ||
                            Math.abs(pageNumber - page) <= 1
                          ) {
                            return (
                              <PaginationItem key={pageNumber}>
                                <PaginationLink
                                  isActive={page === pageNumber}
                                  onClick={() => setPage(pageNumber)}
                                >
                                  {pageNumber}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          }
                          // 显示省略号
                          if (Math.abs(pageNumber - page) === 2) {
                            return (
                              <PaginationItem key={pageNumber}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            );
                          }
                          return null;
                        },
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setPage((p) =>
                              Math.min(data.metadata.pageCount, p + 1),
                            )
                          }
                          aria-disabled={page === data.metadata.pageCount}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8 text-center text-muted-foreground"
            >
              暂无点赞记录
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default LikesDialog;
