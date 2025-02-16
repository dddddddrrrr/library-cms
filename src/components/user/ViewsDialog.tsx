"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { api } from "~/trpc/react";
import { useState } from "react";
import { formatDate } from "~/lib/utils";
import { Badge } from "../ui/badge";
import { useRouter } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { Skeleton } from "../ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Clock, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ViewsDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const ViewsDialog = ({ isOpen, setIsOpen }: ViewsDialogProps) => {
  const [page, setPage] = useState(1);
  const pageSize = 10; // 增加每页显示数量
  const router = useRouter();

  const { data, isLoading } = api.users.getUserViews.useQuery(
    {
      page,
      pageSize,
    },
    {
      enabled: isOpen,
    },
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>浏览历史</DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {Array.from({ length: pageSize }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </motion.div>
          ) : data?.items.length ? (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>书名</TableHead>
                    <TableHead>分类</TableHead>
                    <TableHead>浏览时间</TableHead>
                    <TableHead className="w-[100px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((view, index) => (
                    <motion.tr
                      key={view.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group"
                    >
                      <TableCell className="font-medium">
                        {view.book.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{view.book.category.name}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(view.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <ExternalLink
                          className="h-4 w-4 cursor-pointer text-muted-foreground transition-colors hover:text-primary"
                          onClick={() => {
                            setIsOpen(false);
                            router.push(`/bookdetail/${view.book.id}`);
                          }}
                        />
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>

              {/* 分页器 */}
              {data.metadata.pageCount > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Pagination className="mt-4">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          aria-disabled={page === 1}
                        />
                      </PaginationItem>

                      {Array.from({ length: data.metadata.pageCount }).map(
                        (_, i) => {
                          const pageNumber = i + 1;
                          if (
                            pageNumber === 1 ||
                            pageNumber === data.metadata.pageCount ||
                            Math.abs(pageNumber - page) <= 1
                          ) {
                            return (
                              <PaginationItem key={pageNumber}>
                                <PaginationLink
                                  isActive={page === pageNumber}
                                  onClick={() => setPage(pageNumber)}
                                >
                                  {pageNumber}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          }
                          if (Math.abs(pageNumber - page) === 2) {
                            return (
                              <PaginationItem key={pageNumber}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            );
                          }
                          return null;
                        },
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setPage((p) => Math.min(data.metadata.pageCount, p + 1))
                          }
                          aria-disabled={page === data.metadata.pageCount}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8 text-center text-muted-foreground"
            >
              暂无浏览记录
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default ViewsDialog;
