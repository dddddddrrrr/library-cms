import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const booksRouter = createTRPCRouter({
  fetchBooks: publicProcedure.query(async ({ ctx }) => {
    const books = await ctx.db.book.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return books;
  }),

  // 获取单本书籍详情
  getBookById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const book = await ctx.db.book.findUnique({
        where: { id: input.id },
        include: {
          category: true,
          reviews: {
            include: {
              user: true,
            },
          },
        },
      });

      return book;
    }),
});
