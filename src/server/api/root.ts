import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { booksRouter } from "~/server/api/routers/books";
import { paymentRouter } from "~/server/api/routers/payment";
import { usersRouter } from "~/server/api/routers/users";
import { ordersRouter } from "~/server/api/routers/orders";
import { rechargesRouter } from "~/server/api/routers/recharges";
import { viewsRouter } from "./routers/views";
import { commentsRouter } from "./routers/comments";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  books: booksRouter,
  payment: paymentRouter,
  users: usersRouter,
  orders: ordersRouter,
  recharges: rechargesRouter,
  views: viewsRouter,
  comments: commentsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
