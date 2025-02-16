"use client";

import { api } from "~/trpc/react";
import Image from "next/image";
import { Star, Heart, ShoppingCart, Eye, Clock } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { formatDate } from "~/lib/utils";
import { Badge } from "./ui/badge";
import { useSession } from "next-auth/react";
import PurchaseDialog from "~/components/PurchaseDialog";
import { useState, useEffect } from "react";
import { useRecommendedBooks } from "~/hooks/useRecommendedBooks";
import { useRouter } from "next/navigation";
import { useLoginModal } from "~/hooks/useStore";
import { motion, AnimatePresence } from "framer-motion";

const BookDetail = ({ id }: { id: string }) => {
  const { data: book, isLoading } = api.books.getBookById.useQuery({ id });
  const { data: session } = useSession();
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const utils = api.useUtils();
  const router = useRouter();
  const { onOpen } = useLoginModal();

  // 创建浏览记录
  const createView = api.books.createView.useMutation();

  // 获取浏览量
  const { data: viewCount } = api.books.getBookViews.useQuery({
    bookId: id,
  });

  // 获取点赞状态
  const { data: isLiked } = api.books.checkLiked.useQuery(
    { bookId: id },
    { enabled: !!session?.user },
  );

  // 点赞/取消点赞
  const toggleLike = api.books.toggleLike.useMutation({
    onMutate: async () => {
      await utils.books.checkLiked.cancel({ bookId: id });
      await utils.books.getBookById.cancel({ id });

      const prevLiked = utils.books.checkLiked.getData({ bookId: id });
      const prevBook = utils.books.getBookById.getData({ id });

      utils.books.checkLiked.setData({ bookId: id }, !prevLiked);

      if (prevBook) {
        utils.books.getBookById.setData(
          { id },
          {
            ...prevBook,
            likeCount: prevBook.likeCount + (prevLiked ? -1 : 1),
          },
        );
      }

      return { prevLiked, prevBook };
    },
    onError: (err, newTodo, context) => {
      if (context?.prevLiked !== undefined) {
        utils.books.checkLiked.setData({ bookId: id }, context.prevLiked);
      }
      if (context?.prevBook) {
        utils.books.getBookById.setData({ id }, context.prevBook);
      }
    },
    onSettled: () => {
      void utils.books.checkLiked.invalidate({ bookId: id });
      void utils.books.getBookById.invalidate({ id });
    },
  });

  const handleLike = () => {
    if (!session) {
      onOpen(true);
      return;
    }
    toggleLike.mutate({ bookId: id });
  };

  // 每次访问都创建浏览记录
  useEffect(() => {
    if (session?.user) {
      createView.mutate({ bookId: id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, id]);

  // 获取推荐图书
  const { recommendedBooks, isLoading: isLoadingRecommendations } =
    useRecommendedBooks(id);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!book) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <p className="text-lg text-muted-foreground">未找到该图书</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* 顶部背景 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-[40vh] w-full overflow-hidden bg-gradient-to-b from-primary/10 to-background"
      >
        <div className="absolute inset-0 backdrop-blur-3xl" />
      </motion.div>

      {/* 主要内容 */}
      <div className="relative mx-auto max-w-7xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:-mt-60"
        >
          <div className="grid gap-8 lg:grid-cols-[380px,1fr]">
            {/* 左侧封面 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <Card className="overflow-hidden p-4">
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
                  <Image
                    src={book.cover ?? ""}
                    alt={book.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 350px"
                    priority
                  />
                </div>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">价格</p>
                    <p className="text-2xl font-bold">
                      ¥{book.price.toString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">库存</p>
                    <Badge variant={book.stock > 0 ? "default" : "destructive"}>
                      {book.stock > 0 ? "有货" : "缺货"}
                    </Badge>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      className="flex-1 gap-2"
                      onClick={() => setIsPurchaseOpen(true)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      购买
                    </Button>
                    <Button
                      variant={isLiked ? "default" : "outline"}
                      size="icon"
                      onClick={handleLike}
                      disabled={toggleLike.isPending}
                    >
                      <Heart
                        className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`}
                      />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* 基本信息卡片 */}
              <Card className="space-y-4 p-4">
                <h3 className="font-semibold">图书信息</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">出版社</span>
                    <span>{book.publisher ?? "未知"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">出版日期</span>
                    <span>
                      {book.publishDate ? formatDate(book.publishDate) : "未知"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">ISBN</span>
                    <span>{book.isbn}</span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* 右侧信息 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <Card className="p-6">
                <div className="mb-6">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="outline">{book.category.name}</Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      <span>{viewCount ?? 0} 次浏览</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>最近更新: {formatDate(book.updatedAt)}</span>
                    </div>
                  </div>
                  <h1 className="mb-2 text-3xl font-bold tracking-tight">
                    {book.title}
                  </h1>
                  <p className="text-lg text-muted-foreground">{book.author}</p>
                </div>

                {/* 评分展示 */}
                <div className="mb-6 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i <
                          Math.round(
                            book.reviews.length
                              ? book.reviews.reduce(
                                  (acc, rev) => acc + rev.rating,
                                  0,
                                ) / book.reviews.length
                              : 0,
                          )
                            ? "fill-primary text-primary"
                            : "fill-muted text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold">
                    {book.reviews.length
                      ? (
                          book.reviews.reduce(
                            (acc, rev) => acc + rev.rating,
                            0,
                          ) / book.reviews.length
                        ).toFixed(1)
                      : "暂无评分"}
                  </span>
                </div>

                {/* 描述 */}
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <h3 className="text-xl font-semibold">内容简介</h3>
                  <p className="text-muted-foreground">{book.description}</p>
                </div>
              </Card>

              {/* 推荐阅读 */}
              <Card className="p-6">
                <h3 className="mb-4 text-xl font-semibold">推荐阅读</h3>
                <AnimatePresence mode="wait">
                  {isLoadingRecommendations ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
                    >
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="aspect-[3/4]" />
                      ))}
                    </motion.div>
                  ) : recommendedBooks.length > 0 ? (
                    <motion.div
                      key="content"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
                    >
                      {recommendedBooks.slice(0, 4).map((book, index) => (
                        <motion.div
                          key={book.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="group cursor-pointer"
                          onClick={() => router.push(`/bookdetail/${book.id}`)}
                        >
                          <div className="relative aspect-[3/4] overflow-hidden rounded-md">
                            <Image
                              src={book.cover ?? ""}
                              alt={book.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                              sizes="(max-width: 768px) 50vw, 25vw"
                            />
                          </div>
                          <div className="mt-2">
                            <p className="line-clamp-1 font-medium">
                              {book.title}
                            </p>
                            <p className="line-clamp-1 text-sm text-muted-foreground">
                              {book.author}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.p
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-muted-foreground"
                    >
                      暂无推荐
                    </motion.p>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {book && (
        <PurchaseDialog
          isOpen={isPurchaseOpen}
          setIsOpen={setIsPurchaseOpen}
          book={book}
        />
      )}
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-muted/30">
    <div className="relative h-[40vh] w-full bg-gradient-to-b from-primary/10 to-background" />
    <div className="relative mx-auto max-w-7xl px-4 py-8">
      <div className="lg:-mt-32">
        <div className="grid gap-8 lg:grid-cols-[380px,1fr]">
          <div className="space-y-6">
            <Skeleton className="aspect-[3/4] w-full rounded-lg" />
            <Skeleton className="h-[200px] w-full rounded-lg" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[400px] w-full rounded-lg" />
            <Skeleton className="h-[200px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default BookDetail;
