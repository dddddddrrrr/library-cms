"use client";

import { api } from "~/trpc/react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import Image from "next/image";
import { formatDate } from "~/lib/utils";
import { Badge } from "./ui/badge";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Book, Clock } from "lucide-react";
import { useSession } from "next-auth/react";

const MyBook = ({ id }: { id: string }) => {
  const pageSize = 12;
  const router = useRouter();
  const { data: session } = useSession();

  // 检查是否是当前用户查看自己的书架
  const isCurrentUser = session?.user.id === id;

  const { data, isLoading } = api.books.getPurchasedBooks.useQuery(
    {
      userId: id,
      limit: pageSize,
    },
    {
      enabled: !!id, // 只在有 id 时才发起请求
    },
  );

  // 如果不是当前用户且没有权限，显示提示
  if (!isLoading && !isCurrentUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">
            你没有权限查看此用户的书架
          </p>
          <Button
            className="mt-4"
            onClick={() => router.push(`/my-book/${session?.user.id}`)}
          >
            查看我的书架
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-8 bg-muted/30 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">我的书架</h1>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {Array.from({ length: pageSize }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4]" />
            ))}
          </motion.div>
        ) : !data?.items.length ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-[40vh] flex-col items-center justify-center gap-4 text-muted-foreground"
          >
            <Book className="h-12 w-12" />
            <p className="text-lg">暂无已购图书</p>
            <Button onClick={() => router.push("/")}>去购买</Button>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {data.items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group overflow-hidden p-3 transition-colors hover:bg-muted/50">
                  <div
                    className="cursor-pointer"
                    onClick={() => router.push(`/read-book/${item.book.id}`)}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden rounded-md">
                      <Image
                        src={item.book.cover ?? ""}
                        alt={item.book.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <div className="mt-3">
                      <h3 className="line-clamp-1 text-lg font-medium">
                        {item.book.title}
                      </h3>
                      <p className="line-clamp-1 text-sm text-muted-foreground">
                        {item.book.author}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline">
                          {item.book.category.name}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>购买于 {formatDate(item.order.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyBook;
