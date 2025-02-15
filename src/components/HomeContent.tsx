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
import { useEffect, useState } from "react";
import Slider, { type Settings } from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useRouter } from "next/navigation";

// 工具函数：随机打乱数组
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]] as [T, T];
  }
  return newArray;
}

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

const BookCard = ({ book }: { book: Book }) => {
  const router = useRouter();
  return (
    <Card
      className="group h-full cursor-pointer overflow-hidden border-2 border-border/50 bg-[#F5F5F5] shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 dark:bg-[#181818]"
      onClick={() => router.push(`/bookdetail/${book.id}`)}
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
  );
};

const RecommendedBooks = ({ books }: { books: Book[] }) => {
  const [shuffledBooks, setShuffledBooks] = useState<Book[]>([]);

  useEffect(() => {
    setShuffledBooks(shuffleArray(books).slice(0, 21));
  }, [books]);

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

  if (!shuffledBooks.length) return null;

  return (
    <section className="relative rounded-xl bg-muted/80 p-8 shadow-md">
      <h2 className="mb-8 text-3xl font-bold tracking-tight">今日推荐</h2>
      <div className="mx-auto max-w-7xl">
        <Slider {...settings}>
          {shuffledBooks.map((book) => (
            <div key={book.id} className="px-1">
              <BookCard book={book} />
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

const HomeContent = () => {
  const { data: books, isLoading, error } = api.books.fetchBooks.useQuery();

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-center text-red-500">出错了！{error.message}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
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
      </div>
    );
  }

  if (!books?.length) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-center text-gray-500">暂无图书数据</p>
      </div>
    );
  }

  return (
    <div className="space-y-16 bg-background p-6">
      <RecommendedBooks books={books} />
      <section>
        <h2 className="mb-8 text-3xl font-bold tracking-tight">全部图书</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomeContent;
