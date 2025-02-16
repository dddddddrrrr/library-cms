import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const booksRouter = createTRPCRouter({
  fetchBooks: publicProcedure.query(async ({ ctx }) => {
    try {
      const books = await ctx.db.book.findMany({
        include: {
          category: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return books;
    } catch (error) {
      console.error("Fetch books error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "获取图书列表失败",
      });
    }
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

  search: publicProcedure
    .input(
      z.object({
        query: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { query } = input;

      try {
        const books = await ctx.db.book.findMany({
          where: {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { author: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
            ],
          },
          select: {
            id: true,
            title: true,
            author: true,
            cover: true,
            price: true,
          },
          take: 5,
        });

        return books;
      } catch (error) {
        console.error("Search books error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "搜索失败",
        });
      }
    }),

  // 创建评论
  createComment: protectedProcedure
    .input(
      z.object({
        bookId: z.string(),
        content: z.string().min(1, "评论内容不能为空"),
        rating: z.number().min(1).max(5),
        parentId: z.string().optional(), // 可选的父评论ID
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { bookId, content, rating, parentId } = input;
      const userId = ctx.session.user.id;

      try {
        const comment = await ctx.db.comment.create({
          data: {
            content,
            rating,
            userId,
            bookId,
            parentId,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        });

        return comment;
      } catch (error) {
        console.error("Create comment error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "发表评论失败",
        });
      }
    }),

  // 获取书籍评论列表
  getBookComments: publicProcedure
    .input(
      z.object({
        bookId: z.string(),
        limit: z.number().min(1).max(50).optional().default(10),
        cursor: z.string().optional(), // 用于分页
      }),
    )
    .query(async ({ ctx, input }) => {
      const { bookId, limit, cursor } = input;

      try {
        const comments = await ctx.db.comment.findMany({
          where: {
            bookId,
            parentId: null, // 只获取主评论，不包括回复
          },
          take: limit + 1,
          cursor: cursor ? { id: cursor } : undefined,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
            },
            likes: true,
          },
        });

        let nextCursor: typeof cursor | undefined = undefined;
        if (comments.length > limit) {
          const nextItem = comments.pop();
          nextCursor = nextItem?.id;
        }

        return {
          items: comments,
          nextCursor,
        };
      } catch (error) {
        console.error("Get book comments error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "获取评论列表失败",
        });
      }
    }),

  // 删除评论
  deleteComment: protectedProcedure
    .input(
      z.object({
        commentId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { commentId } = input;
      const userId = ctx.session.user.id;

      try {
        // 检查是否是评论作者
        const comment = await ctx.db.comment.findUnique({
          where: { id: commentId },
          select: { userId: true },
        });

        if (!comment) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "评论不存在",
          });
        }

        if (comment.userId !== userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "无权删除此评论",
          });
        }

        await ctx.db.comment.delete({
          where: { id: commentId },
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Delete comment error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "删除评论失败",
        });
      }
    }),

  // 点赞评论
  toggleCommentLike: protectedProcedure
    .input(
      z.object({
        commentId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { commentId } = input;
      const userId = ctx.session.user.id;

      try {
        const existingLike = await ctx.db.commentLike.findUnique({
          where: {
            userId_commentId: {
              userId,
              commentId,
            },
          },
        });

        if (existingLike) {
          // 取消点赞
          await ctx.db.commentLike.delete({
            where: {
              userId_commentId: {
                userId,
                commentId,
              },
            },
          });
          return { success: true, liked: false };
        } else {
          // 添加点赞
          await ctx.db.commentLike.create({
            data: {
              userId,
              commentId,
            },
          });
          return { success: true, liked: true };
        }
      } catch (error) {
        console.error("Toggle comment like error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "操作失败",
        });
      }
    }),

  // 获取用户已购书籍
  getPurchasedBooks: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().min(1).max(50).optional().default(10),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { userId, limit, cursor } = input;
      const skip = cursor ? 1 : 0;

      // 检查权限：只能查看自己的书架
      if (userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "无权查看其他用户的书架",
        });
      }

      try {
        const orders = await ctx.db.orderItem.findMany({
          where: {
            order: {
              userId,
              status: "PAID",
            },
          },
          skip: skip,
          take: limit + 1,
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
            order: {
              select: {
                createdAt: true,
              },
            },
          },
        });

        let nextCursor: typeof cursor | undefined = undefined;
        if (orders.length > limit) {
          const nextItem = orders.pop();
          nextCursor = nextItem?.id;
        }

        return {
          items: orders,
          nextCursor,
        };
      } catch (error) {
        console.error("Get purchased books error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "获取已购书籍失败",
        });
      }
    }),

  // 获取章节列表
  getChapters: publicProcedure
    .input(z.object({ bookId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const chapters = await ctx.db.chapter.findMany({
          where: { bookId: input.bookId },
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            order: true,
            isPreview: true,
          },
        });
        return chapters;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "获取章节列表失败",
        });
      }
    }),

  // 获取章节内容
  getChapter: publicProcedure
    .input(
      z.object({
        bookId: z.string(),
        chapterId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const chapter = await ctx.db.chapter.findFirst({
          where: {
            id: input.chapterId,
            bookId: input.bookId,
          },
        });
        return chapter;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "获取章节内容失败",
        });
      }
    }),

  // 更新阅读进度
  updateReadingProgress: protectedProcedure
    .input(
      z.object({
        chapterId: z.string(),
        progress: z.number().min(0).max(100),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.readingRecord.upsert({
          where: {
            userId_chapterId: {
              userId: ctx.session.user.id,
              chapterId: input.chapterId,
            },
          },
          create: {
            userId: ctx.session.user.id,
            chapterId: input.chapterId,
            progress: input.progress,
          },
          update: {
            progress: input.progress,
            lastRead: new Date(),
          },
        });
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "更新阅读进度失败",
        });
      }
    }),

  // 检查是否已购买
  checkPurchased: protectedProcedure
    .input(z.object({ bookId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const order = await ctx.db.orderItem.findFirst({
          where: {
            bookId: input.bookId,
            order: {
              userId: ctx.session.user.id,
              status: "PAID",
            },
          },
        });
        return !!order;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "检查购买状态失败",
        });
      }
    }),
});
