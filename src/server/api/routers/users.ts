import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const usersRouter = createTRPCRouter({
  getUser: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const user = await ctx.db.user.findUnique({
          where: { id: input.id },
          include: {
            _count: {
              select: {
                likes: true,
                views: true,
                orders: true,
              },
            },
          },
        });

        return user;
      } catch (error) {
        console.error("Get user error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "无法获取用户信息",
        });
      }
    }),
});
