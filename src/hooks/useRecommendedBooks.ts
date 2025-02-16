import { api } from "~/trpc/react";
import { useMemo } from "react";
import { useSession } from "next-auth/react";

// 随机打乱数组的辅助函数
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = newArray[i];
    newArray[i] = newArray[j]!;
    newArray[j] = temp!;
  }
  return newArray;
}

export function useRecommendedBooks(currentBookId: string) {
  const { data: session } = useSession();

  // 获取用户的浏览历史
  const { data: viewHistory } = api.books.getUserViews.useQuery(
    { limit: 10 },
    { enabled: !!session }, // 只在登录时获取浏览历史
  );

  // 获取所有图书
  const { data: allBooks } = api.books.fetchBooks.useQuery();

  // 计算推荐图书
  const recommendedBooks = useMemo(() => {
    if (!allBooks) return [];

    // 过滤掉当前图书
    const otherBooks = allBooks.filter((book) => book.id !== currentBookId);

    // 未登录或无浏览历史时，随机推荐
    if (!session || !viewHistory) {
      return shuffleArray(otherBooks).slice(0, 20);
    }

    // 已登录且有浏览历史时，使用智能推荐
    const recentCategories = new Set(
      viewHistory.items.map((view) => view.book.categoryId),
    );

    // 给每本书计算推荐分数
    const booksWithScore = otherBooks.map((book) => {
      let score = 0;

      // 如果是用户最近浏览过的分类，加分
      if (recentCategories.has(book.categoryId)) {
        score += 5;
      }

      // 浏览量高的书加分
      score += Math.min(book.viewCount / 10, 5);

      // 点赞数高的书加分
      score += Math.min(book.likeCount / 5, 5);

      return {
        ...book,
        score,
      };
    });

    // 按分数排序并返回前20本
    return booksWithScore.sort((a, b) => b.score - a.score).slice(0, 20);
  }, [allBooks, currentBookId, session, viewHistory]);

  return {
    recommendedBooks,
    isLoading: !allBooks,
  };
}
