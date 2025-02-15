import { type Book } from "@prisma/client";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "~/components/ui/command";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Badge } from "~/components/ui/badge";

interface SearchResultsProps {
  results: (Book & {
    category: {
      name: string;
    };
  })[];
  isLoading: boolean;
  onSelect: () => void;
}

export function SearchResults({
  results,
  isLoading,
  onSelect,
}: SearchResultsProps) {
  const router = useRouter();
  console.log("SearchResults render:", { results, isLoading });

  return (
    <Command className="absolute top-[calc(100%+8px)] z-50 w-full overflow-hidden rounded-lg border bg-card shadow-lg">
      {isLoading ? (
        <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
          搜索中...
        </CommandEmpty>
      ) : results.length === 0 ? (
        <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
          未找到相关图书
        </CommandEmpty>
      ) : (
        <CommandGroup
          className="max-h-[300px] overflow-auto p-2"
          heading="搜索结果"
        >
          {results.map((book) => (
            <CommandItem
              key={book.id}
              onSelect={() => {
                router.push(`/bookdetail/${book.id}`);
                onSelect();
              }}
              className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-muted"
            >
              <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded-sm">
                <Image
                  src={book.cover ?? ""}
                  alt={book.title}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="line-clamp-1 font-medium">{book.title}</span>
                  <Badge variant="secondary" className="h-5 px-1.5">
                    ¥{book.price.toString()}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="line-clamp-1">{book.author}</span>
                  <span>·</span>
                  <span>{book.category.name}</span>
                </div>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      )}
    </Command>
  );
}
