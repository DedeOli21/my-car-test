import type { ReactNode } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface AdminTableColumn<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

interface AdminCrudTableProps<T extends { id: string }> {
  title: string;
  rows: T[];
  columns: AdminTableColumn<T>[];
  searchValue: string;
  searchPlaceholder: string;
  emptyMessage: string;
  filters?: ReactNode;
  onSearchChange: (value: string) => void;
  onCreate: () => void;
  onEdit: (row: T) => void;
  onDelete: (row: T) => void;
}

const AdminCrudTable = <T extends { id: string }>({
  title,
  rows,
  columns,
  searchValue,
  searchPlaceholder,
  emptyMessage,
  filters,
  onSearchChange,
  onCreate,
  onEdit,
  onDelete,
}: AdminCrudTableProps<T>) => {
  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <Button onClick={onCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo
          </Button>
        </div>

        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9"
            />
          </div>
          {filters}
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.header} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
              <TableHead className="w-[112px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((column) => (
                    <TableCell key={column.header} className={column.className}>
                      {column.cell(row)}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(row)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(row)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="h-24 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminCrudTable;
