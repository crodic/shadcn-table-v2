import { flexRender, type Table as TanstackTable } from '@tanstack/react-table';
import type * as React from 'react';

import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCommonPinningStyles } from '@/lib/data-table';
import { cn } from '@/lib/utils';
import { DataTableColumnFilter } from './data-table-column-filter';
import { Loader2 } from 'lucide-react';

interface DataTableProps<TData> extends React.ComponentProps<'div'> {
    table: TanstackTable<TData>;
    actionBar?: React.ReactNode;
    onRowClick?: (row: TData) => void;
    isDataLoading?: boolean;
}

export function DataTable<TData>({
    table,
    actionBar,
    children,
    className,
    onRowClick,
    isDataLoading,
    ...props
}: DataTableProps<TData>) {
    return (
        <div className={cn('flex w-full flex-col gap-2.5 overflow-auto', className)} {...props}>
            {children}
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        colSpan={header.colSpan}
                                        style={{
                                            ...getCommonPinningStyles({ column: header.column }),
                                        }}
                                        className={cn('my-1 space-y-1', header.column.getIndex() && 'align-top')}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}

                                        {(header.column.getCanFilter() || header.column.columnDef.meta?.variant) && (
                                            <DataTableColumnFilter
                                                column={header.column}
                                                table={table}
                                                isDataLoading={isDataLoading}
                                            />
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody className="[&_tr:nth-child(odd)]:bg-muted/20">
                        {isDataLoading ? (
                            <TableRow>
                                <TableCell colSpan={table.getAllColumns().length} className="h-24">
                                    <div className="flex items-center justify-center">
                                        <Loader2 className="animate-spin" size={32} />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            // style={
                                            //     {
                                            //         ...getCommonPinningStyles({ column: cell.column }),
                                            //     }
                                            // }
                                            onClick={() =>
                                                cell.id.includes('actions') || cell.id.includes('select')
                                                    ? undefined
                                                    : onRowClick?.(row.original)
                                            }
                                            className={cn(onRowClick && 'cursor-pointer')}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex flex-col gap-2.5">
                <DataTablePagination table={table} isDataLoading={isDataLoading} />
                {actionBar && table.getFilteredSelectedRowModel().rows.length > 0 && actionBar}
            </div>
        </div>
    );
}
