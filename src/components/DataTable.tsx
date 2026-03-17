import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useState, useMemo } from "react";

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  searchable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export function DataTable<T extends { id?: string }>({ columns, data, pageSize = 20, searchable = true, searchPlaceholder = "Search..." }: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(row =>
      columns.some(col => {
        let val: any;
        if (typeof col.accessor === "function") {
          val = col.accessor(row);
        } else {
          val = (row as any)[col.accessor];
        }
        if (val == null) return false;
        return String(typeof val === "object" ? "" : val).toLowerCase().includes(q);
      })
    );
  }, [data, search, columns]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      {searchable && (
        <div className="p-3 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              className="pl-9 h-8 text-sm"
            />
          </div>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border">
            {columns.map((col, i) => (
              <TableHead key={i} className={`text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-9 ${col.className || ""}`}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paged.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center text-sm text-muted-foreground py-8">
                {search ? "No results found" : "No data available"}
              </TableCell>
            </TableRow>
          ) : (
            paged.map((row, ri) => (
              <TableRow key={(row as any).id || ri} className="border-b border-border last:border-0">
                {columns.map((col, ci) => (
                  <TableCell key={ci} className={`text-sm py-2 ${col.className || ""}`}>
                    {typeof col.accessor === "function"
                      ? col.accessor(row)
                      : String((row as any)[col.accessor] ?? "")}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {search ? `${filtered.length} results — ` : ""}Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
