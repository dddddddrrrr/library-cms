"use client";

import { useState } from "react";
import { RotateCcw, Search, Loader2, CalendarIcon } from "lucide-react";
import { type Table } from "@tanstack/react-table";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { format } from "date-fns";
import { cn } from "~/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { type DateRange } from "react-day-picker";

interface FilterOption {
  label: string;
  value: string | number;
}

export interface Filter {
  column: string;
  label: string;
  type: "input" | "select" | "date-range" | "date-single" | "number-range";
  options?: FilterOption[];
  precision?: number;
}

export type FilterValue =
  | string
  | Date
  | [Date | undefined, Date | undefined]
  | null;

interface DataTableFilterBoxProps<TData> {
  table: Table<TData>;
  filters: Filter[];
  onSearch: (values: Record<string, FilterValue>) => void;
  defaultValues?: Record<string, FilterValue>;
  filterLoading?: Record<string, boolean>;
  onFilterChange?: (column: string, value: FilterValue) => void;
}

export function DataTableFilterBox<TData>({
  table,
  filters,
  onSearch,
  defaultValues = {},
  filterLoading,
  onFilterChange,
}: DataTableFilterBoxProps<TData>) {
  const [date, setDate] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });

  const [filterValues, setFilterValues] = useState<Record<string, FilterValue>>(
    () => ({ ...defaultValues }),
  );
  const [isSearching, setIsSearching] = useState(false);

  const handleFilterChange = (column: string, value: FilterValue) => {
    if (value === "") {
      const newValues = { ...filterValues };
      delete newValues[column];
      setFilterValues(newValues);
    } else {
      setFilterValues((prev) => ({
        ...prev,
        [column]: value,
      }));
    }

    // 如果有 onFilterChange 回调，调用它
    if (onFilterChange) {
      onFilterChange(column, value);
    }
  };

  const renderFilter = (filter: Filter) => {
    switch (filter.type) {
      case "input":
        return (
          <div className="relative">
            <Input
              placeholder={`${filter.label}`}
              value={(filterValues[filter.column] as string) ?? ""}
              onChange={(event) => {
                handleFilterChange(filter.column, event.target.value);
              }}
              className={cn(
                "h-8 w-full pr-8",
                "placeholder:text-muted-foreground/60",
              )}
            />
          </div>
        );

      case "select":
        const isLoading = filterLoading?.[filter.column];
        const hasOptions = filter.options && filter.options.length > 0;
        const value = filterValues[filter.column];

        return (
          <Select
            value={value as string}
            onValueChange={(value) => {
              handleFilterChange(filter.column, value);
            }}
            disabled={isLoading}
          >
            <SelectTrigger className="h-8 w-full text-sm text-muted-foreground">
              <SelectValue placeholder={isLoading ? "加载中..." : filter.label}>
                {isLoading
                  ? "加载中..."
                  : value
                    ? `${filter.label}: ${
                        hasOptions && filter.options
                          ? (filter.options.find((opt) => opt.value === value)
                              ?.label ?? String(value))
                          : String(value)
                      }`
                    : filter.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <div className="px-2 py-1 text-sm text-muted-foreground">
                  加载中...
                </div>
              ) : hasOptions ? (
                filter.options?.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value.toString()}
                  >
                    {option.label}
                  </SelectItem>
                ))
              ) : (
                <div className="px-2 py-1 text-sm text-muted-foreground">
                  {filter.column === "tokenName" ? "暂无代币" : "暂无选项"}
                </div>
              )}
            </SelectContent>
          </Select>
        );

      case "number-range":
        return (
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              placeholder={`最小${filter.label}`}
              value={(filterValues[`${filter.column}Min`] as string) || ""}
              onChange={(event) => {
                setFilterValues((prev) => ({
                  ...prev,
                  [`${filter.column}Min`]: event.target.value,
                }));
              }}
              className="h-8 w-[140px]"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="number"
              placeholder={`最大${filter.label}`}
              value={(filterValues[`${filter.column}Max`] as string) || ""}
              onChange={(event) => {
                setFilterValues((prev) => ({
                  ...prev,
                  [`${filter.column}Max`]: event.target.value,
                }));
              }}
              className="h-8 w-[140px]"
            />
          </div>
        );

      case "date-single":
        const dateValue = filterValues[filter.column];
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-8 w-full min-w-[200px] justify-start text-left font-normal",
                  !dateValue && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateValue instanceof Date
                  ? format(dateValue, "MM-dd")
                  : filter.label}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="flex space-x-2 p-2">
                <Calendar
                  mode="single"
                  selected={dateValue instanceof Date ? dateValue : undefined}
                  onSelect={(date) => {
                    if (date) {
                      setFilterValues((prev) => ({
                        ...prev,
                        [filter.column]: date,
                      }));
                    }
                  }}
                  initialFocus
                />
              </div>
            </PopoverContent>
          </Popover>
        );
      case "date-range":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-8 w-full min-w-[200px] justify-start text-left text-xs font-normal",
                  !filterValues[filter.column] && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "yyy/MM/dd")} -{" "}
                      {format(date.to, "yyy/MM/dd")}
                    </>
                  ) : (
                    format(date.from, "yyy/MM/dd/")
                  )
                ) : (
                  <span className="text-sm">选择{filter.label}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="flex space-x-2 p-2">
                <Calendar
                  className="shadow-none"
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={(e) => {
                    if (e?.from) {
                      setDate(e);
                      setFilterValues((prev) => ({
                        ...prev,
                        [filter.column]: [e.from, e.to],
                      }));
                    } else {
                      setDate({ from: undefined, to: undefined });
                      setFilterValues((prev) => ({
                        ...prev,
                        [filter.column]: [undefined, undefined],
                      }));
                    }
                  }}
                  numberOfMonths={2}
                />
              </div>
            </PopoverContent>
          </Popover>
        );
    }
  };

  const handleSearch = async () => {
    if (isSearching) return;
    setIsSearching(true);
    try {
      // 创建一个新的对象传递给 onSearch，避免引用问题
      const searchValues = { ...filterValues };
      onSearch(searchValues);
    } finally {
      setIsSearching(false);
    }
  };

  const handleReset = () => {
    // 重置状态
    setFilterValues({});
    setDate({ from: undefined, to: undefined });

    // 确保触发查询
    setTimeout(() => {
      onSearch({});
    }, 0);
  };

  return (
    <div className="space-y-2 rounded-md border border-input p-4 shadow-sm">
      <div className="relative">
        <div className="grid grid-cols-1 gap-2 pr-24 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
          {filters?.map((filter) => (
            <div key={filter.column}>{renderFilter(filter)}</div>
          ))}
        </div>
        <div className="absolute right-0 top-0 flex items-center space-x-2">
          <Button
            className="h-8 w-8"
            onClick={handleSearch}
            disabled={isSearching}
            size="icon"
          >
            {isSearching ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8"
            size="icon"
            onClick={handleReset}
            disabled={isSearching}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
