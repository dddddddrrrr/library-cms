"use client";

import { api } from "~/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import Image from "next/image";
import { Skeleton } from "~/components/ui/skeleton";
import { type Book } from "@prisma/client";
import Slider, { type Settings } from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useRouter } from "next/navigation";
import { useLoginModal } from "~/hooks/useStore";
import { useSession } from "next-auth/react";
import { useRecommendedBooks } from "~/hooks/useRecommendedBooks";
import { motion, AnimatePresence } from "framer-motion";

const LoadingCard = () => {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[200px] w-full" />
      </CardContent>
    </Card>
  );
};

const BookCard = ({ book, index }: { book: Book; index: number }) => {
  const router = useRouter();
  const { onOpen } = useLoginModal();
  const { data: session } = useSession();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        className="group h-full cursor-pointer overflow-hidden border-2 border-border/50 bg-[#F5F5F5] shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 dark:bg-[#181818]"
        onClick={() => {
          if (!session) {
            onOpen(true);
          } else {
            router.push(`/bookdetail/${book.id}`);
          }
        }}
      >
        <CardHeader className="pb-3">
          <CardTitle className="line-clamp-1 text-lg font-bold tracking-tight">
            {book.title}
          </CardTitle>
          <CardDescription className="line-clamp-1 text-sm text-muted-foreground">
            {book.author}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border border-border/50">
            <Image
              src={book.cover ?? ""}
              alt={book.title}
              fill
              className="object-cover transition-all duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const RecommendedBooks = () => {
  const { recommendedBooks, isLoading: isLoadingRecommendations } =
    useRecommendedBooks("");

  const settings: Settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    cssEase: "ease-out",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
    appendDots: (dots: React.ReactNode) => (
      <div className="mt-6">
        <ul className="flex justify-center gap-2"> {dots} </ul>
      </div>
    ),
    customPaging: () => (
      <div className="h-2 w-2 rounded-full bg-primary/20 transition-all duration-300 hover:bg-primary/40" />
    ),
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-xl bg-muted/80 p-8 shadow-md"
    >
      <h2 className="mb-8 text-3xl font-bold tracking-tight">今日推荐</h2>
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
              <LoadingCard key={i} />
            ))}
          </motion.div>
        ) : recommendedBooks.length ? (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mx-auto max-w-7xl"
          >
            <Slider {...settings}>
              {recommendedBooks.map((book, index) => (
                <div key={book.id} className="px-1">
                  <BookCard book={book} index={index} />
                </div>
              ))}
            </Slider>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.section>
  );
};

const BooksByCategory = ({
  books,
}: {
  books: (Book & { category: { name: string } })[];
}) => {
  // 按分类分组图书
  const booksByCategory = books.reduce(
    (acc, book) => {
      const categoryName = book.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(book);
      return acc;
    },
    {} as Record<string, (Book & { category: { name: string } })[]>,
  );

  return (
    <>
      {Object.entries(booksByCategory).map(
        ([category, books], categoryIndex) => (
          <motion.section
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">{category}</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {books.map((book, index) => (
                <BookCard key={book.id} book={book} index={index} />
              ))}
            </div>
          </motion.section>
        ),
      )}
    </>
  );
};

const HomeContent = () => {
  const { data: books, isLoading, error } = api.books.fetchBooks.useQuery();

  return (
    <div className="space-y-16 bg-background p-6">
      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-[50vh] items-center justify-center"
          >
            <p className="text-center text-red-500">出错了！{error.message}</p>
          </motion.div>
        ) : isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <LoadingCard key={index} />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <LoadingCard key={index} />
              ))}
            </div>
          </motion.div>
        ) : !books?.length ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-[50vh] items-center justify-center"
          >
            <p className="text-center text-gray-500">暂无图书数据</p>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-16"
          >
            <RecommendedBooks />
            <div className="space-y-16">
              <h2 className="text-3xl font-bold tracking-tight">全部图书</h2>
              <BooksByCategory books={books} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomeContent;
