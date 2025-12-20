'use client';

import type { Column, Table } from '@tanstack/react-table';
import { X } from 'lucide-react';
import * as React from 'react';

import { DataTableDateFilter } from '@/components/data-table/data-table-date-filter';
import { DataTableFacetedFilter } from '@/components/data-table/data-table-faceted-filter';
import { DataTableSliderFilter } from '@/components/data-table/data-table-slider-filter';
import { DataTableViewOptions } from '@/components/data-table/data-table-view-options';
import { DataTableTextSearch } from '@/components/data-table/data-table-text-search';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DataTableToolbarProps<TData> extends React.ComponentProps<'div'> {
    table: Table<TData>;
}

export function DataTableToolbar<TData>({ table, children, className, ...props }: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0;

    const filterColumns = React.useMemo(
        () =>
            table
                .getAllColumns()
                .filter((column) => column.getCanFilter() && column.columnDef.meta?.variant !== 'text'),
        [table]
    );

    const onReset = React.useCallback(() => {
        table.resetColumnFilters();
    }, [table]);

    return (
        <div
            role="toolbar"
            aria-orientation="horizontal"
            className={cn('flex w-full items-start justify-between gap-2 p-1', className)}
            {...props}
        >
            <div className="flex flex-1 flex-wrap items-center gap-2">
                {/* SINGLE text search */}
                <DataTableTextSearch table={table} />

                {/* Other filters */}
                {filterColumns.map((column) => (
                    <DataTableToolbarFilter key={column.id} column={column} />
                ))}

                {isFiltered && (
                    <Button
                        aria-label="Reset filters"
                        variant="outline"
                        size="sm"
                        className="border-dashed"
                        onClick={onReset}
                    >
                        <X />
                        Reset
                    </Button>
                )}
            </div>

            <div className="flex items-center gap-2">
                {children}
                <DataTableViewOptions table={table} align="end" />
            </div>
        </div>
    );
}

interface DataTableToolbarFilterProps<TData> {
    column: Column<TData>;
}

function DataTableToolbarFilter<TData>({ column }: DataTableToolbarFilterProps<TData>) {
    const columnMeta = column.columnDef.meta;

    if (!columnMeta?.variant) return null;

    switch (columnMeta.variant) {
        case 'number':
            return (
                <div className="relative">
                    <input
                        type="number"
                        value={(column.getFilterValue() as string) ?? ''}
                        onChange={(e) => column.setFilterValue(e.target.value)}
                        className="h-8 w-30 rounded-md border px-2"
                    />
                </div>
            );

        case 'range':
            return <DataTableSliderFilter column={column} title={columnMeta.label ?? column.id} />;

        case 'date':
        case 'dateRange':
            return (
                <DataTableDateFilter
                    column={column}
                    title={columnMeta.label ?? column.id}
                    multiple={columnMeta.variant === 'dateRange'}
                />
            );

        case 'select':
        case 'multiSelect':
            return (
                <DataTableFacetedFilter
                    column={column}
                    title={columnMeta.label ?? column.id}
                    options={columnMeta.options ?? []}
                    multiple={columnMeta.variant === 'multiSelect'}
                />
            );

        default:
            return null;
    }
}
