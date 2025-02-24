/* eslint-disable */
"use client";

import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { useTransition, type TransitionStartFunction } from "react";

interface QueryOptions {
  startTransition?: TransitionStartFunction;
  shallow?: boolean;
  replace?: boolean;
}

interface DataTableSearchProps {
  searchKey: string;
  searchQuery: string;
  setSearchQuery: (
    value: string | ((old: string) => string | null) | null,
    options?: QueryOptions,
  ) => Promise<URLSearchParams>;
  setPage: (
    value: number | ((old: number) => number | null) | null,
    options?: QueryOptions,
  ) => Promise<URLSearchParams>;
}

export function DataTableSearch({
  searchKey,
  searchQuery,
  setSearchQuery,
  setPage,
}: DataTableSearchProps) {
  const [isLoading, startTransition] = useTransition();

  const handleSearch = (value: string) => {
    setSearchQuery(value, { startTransition });
    setPage(1, { startTransition });
  };

  return (
    <Input
      placeholder={`Search ${searchKey}...`}
      value={searchQuery ?? ""}
      onChange={(e) => handleSearch(e.target.value)}
      className={cn("w-full md:max-w-sm", isLoading && "animate-pulse")}
    />
  );
}
