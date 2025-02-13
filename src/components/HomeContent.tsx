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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import Slider, {type Settings } from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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
  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="line-clamp-1">{book.title}</CardTitle>
        <CardDescription className="line-clamp-1">
          {book.author}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md">
          <Image
            src={book.cover ?? ""}
            alt={book.title}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
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
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow:4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    cssEase: "linear",
    arrows: true,
    prevArrow: (
      <Button
        variant="ghost"
        size="icon"
        className="absolute -left-12 top-1/2 -translate-y-1/2 transform"
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>
    ),
    nextArrow: (
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-12 top-1/2 -translate-y-1/2 transform"
      >
        <ChevronRight className="h-8 w-8" />
      </Button>
    ),
    appendDots: (dots: React.ReactNode) => (
      <div className="mt-4">
        <ul className="flex justify-center gap-2"> {dots} </ul>
      </div>
    ),
    customPaging: () => (
      <Button
        variant="outline"
        size="icon"
        className="h-2 w-2 rounded-full p-0"
      />
    ),
  };

  if (!shuffledBooks.length) return null;

  return (
    <div className="relative p-4">
      <h2 className="mb-6 text-2xl font-bold">今日推荐</h2>
      <div className="mx-auto max-w-6xl px-4">
        <Slider {...settings}>
          {shuffledBooks.map((book) => (
            <div key={book.id} className="px-2">
              <BookCard book={book} />
            </div>
          ))}
        </Slider>
      </div>
    </div>
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
    <div className="space-y-12 p-4">
      <RecommendedBooks books={books} />
      <div>
        <h2 className="mb-6 text-2xl font-bold">全部图书</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeContent;
