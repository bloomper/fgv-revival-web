"use client";

import * as React from "react";
import {useState} from "react";
import {
    type Column,
    type ColumnDef,
    createPaginatedRowModel,
    createSortedRowModel,
    metaHelper,
    type PaginationState,
    type RowData,
    rowPaginationFeature,
    rowSelectionFeature,
    type RowSelectionState,
    rowSortingFeature,
    type SortingState,
    sortFns,
    tableFeatures,
    useTable
} from "@tanstack/react-table";
import {ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight} from "lucide-react";
import {useTranslations} from "next-intl";
import {Checkbox} from "@/components/ui/checkbox";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {DataEmpty} from "@/components/data-empty";
import {cn} from "@/utils/utils";

export const dataTableFeatures = tableFeatures({
    rowSelectionFeature,
    rowSortingFeature,
    rowPaginationFeature,
    sortedRowModel: createSortedRowModel(),
    paginatedRowModel: createPaginatedRowModel(),
    sortFns,
    columnMeta: metaHelper<{ className?: string }>()
});

export type DataTableColumnDef<TData extends RowData> = ColumnDef<typeof dataTableFeatures, TData>;

/**
 * A header that sorts its column, as in Spexregister. {@code sorted} is passed as a value so that the header renders
 * again when it changes.
 */
export function SortableHeader<TData extends RowData>({column, sorted, title}: {
    column: Column<typeof dataTableFeatures, TData>;
    sorted: false | "asc" | "desc";
    title: string
}) {
    return (
        <Button variant="ghost" onClick={() => column.toggleSorting(sorted === "asc")} className="-ml-4 h-8">
            {title}
            {sorted === "desc" ? <ArrowDown className="ml-2 h-4 w-4"/> : sorted === "asc" ? <ArrowUp className="ml-2 h-4 w-4"/> :
                <ArrowUpDown className="ml-2 h-4 w-4"/>}
        </Button>
    );
}

/**
 * A column of checkboxes for selecting rows, as in Spexregister; clicking it does not open the row.
 */
export function selectColumn<TData extends RowData>(labels: { all: string; row: (row: TData) => string }): DataTableColumnDef<TData> {
    return {
        id: "select",
        header: ({table}) => (
            <Checkbox checked={table.getIsAllPageRowsSelected()}
                      indeterminate={!table.getIsAllPageRowsSelected() && table.getIsSomePageRowsSelected()}
                      onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
                      aria-label={labels.all}/>
        ),
        cell: ({row}) => (
            <Checkbox checked={row.getIsSelected()} onCheckedChange={value => row.toggleSelected(!!value)} aria-label={labels.row(row.original)}/>
        ),
        enableSorting: false,
        meta: {className: "w-10"},
    };
}

/**
 * The look of Spexregister's tables for data that is all on the client: sorting and paging happen here, and the
 * caller filters the rows it passes. The toolbar goes in {@code children}, and {@code empty} replaces the generic text
 * shown when there are no rows at all.
 */
export function DataTable<TData extends { id: string }>({
                                                            columns,
                                                            data,
                                                            initialSorting = [],
                                                            initialPageSize = 15,
                                                            filtered = false,
                                                            onRowClick,
                                                            onSelectionChange,
                                                            empty,
                                                            children,
                                                        }: {
    columns: DataTableColumnDef<TData>[];
    data: TData[];
    initialSorting?: SortingState;
    initialPageSize?: number;
    filtered?: boolean;
    onRowClick?: (row: TData) => void;
    onSelectionChange?: (rows: TData[]) => void;
    empty?: React.ReactNode;
    children?: React.ReactNode;
}) {
    // TanStack Table changes its objects in place, which the React Compiler would cache across renders
    "use no memo";
    const t = useTranslations("Common");
    const [sorting, setSorting] = useState<SortingState>(initialSorting);
    const [pagination, setPagination] = useState<PaginationState>({pageIndex: 0, pageSize: initialPageSize});
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const table = useTable({
        features: dataTableFeatures,
        data,
        columns,
        state: {sorting, pagination, rowSelection},
        onSortingChange: setSorting,
        enableRowSelection: true,
        onRowSelectionChange: updater => {
            const next = typeof updater === "function" ? updater(rowSelection) : updater;

            setRowSelection(next);
            onSelectionChange?.(data.filter(row => next[row.id]));
        },
        onPaginationChange: setPagination,
        autoResetPageIndex: true,
        getRowId: row => row.id,
    });
    const rows = table.getRowModel().rows;
    const pageCount = Math.max(1, table.getPageCount());

    return (
        <div className="space-y-4">
            {children}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <TableHead key={header.id} className={header.column.columnDef.meta?.className}>
                                        {header.isPlaceholder ? null : <table.FlexRender header={header}/>}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {rows.length ? rows.map(row => (
                            <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className={cn(onRowClick && "cursor-pointer")}
                                      onClick={() => onRowClick?.(row.original)}>
                                {row.getAllCells().map(cell => (
                                    <TableCell key={cell.id} className={cn("h-12", cell.column.columnDef.meta?.className)}
                                               onClick={event => (cell.column.id === "select" || cell.column.id === "actions") && event.stopPropagation()}>
                                        <table.FlexRender cell={cell}/>
                                    </TableCell>
                                ))}
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    {filtered ? <DataEmpty title={t("noFilterMatchHeading")} description={t("noFilterMatchDescription")}/> : empty ?? <DataEmpty/>}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex flex-col items-end gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">{t("rowsPerPage")}</p>
                    <Select value={`${pagination.pageSize}`} onValueChange={value => value !== null && table.setPageSize(Number(value))}>
                        <SelectTrigger className="h-8 w-17.5">
                            <SelectValue placeholder={pagination.pageSize}/>
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 15, 20, 25, 30, 40, 50].map(size => <SelectItem key={size} value={`${size}`}>{size}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex w-full items-center justify-end space-x-2 sm:w-auto">
                    <p className="text-sm font-medium whitespace-nowrap">
                        {t("pageOf", {page: Math.min(pagination.pageIndex + 1, pageCount), pages: pageCount})}
                    </p>
                    <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" aria-label={t("firstPage")}
                            onClick={() => table.firstPage()} disabled={!table.getCanPreviousPage()}>
                        <ChevronsLeft className="h-4 w-4"/>
                    </Button>
                    <Button variant="outline" className="h-8 w-8 p-0" aria-label={t("previousPage")}
                            onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                        <ChevronLeft className="h-4 w-4"/>
                    </Button>
                    <Button variant="outline" className="h-8 w-8 p-0" aria-label={t("nextPage")}
                            onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                        <ChevronRight className="h-4 w-4"/>
                    </Button>
                    <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" aria-label={t("lastPage")}
                            onClick={() => table.lastPage()} disabled={!table.getCanNextPage()}>
                        <ChevronsRight className="h-4 w-4"/>
                    </Button>
                </div>
            </div>
        </div>
    );
}
