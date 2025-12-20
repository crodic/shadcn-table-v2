'use client';

import * as React from 'react';
import type { Table } from '@tanstack/react-table';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function DataTableTextSearch<TData>({ table }: { table: Table<TData> }) {
    const textColumns = React.useMemo(
        () =>
            table
                .getAllColumns()
                .filter((column) => column.getCanFilter() && column.columnDef.meta?.variant === 'text'),
        [table]
    );

    const [activeColumnId, setActiveColumnId] = React.useState<string | null>(textColumns[0]?.id ?? null);

    const activeColumn = React.useMemo(
        () => textColumns.find((c) => c.id === activeColumnId),
        [activeColumnId, textColumns]
    );

    const onColumnChange = (columnId: string) => {
        // clear all other text filters
        textColumns.forEach((col) => {
            if (col.id !== columnId) {
                col.setFilterValue(undefined);
            }
        });
        setActiveColumnId(columnId);
    };

    if (!activeColumn) return null;

    return (
        <div className="flex items-center gap-2">
            <Select value={activeColumnId ?? undefined} onValueChange={onColumnChange}>
                <SelectTrigger className="h-8 w-[160px]">
                    <SelectValue placeholder="Select field" />
                </SelectTrigger>

                <SelectContent>
                    {textColumns.map((column) => (
                        <SelectItem key={column.id} value={column.id}>
                            {column.columnDef.meta?.label ?? column.id}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Input
                className="h-8 w-56"
                placeholder={activeColumn.columnDef.meta?.placeholder ?? activeColumn.columnDef.meta?.label}
                value={(activeColumn.getFilterValue() as string) ?? ''}
                onChange={(e) => activeColumn.setFilterValue(e.target.value)}
            />
        </div>
    );
}
