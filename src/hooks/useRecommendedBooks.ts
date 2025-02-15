import { api } from "~/trpc/react";

import { useMemo } from "react";

export function useRecommendedBooks(currentBookId: string) {
  // 获取用户的浏览历史
  const { data: viewHistory } = api.books.getUserViews.useQuery(
    { limit: 10 },
    { enabled: true },
  );

  // 获取所有图书
  const { data: allBooks } = api.books.fetchBooks.useQuery();

  // 计算推荐图书
  const recommendedBooks = useMemo(() => {
    if (!allBooks) return [];

    // 过滤掉当前图书
    const otherBooks = allBooks.filter((book) => book.id !== currentBookId);

    // 获取用户最近浏览的图书分类
    const recentCategories = new Set(
      viewHistory?.items.map((view) => view.book.categoryId) ?? [],
    );

    // 给每本书计算推荐分数
    const booksWithScore = otherBooks.map((book) => {
      let score = 0;

      // 如果是用户最近浏览过的分类，加分
      if (recentCategories.has(book.categoryId)) {
        score += 5;
      }

      // 浏览量高的书加分
      score += Math.min(book.viewCount / 10, 5); // 最多加5分

      // 点赞数高的书加分
      score += Math.min(book.likeCount / 5, 5); // 最多加5分

      return {
        ...book,
        score,
      };
    });

    // 按分数排序并返回前20本
    return booksWithScore.sort((a, b) => b.score - a.score).slice(0, 20);
  }, [allBooks, currentBookId, viewHistory]);

  return {
    recommendedBooks,
    isLoading: !allBooks,
  };
}
