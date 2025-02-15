import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

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

  // 创建浏览记录
  createView: protectedProcedure
    .input(
      z.object({
        bookId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { bookId } = input;
      const userId = ctx.session.user.id;

      try {
        // 创建浏览记录
        await ctx.db.view.create({
          data: {
            userId,
            bookId,
          },
        });

        // 更新书籍浏览量
        await ctx.db.book.update({
          where: { id: bookId },
          data: {
            viewCount: {
              increment: 1,
            },
          },
        });

        return { success: true };
      } catch (error) {
        console.error("Create view error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "无法创建浏览记录",
        });
      }
    }),

  // 获取用户的浏览历史
  getUserViews: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).optional().default(10),
        cursor: z.string().optional(), // 用于分页
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { limit, cursor } = input;

      try {
        const views = await ctx.db.view.findMany({
          where: {
            userId,
          },
          take: limit + 1, // 获取多一条用于判断是否还有更多
          cursor: cursor ? { id: cursor } : undefined,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            book: {
              include: {
                category: true,
              },
            },
          },
        });

        let nextCursor: typeof cursor | undefined = undefined;
        if (views.length > limit) {
          const nextItem = views.pop();
          nextCursor = nextItem?.id;
        }

        return {
          items: views,
          nextCursor,
        };
      } catch (error) {
        console.error("Get user views error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "无法获取浏览历史",
        });
      }
    }),

  // 获取书籍的浏览量
  getBookViews: publicProcedure
    .input(
      z.object({
        bookId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const book = await ctx.db.book.findUnique({
          where: { id: input.bookId },
          select: { viewCount: true },
        });

        return book?.viewCount ?? 0;
      } catch (error) {
        console.error("Get book views error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "无法获取浏览量",
        });
      }
    }),

  // 点赞
  toggleLike: protectedProcedure
    .input(
      z.object({
        bookId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { bookId } = input;
      const userId = ctx.session.user.id;

      try {
        // 查找是否已经点赞
        const existingLike = await ctx.db.like.findUnique({
          where: {
            userId_bookId: {
              userId,
              bookId,
            },
          },
        });

        if (existingLike) {
          // 如果已经点赞，则取消点赞
          await ctx.db.like.delete({
            where: {
              userId_bookId: {
                userId,
                bookId,
              },
            },
          });

          // 减少书籍点赞数
          await ctx.db.book.update({
            where: { id: bookId },
            data: {
              likeCount: {
                decrement: 1,
              },
            },
          });

          return { success: true, liked: false };
        } else {
          // 如果未点赞，则添加点赞
          await ctx.db.like.create({
            data: {
              userId,
              bookId,
            },
          });

          // 增加书籍点赞数
          await ctx.db.book.update({
            where: { id: bookId },
            data: {
              likeCount: {
                increment: 1,
              },
            },
          });

          return { success: true, liked: true };
        }
      } catch (error) {
        console.error("Toggle like error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "无法处理点赞请求",
        });
      }
    }),

  // 检查用户是否已点赞
  checkLiked: protectedProcedure
    .input(
      z.object({
        bookId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { bookId } = input;
      const userId = ctx.session.user.id;

      try {
        const like = await ctx.db.like.findUnique({
          where: {
            userId_bookId: {
              userId,
              bookId,
            },
          },
        });

        return !!like;
      } catch (error) {
        console.error("Check like error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "无法检查点赞状态",
        });
      }
    }),
});
