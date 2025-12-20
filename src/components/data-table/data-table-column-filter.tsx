import { Column, Table as TanstackTable } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { DataTableDateFilter } from '@/components/data-table/data-table-date-filter';
import { DataTableFacetedFilter } from '@/components/data-table/data-table-faceted-filter';
import { Button } from '../ui/button';
import { XIcon } from 'lucide-react';
import { DataTableSliderFilter } from './data-table-slider-filter';

export function DataTableColumnFilter<TData>({
    column,
    table,
}: {
    column: Column<TData>;
    table: TanstackTable<TData>;
    isDataLoading?: boolean;
}) {
    const meta = column.columnDef.meta;

    if (!column.getCanFilter() || !meta?.variant) return null;

    switch (meta.variant) {
        case 'text':
            return (
                <Input
                    className="h-8"
                    placeholder={meta.placeholder ?? meta.label}
                    value={(column.getFilterValue() as string) ?? ''}
                    onChange={(e) => column.setFilterValue(e.target.value)}
                />
            );

        case 'select':
        case 'multiSelect':
            return (
                <DataTableFacetedFilter
                    column={column}
                    title=""
                    options={meta.options ?? []}
                    multiple={meta.variant === 'multiSelect'}
                    // compact
                />
            );

        case 'date':
        case 'dateRange':
            return <DataTableDateFilter column={column} title="" multiple={meta.variant === 'dateRange'} compact />;

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
            return <DataTableSliderFilter column={column} title={column.columnDef.meta?.label ?? column.id} />;

        case 'reset':
            return (
                <Button variant="outline" onClick={() => table.resetColumnFilters()}>
                    <XIcon className="size-4" />
                    Reset
                </Button>
            );

        default:
            return null;
    }
}
