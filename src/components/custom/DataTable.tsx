import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Column<T> {
  key: string;
  header: string;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  className?: string;
  stickyHeader?: boolean;
  zebra?: boolean;
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  className,
  stickyHeader = false,
  zebra = false,
  onRowClick,
}: DataTableProps<T>) {
  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <div className={cn("relative overflow-auto", className)}>
      <Table>
        <TableHeader className={cn(stickyHeader && "sticky top-0 z-10 bg-card")}>
          <TableRow className="border-border/50 hover:bg-transparent">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  "text-xs font-medium text-muted-foreground uppercase tracking-wider",
                  alignClasses[col.align || "left"],
                  col.width
                )}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow
              key={keyExtractor(item)}
              className={cn(
                "border-border/30 transition-colors duration-150",
                "hover:bg-muted/30",
                zebra && index % 2 === 1 && "bg-muted/10",
                onRowClick && "cursor-pointer"
              )}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  className={cn(
                    "py-3",
                    alignClasses[col.align || "left"]
                  )}
                >
                  {col.render
                    ? col.render(item)
                    : (item as Record<string, unknown>)[col.key] as React.ReactNode}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Simple wrapper for existing tables with styling
interface DataTableWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function DataTableWrapper({ children, className }: DataTableWrapperProps) {
  return (
    <div className={cn("rounded-lg bg-card border border-border/50 overflow-hidden", className)}>
      {children}
    </div>
  );
}
