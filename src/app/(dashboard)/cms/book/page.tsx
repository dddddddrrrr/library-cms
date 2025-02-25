"use client";

import { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "~/components/ui/table/table";
import { api } from "~/trpc/react";
import { formatDate } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";
import type {
  Filter,
  FilterValue,
} from "~/components/ui/table/data-table-filter-box";
import { type BookStatus } from "@prisma/client";
import { type Decimal } from "@prisma/client/runtime/library";
import { Button } from "~/components/ui/button";
import { Edit, Trash, Plus, Upload, X } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { toast } from "sonner";

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  description: string | null;
  cover: string | null;
  price: Decimal;
  stock: number;
  status: BookStatus;
  publishDate: Date | null;
  publisher: string | null;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  likeCount: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

interface SearchParams {
  page: number;
  pageSize: number;
  title?: string;
  author?: string;
  status?: string;
  priceMin?: number;
  priceMax?: number;
  categoryId?: string;
  sortBy?: "title" | "price" | "author" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export default function BookPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    isbn: "",
    description: "",
    cover: "",
    price: 0,
    stock: 0,
    status: "AVAILABLE" as BookStatus,
    publisher: "",
    publishDate: "",
    categoryId: "",
  });

  // 添加图片上传状态
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");

  const [filters, setFilters] = useState<Filter[]>([
    {
      column: "title",
      label: "书名",
      type: "input",
    },
    {
      column: "author",
      label: "作者",
      type: "input",
    },
    {
      column: "status",
      label: "状态",
      type: "select",
      options: [
        { label: "可用", value: "AVAILABLE" },
        { label: "缺货", value: "OUT_OF_STOCK" },
        { label: "停售", value: "DISCONTINUED" },
      ],
    },
    {
      column: "categoryId",
      label: "分类",
      type: "select",
      options: [],
    },
    {
      column: "price",
      label: "价格",
      type: "number-range",
      precision: 2,
    },
  ]);

  const [searchParams, setSearchParams] = useState<SearchParams>({
    page: 1,
    pageSize: 10,
  });

  // 获取分类数据
  const { data: categoriesData, isLoading: categoriesLoading } =
    api.books.fetchCategories.useQuery();

  // 更新分类选项
  useEffect(() => {
    if (categoriesData) {
      setFilters((prevFilters) => {
        return prevFilters.map((filter) => {
          if (filter.column === "categoryId") {
            return {
              ...filter,
              options: categoriesData.map((category: Category) => ({
                label: category.name,
                value: category.id,
              })),
            };
          }
          return filter;
        });
      });
    }
  }, [categoriesData]);

  const { data, isLoading, refetch } =
    api.books.fetchAllBooks.useQuery(searchParams);

  const columns: ColumnDef<Book>[] = [
    {
      accessorKey: "title",
      header: "书名",
      cell: ({ row }) => {
        const book = row.original;
        return (
          <div className="flex items-center gap-3">
            {book.cover && (
              <Image
                src={book.cover}
                alt={book.title}
                className="h-10 w-8 rounded object-cover"
                width={32}
                height={40}
              />
            )}
            <span className="font-medium">{book.title}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "author",
      header: "作者",
    },
    {
      accessorKey: "price",
      header: "价格",
      cell: ({ row }) => {
        const price = row.getValue("price");
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        return `¥${price}`;
      },
    },
    {
      accessorKey: "stock",
      header: "库存",
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => {
        const status = row.getValue("status");
        return (
          <Badge
            variant={
              status === "AVAILABLE"
                ? "default"
                : status === "OUT_OF_STOCK"
                  ? "destructive"
                  : "outline"
            }
          >
            {status === "AVAILABLE"
              ? "可用"
              : status === "OUT_OF_STOCK"
                ? "缺货"
                : "停售"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "category.name",
      header: "分类",
      cell: ({ row }) => {
        const book = row.original;
        return <Badge variant="secondary">{book.category.name}</Badge>;
      },
    },
    {
      accessorKey: "createdAt",
      header: "创建时间",
      cell: ({ row }) => {
        return formatDate(row.getValue("createdAt"));
      },
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => {
        const book = row.original;
        return (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditBook(book)}
            >
              <Edit className="mr-1 h-4 w-4" />
              编辑
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteBook(book)}
            >
              <Trash className="mr-1 h-4 w-4" />
              删除
            </Button>
          </div>
        );
      },
    },
  ];

  const handleSearch = (filterValues: Record<string, FilterValue>) => {
    console.log("搜索参数:", filterValues);

    // 构建新的搜索参数
    const newParams: SearchParams = {
      page: 1, // 重置到第一页
      pageSize: searchParams.pageSize,
    };

    // 处理标题
    if (filterValues.title) {
      newParams.title = filterValues.title as string;
    }

    // 处理作者
    if (filterValues.author) {
      newParams.author = filterValues.author as string;
    }

    // 处理状态
    if (filterValues.status) {
      newParams.status = filterValues.status as string;
    }

    // 处理分类
    if (filterValues.categoryId) {
      newParams.categoryId = filterValues.categoryId as string;
    }

    // 处理价格范围
    if (filterValues.priceMin) {
      newParams.priceMin = Number(filterValues.priceMin);
    }

    if (filterValues.priceMax) {
      newParams.priceMax = Number(filterValues.priceMax);
    }

    console.log("新的搜索参数:", newParams);

    // 更新搜索参数
    setSearchParams(newParams);
  };

  // 添加书籍的mutation
  const addBookMutation = api.books.createBook.useMutation({
    onSuccess: () => {
      toast.success("书籍添加成功");
      setIsAddDialogOpen(false);
      void refetch();
      // 重置表单
      resetBookForm();
    },
    onError: (error) => {
      toast.error(`添加失败: ${error.message}`);
    },
  });

  // 更新书籍的mutation
  const updateBookMutation = api.books.updateBook.useMutation({
    onSuccess: () => {
      toast.success("书籍更新成功");
      setIsEditDialogOpen(false);
      void refetch();
      // 重置表单
      resetBookForm();
    },
    onError: (error) => {
      toast.error(`更新失败: ${error.message}`);
    },
  });

  // 删除书籍的mutation
  const deleteBookMutation = api.books.deleteBook.useMutation({
    onSuccess: () => {
      toast.success("书籍删除成功");
      setIsDeleteDialogOpen(false);
      void refetch();
    },
    onError: (error) => {
      toast.error(`删除失败: ${error.message}`);
    },
  });

  // 重置表单
  const resetBookForm = () => {
    setNewBook({
      title: "",
      author: "",
      isbn: "",
      description: "",
      cover: "",
      price: 0,
      stock: 0,
      status: "AVAILABLE",
      publisher: "",
      publishDate: "",
      categoryId: "",
    });
    setCoverFile(null);
    setCoverPreview("");
  };

  const handleAddBook = () => {
    // 验证必填字段
    if (!newBook.title || !newBook.author || !newBook.categoryId) {
      toast.error("请填写必填字段");
      return;
    }

    // 提交数据
    addBookMutation.mutate({
      ...newBook,
      price: Number(newBook.price),
      stock: Number(newBook.stock),
      publishDate: newBook.publishDate
        ? new Date(newBook.publishDate)
        : undefined,
    });
  };

  // 处理编辑书籍
  const handleEditBook = (book: Book) => {
    setSelectedBook(book);
    // 填充表单数据
    setNewBook({
      title: book.title,
      author: book.author,
      isbn: book.isbn ?? "",
      description: book.description ?? "",
      cover: book.cover ?? "",
      price: Number(book.price),
      stock: book.stock,
      status: book.status,
      publisher: book.publisher ?? "",
      publishDate: formatDateForInput(book.publishDate),
      categoryId: book.categoryId,
    });

    // 如果有封面，设置预览
    if (book.cover) {
      setCoverPreview(book.cover);
    } else {
      setCoverPreview("");
    }

    // 打开编辑弹窗
    setIsEditDialogOpen(true);
  };

  // 处理更新书籍
  const handleUpdateBook = () => {
    if (!selectedBook) return;

    // 验证必填字段
    if (!newBook.title || !newBook.author || !newBook.categoryId) {
      toast.error("请填写必填字段");
      return;
    }

    // 提交数据
    updateBookMutation.mutate({
      id: selectedBook.id,
      title: newBook.title,
      author: newBook.author,
      isbn: newBook.isbn,
      description: newBook.description || undefined,
      cover: newBook.cover || undefined,
      price: Number(newBook.price),
      stock: Number(newBook.stock),
      status: newBook.status,
      categoryId: newBook.categoryId,
      publisher: newBook.publisher || undefined,
      publishDate: newBook.publishDate
        ? new Date(newBook.publishDate)
        : undefined,
    });
  };

  // 处理删除书籍
  const handleDeleteBook = (book: Book) => {
    setSelectedBook(book);
    setIsDeleteDialogOpen(true);
  };

  // 确认删除
  const confirmDeleteBook = () => {
    if (!selectedBook) return;
    deleteBookMutation.mutate({ id: selectedBook.id });
  };

  // 格式化日期为input[type="date"]格式
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0] ?? "";
  };

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith("image/")) {
      toast.error("请上传图片文件");
      return;
    }

    // 验证文件大小 (限制为2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("图片大小不能超过2MB");
      return;
    }

    setCoverFile(file);

    // 创建预览
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCoverPreview(result);
      // 直接将URL设置到表单中
      setNewBook((prev) => ({
        ...prev,
        cover: result,
      }));
    };
    reader.readAsDataURL(file);
  };

  // 移除图片
  const removeImage = () => {
    setCoverFile(null);
    setCoverPreview("");
    setNewBook((prev) => ({
      ...prev,
      cover: "",
    }));
  };

  return (
    <div className="space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">书籍管理</h1>
        <div className="flex space-x-2">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            添加书籍
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        loading={isLoading || categoriesLoading}
        filters={filters}
        onSearch={handleSearch}
        pagination={{
          pageCount: data?.metadata.pageCount ?? 0,
          page: data?.metadata.page ?? 1,
          pageSize: data?.metadata.pageSize ?? 10,
          total: data?.metadata.total ?? 0,
          onPageChange: (page: number) => {
            setSearchParams({ ...searchParams, page });
          },
        }}
        totalItems={data?.metadata.total}
      />

      {/* 添加书籍对话框 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl">添加新书籍</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* 左侧：基本信息 */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-sm font-medium">
                  书名 *
                </Label>
                <Input
                  id="title"
                  className="mt-1"
                  placeholder="输入书名"
                  value={newBook.title}
                  onChange={(e) =>
                    setNewBook({ ...newBook, title: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="author" className="text-sm font-medium">
                  作者 *
                </Label>
                <Input
                  id="author"
                  className="mt-1"
                  placeholder="输入作者"
                  value={newBook.author}
                  onChange={(e) =>
                    setNewBook({ ...newBook, author: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="isbn" className="text-sm font-medium">
                  ISBN
                </Label>
                <Input
                  id="isbn"
                  className="mt-1"
                  placeholder="输入ISBN"
                  value={newBook.isbn}
                  onChange={(e) =>
                    setNewBook({ ...newBook, isbn: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-sm font-medium">
                  分类 *
                </Label>
                <Select
                  value={newBook.categoryId}
                  onValueChange={(value) =>
                    setNewBook({ ...newBook, categoryId: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesData?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="publisher" className="text-sm font-medium">
                  出版社
                </Label>
                <Input
                  id="publisher"
                  className="mt-1"
                  placeholder="输入出版社"
                  value={newBook.publisher}
                  onChange={(e) =>
                    setNewBook({ ...newBook, publisher: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="publishDate" className="text-sm font-medium">
                  出版日期
                </Label>
                <Input
                  id="publishDate"
                  type="date"
                  className="mt-1"
                  value={newBook.publishDate}
                  onChange={(e) =>
                    setNewBook({ ...newBook, publishDate: e.target.value })
                  }
                />
              </div>
            </div>

            {/* 右侧：价格、库存、状态、封面 */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price" className="text-sm font-medium">
                    价格 *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    className="mt-1"
                    placeholder="0.00"
                    value={newBook.price || ""}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? 0 : parseFloat(e.target.value);
                      setNewBook({
                        ...newBook,
                        price: value,
                      });
                    }}
                  />
                </div>

                <div>
                  <Label htmlFor="stock" className="text-sm font-medium">
                    库存 *
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    className="mt-1"
                    placeholder="0"
                    value={newBook.stock || ""}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? 0 : parseInt(e.target.value);
                      setNewBook({
                        ...newBook,
                        stock: value,
                      });
                    }}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status" className="text-sm font-medium">
                  状态 *
                </Label>
                <Select
                  value={newBook.status}
                  onValueChange={(value) =>
                    setNewBook({ ...newBook, status: value as BookStatus })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">可用</SelectItem>
                    <SelectItem value="OUT_OF_STOCK">缺货</SelectItem>
                    <SelectItem value="DISCONTINUED">停售</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cover" className="text-sm font-medium">
                  封面图片
                </Label>
                <div className="mt-2 flex items-start space-x-4">
                  {coverPreview ? (
                    <div className="relative h-40 w-32 overflow-hidden rounded-md border bg-muted/20">
                      <Image
                        src={coverPreview}
                        alt="封面预览"
                        fill
                        className="object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute right-1 top-1 h-6 w-6 rounded-full opacity-80 transition-opacity hover:opacity-100"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label
                      htmlFor="cover-upload"
                      className="flex h-40 w-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed bg-muted/10 transition-colors hover:bg-muted/20"
                    >
                      <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        点击上传
                      </span>
                      <Input
                        id="cover-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                  <div className="flex-1 text-xs text-muted-foreground">
                    <p>支持 JPG、PNG、WebP 格式</p>
                    <p>图片大小不超过 2MB</p>
                    <p>建议尺寸: 300×450px</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 跨越两列的描述字段 */}
            <div className="col-span-1 space-y-2 md:col-span-2">
              <Label htmlFor="description" className="text-sm font-medium">
                描述
              </Label>
              <Textarea
                id="description"
                rows={3}
                className="mt-1 resize-none"
                placeholder="输入书籍描述..."
                value={newBook.description}
                onChange={(e) =>
                  setNewBook({ ...newBook, description: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter className="mt-6 flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              取消
            </Button>
            <Button
              onClick={handleAddBook}
              disabled={addBookMutation.isPending}
              className="w-full sm:w-auto"
            >
              {addBookMutation.isPending ? "添加中..." : "添加书籍"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑书籍对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl">编辑书籍</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* 左侧：基本信息 */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title" className="text-sm font-medium">
                  书名 *
                </Label>
                <Input
                  id="edit-title"
                  className="mt-1"
                  placeholder="输入书名"
                  value={newBook.title}
                  onChange={(e) =>
                    setNewBook({ ...newBook, title: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="edit-author" className="text-sm font-medium">
                  作者 *
                </Label>
                <Input
                  id="edit-author"
                  className="mt-1"
                  placeholder="输入作者"
                  value={newBook.author}
                  onChange={(e) =>
                    setNewBook({ ...newBook, author: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="edit-isbn" className="text-sm font-medium">
                  ISBN
                </Label>
                <Input
                  id="edit-isbn"
                  className="mt-1"
                  placeholder="输入ISBN"
                  value={newBook.isbn}
                  onChange={(e) =>
                    setNewBook({ ...newBook, isbn: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="edit-category" className="text-sm font-medium">
                  分类 *
                </Label>
                <Select
                  value={newBook.categoryId}
                  onValueChange={(value) =>
                    setNewBook({ ...newBook, categoryId: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesData?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-publisher" className="text-sm font-medium">
                  出版社
                </Label>
                <Input
                  id="edit-publisher"
                  className="mt-1"
                  placeholder="输入出版社"
                  value={newBook.publisher}
                  onChange={(e) =>
                    setNewBook({ ...newBook, publisher: e.target.value })
                  }
                />
              </div>

              <div>
                <Label
                  htmlFor="edit-publishDate"
                  className="text-sm font-medium"
                >
                  出版日期
                </Label>
                <Input
                  id="edit-publishDate"
                  type="date"
                  className="mt-1"
                  value={newBook.publishDate}
                  onChange={(e) =>
                    setNewBook({ ...newBook, publishDate: e.target.value })
                  }
                />
              </div>
            </div>

            {/* 右侧：价格、库存、状态、封面 */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-price" className="text-sm font-medium">
                    价格 *
                  </Label>
                  <Input
                    id="edit-price"
                    type="number"
                    min="0"
                    step="0.01"
                    className="mt-1"
                    placeholder="0.00"
                    value={newBook.price || ""}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? 0 : parseFloat(e.target.value);
                      setNewBook({
                        ...newBook,
                        price: value,
                      });
                    }}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-stock" className="text-sm font-medium">
                    库存 *
                  </Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    min="0"
                    className="mt-1"
                    placeholder="0"
                    value={newBook.stock || ""}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? 0 : parseInt(e.target.value);
                      setNewBook({
                        ...newBook,
                        stock: value,
                      });
                    }}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-status" className="text-sm font-medium">
                  状态 *
                </Label>
                <Select
                  value={newBook.status}
                  onValueChange={(value) =>
                    setNewBook({ ...newBook, status: value as BookStatus })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">可用</SelectItem>
                    <SelectItem value="OUT_OF_STOCK">缺货</SelectItem>
                    <SelectItem value="DISCONTINUED">停售</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-cover" className="text-sm font-medium">
                  封面图片
                </Label>
                <div className="mt-2 flex items-start space-x-4">
                  {coverPreview ? (
                    <div className="relative h-40 w-32 overflow-hidden rounded-md border bg-muted/20">
                      <Image
                        src={coverPreview}
                        alt="封面预览"
                        fill
                        className="object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute right-1 top-1 h-6 w-6 rounded-full opacity-80 transition-opacity hover:opacity-100"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label
                      htmlFor="edit-cover-upload"
                      className="flex h-40 w-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed bg-muted/10 transition-colors hover:bg-muted/20"
                    >
                      <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        点击上传
                      </span>
                      <Input
                        id="edit-cover-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                  <div className="flex-1 text-xs text-muted-foreground">
                    <p>支持 JPG、PNG、WebP 格式</p>
                    <p>图片大小不超过 2MB</p>
                    <p>建议尺寸: 300×450px</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 跨越两列的描述字段 */}
            <div className="col-span-1 space-y-2 md:col-span-2">
              <Label htmlFor="edit-description" className="text-sm font-medium">
                描述
              </Label>
              <Textarea
                id="edit-description"
                rows={3}
                className="mt-1 resize-none"
                placeholder="输入书籍描述..."
                value={newBook.description}
                onChange={(e) =>
                  setNewBook({ ...newBook, description: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter className="mt-6 flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              取消
            </Button>
            <Button
              onClick={handleUpdateBook}
              disabled={updateBookMutation.isPending}
              className="w-full sm:w-auto"
            >
              {updateBookMutation.isPending ? "更新中..." : "更新书籍"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">确认删除</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              您确定要删除书籍{" "}
              <span className="font-semibold">{selectedBook?.title}</span> 吗？
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              此操作无法撤销。
            </p>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteBook}
              disabled={deleteBookMutation.isPending}
              className="w-full sm:w-auto"
            >
              {deleteBookMutation.isPending ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
