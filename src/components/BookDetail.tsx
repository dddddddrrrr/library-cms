"use client";

import { api } from "~/trpc/react";
import Image from "next/image";
import { Star, Heart, ShoppingCart, Eye } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { formatDate } from "~/lib/utils";
import { Badge } from "./ui/badge";
import { loadStripe } from "@stripe/stripe-js";
import { useSession } from "next-auth/react";

const BookDetail = ({ id }: { id: string }) => {
  const { data: book, isLoading } = api.books.getBookById.useQuery({ id });
  const { data: session } = useSession();
  console.log(session);

  const { mutateAsync: createBookCheckoutSession } =
    api.payment.createBookCheckoutSession.useMutation();

  const handleBuyBook = async () => {
    try {
      const result = await createBookCheckoutSession({
        book: {
          id: book?.id ?? "",
          title: book?.title ?? "",
          price: Number(book?.price) ?? 0,
          cover: book?.cover ?? "",
        },
      });
      if (result.sessionId) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        const stripe = await loadStripe(
          process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
        );
        if (stripe) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          await stripe.redirectToCheckout({ sessionId: result.sessionId });
        } else {
          console.error("Stripe failed to initialize.");
        }
      } else {
        console.error("No session ID returned from server");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    }
  };

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
      <div className="relative h-[40vh] w-full overflow-hidden bg-gradient-to-b from-primary/10 to-background">
        <div className="absolute inset-0 backdrop-blur-3xl" />
      </div>

      {/* 主要内容 */}
      <div className="relative mx-auto max-w-7xl px-4 py-8">
        <div className="lg:-mt-60">
          <div className="grid gap-8 lg:grid-cols-[380px,1fr]">
            {/* 左侧封面 */}
            <div className="space-y-6">
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
                      onClick={() => handleBuyBook()}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      购买
                    </Button>
                    <Button variant="outline" size="icon">
                      <Heart className="h-4 w-4" />
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
            </div>

            {/* 右侧信息 */}
            <div className="space-y-6">
              <Card className="p-6">
                <div className="mb-6">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="outline">{book.category.name}</Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      <span>{book.reviews.length} 次浏览</span>
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
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {/* 这里可以添加相关推荐的图书 */}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
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
