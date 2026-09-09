"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Search, X, Building2, Phone, CreditCard, ChevronDown } from "lucide-react";
import { useSearchSuppliers } from "@/features/purchasing/hooks";
import type { Supplier } from "@/features/purchasing/types";
import { cn } from "@/lib/cn";

interface Props {
  value?: { id: number; name: string; code: string } | null;
  onSelect: (supplier: Supplier | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function SupplierAutocomplete({
  value,
  onSelect,
  placeholder = "Tìm kiếm nhà cung cấp...",
  disabled = false,
  className,
}: Props) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const { data: suppliers = [], isLoading } = useSearchSuppliers(debouncedQuery);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery("");
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [suppliers]);

  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
  }, []);

  const handleSelect = useCallback(
    (supplier: Supplier) => {
      onSelect(supplier);
      setIsOpen(false);
      setQuery("");
      setHighlightedIndex(-1);
    },
    [onSelect]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect(null);
      setQuery("");
      setIsOpen(false);
    },
    [onSelect]
  );

  const handleOpenDropdown = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [disabled]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < suppliers.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : suppliers.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0 && suppliers[highlightedIndex]) {
            handleSelect(suppliers[highlightedIndex]);
          }
          break;
        case "Escape":
          setIsOpen(false);
          setQuery("");
          setHighlightedIndex(-1);
          break;
        default:
          break;
      }
    },
    [isOpen, suppliers, highlightedIndex, handleSelect]
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN").format(amount) + " \u20ab";

  const hasResults = suppliers.length > 0;
  const showEmpty = isOpen && debouncedQuery.trim().length >= 1 && !isLoading && !hasResults;
  const showInitialHint = isOpen && debouncedQuery.trim().length === 0;

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Selected chip or input trigger */}
      {value && !isOpen ? (
        <div
          className={cn(
            "flex items-center gap-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm",
            "transition-colors",
            disabled
              ? "cursor-not-allowed bg-gray-50 opacity-60"
              : "cursor-pointer hover:border-indigo-400"
          )}
          onClick={handleOpenDropdown}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => e.key === "Enter" && handleOpenDropdown()}
          aria-label="Thay doi nha cung cap"
        >
          <Building2 className="h-4 w-4 flex-shrink-0 text-indigo-500" />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-semibold text-gray-800">
              {value.name}
            </span>
            <span className="text-xs text-gray-400">{value.code}</span>
          </div>
          <div className="flex items-center gap-1">
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            {!disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="ml-1 rounded-full p-0.5 text-gray-400 transition-colors hover:bg-red-100 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-400"
                aria-label="Xoa nha cung cap"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg border bg-white px-3 py-2 shadow-sm transition-all",
            isOpen
              ? "border-indigo-400 ring-2 ring-indigo-100"
              : "border-gray-200 hover:border-gray-300",
            disabled && "cursor-not-allowed bg-gray-50 opacity-60"
          )}
        >
          {isLoading ? (
            <div className="h-4 w-4 flex-shrink-0 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
          ) : (
            <Search className="h-4 w-4 flex-shrink-0 text-gray-400" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={value ? value.name : placeholder}
            disabled={disabled}
            className={cn(
              "min-w-0 flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400",
              "outline-none disabled:cursor-not-allowed"
            )}
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            role="combobox"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="text-gray-400 transition-colors hover:text-gray-600 focus:outline-none"
              aria-label="Xoa tu khoa"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div
          className={cn(
            "absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-gray-100",
            "bg-white shadow-xl shadow-gray-200/60"
          )}
          role="listbox"
          aria-label="Danh sach nha cung cap"
        >
          {/* Initial hint */}
          {showInitialHint && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400">
              <Search className="h-4 w-4" />
              <span>Nhap de tim kiem nha cung cap</span>
            </div>
          )}

          {/* Loading skeleton */}
          {isLoading && (
            <div className="space-y-1 p-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex animate-pulse items-center gap-3 rounded-lg px-3 py-3">
                  <div className="h-8 w-8 rounded-full bg-gray-100" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-2/3 rounded bg-gray-100" />
                    <div className="h-2.5 w-1/2 rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {showEmpty && (
            <div className="flex flex-col items-center gap-1 px-4 py-6 text-center">
              <Building2 className="h-8 w-8 text-gray-200" />
              <p className="text-sm font-medium text-gray-500">
                Khong tim thay nha cung cap
              </p>
              <p className="text-xs text-gray-400">
                Thu tim kiem bang ten, ma hoac so dien thoai
              </p>
            </div>
          )}

          {/* Results */}
          {hasResults && !isLoading && (
            <>
              <div className="border-b border-gray-50 px-3 py-1.5">
                <span className="text-xs text-gray-400">
                  {suppliers.length} ket qua
                </span>
              </div>
              <ul
                ref={listRef}
                className="max-h-72 overflow-y-auto overscroll-contain py-1"
              >
                {suppliers.map((supplier, index) => {
                  const hasDebt = supplier.currentDebt > 0;
                  const isHighlighted = index === highlightedIndex;

                  return (
                    <li
                      key={supplier.id}
                      role="option"
                      aria-selected={value?.id === supplier.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelect(supplier);
                      }}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={cn(
                        "mx-1 cursor-pointer rounded-lg px-3 py-2.5 transition-colors",
                        isHighlighted
                          ? "bg-indigo-50"
                          : value?.id === supplier.id
                          ? "bg-indigo-50/60"
                          : "hover:bg-gray-50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold",
                              hasDebt
                                ? "bg-red-100 text-red-600"
                                : "bg-indigo-100 text-indigo-600"
                            )}
                          >
                            {supplier.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-semibold text-gray-800 truncate max-w-[160px]">
                                {supplier.name}
                              </span>
                              {value?.id === supplier.id && (
                                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500">
                                  <svg
                                    className="h-2.5 w-2.5 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                </span>
                              )}
                            </div>
                            <div className="mt-0.5 flex items-center gap-2 flex-wrap">
                              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                                <CreditCard className="h-3 w-3" />
                                {supplier.code}
                              </span>
                              {supplier.phone && (
                                <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                                  <Phone className="h-3 w-3" />
                                  {supplier.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex-shrink-0 text-right">
                          {hasDebt ? (
                            <span className="inline-block rounded-md bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600 ring-1 ring-inset ring-red-200">
                              No: {formatCurrency(supplier.currentDebt)}
                            </span>
                          ) : (
                            <span className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600 ring-1 ring-inset ring-emerald-200">
                              Khong no
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
