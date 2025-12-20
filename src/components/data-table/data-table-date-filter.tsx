'use client';

import type { Column } from '@tanstack/react-table';
import { CalendarIcon, XCircle } from 'lucide-react';
import * as React from 'react';
import type { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

type DateSelection = Date[] | DateRange;

function getIsDateRange(value: DateSelection): value is DateRange {
    return value && typeof value === 'object' && !Array.isArray(value);
}

function parseAsDate(timestamp: number | string | undefined): Date | undefined {
    if (!timestamp) return undefined;
    const numericTimestamp = typeof timestamp === 'string' ? Number(timestamp) : timestamp;
    const date = new Date(numericTimestamp);
    return !Number.isNaN(date.getTime()) ? date : undefined;
}

function parseColumnFilterValue(value: unknown) {
    if (value === null || value === undefined) return [];

    if (Array.isArray(value)) {
        return value.map((item) => (typeof item === 'number' || typeof item === 'string' ? item : undefined));
    }

    if (typeof value === 'string' || typeof value === 'number') {
        return [value];
    }

    return [];
}

interface DataTableDateFilterProps<TData> {
    column: Column<TData, unknown>;
    title?: string;
    multiple?: boolean;
    compact?: boolean;
}

export function DataTableDateFilter<TData>({
    column,
    title,
    multiple,
    compact = false,
}: DataTableDateFilterProps<TData>) {
    const columnFilterValue = column.getFilterValue();

    const selectedDates = React.useMemo<DateSelection>(() => {
        if (!columnFilterValue) {
            return multiple ? { from: undefined, to: undefined } : [];
        }

        if (multiple) {
            const timestamps = parseColumnFilterValue(columnFilterValue);
            return {
                from: parseAsDate(timestamps[0]),
                to: parseAsDate(timestamps[1]),
            };
        }

        const timestamps = parseColumnFilterValue(columnFilterValue);
        const date = parseAsDate(timestamps[0]);
        return date ? [date] : [];
    }, [columnFilterValue, multiple]);

    const onSelect = React.useCallback(
        (date: Date | DateRange | undefined) => {
            if (!date) {
                column.setFilterValue(undefined);
                return;
            }

            if (multiple && !('getTime' in date)) {
                const from = date.from?.getTime();
                const to = date.to?.getTime();
                column.setFilterValue(from || to ? [from, to] : undefined);
            } else if (!multiple && 'getTime' in date) {
                column.setFilterValue(date.getTime());
            }
        },
        [column, multiple]
    );

    const onReset = React.useCallback(
        (event?: React.MouseEvent) => {
            event?.stopPropagation();
            column.setFilterValue(undefined);
        },
        [column]
    );

    const hasValue = React.useMemo(() => {
        if (multiple) {
            if (!getIsDateRange(selectedDates)) return false;
            return Boolean(selectedDates.from || selectedDates.to);
        }
        if (!Array.isArray(selectedDates)) return false;
        return selectedDates.length > 0;
    }, [multiple, selectedDates]);

    const formatDateRange = React.useCallback((range: DateRange) => {
        if (!range.from && !range.to) return '';
        if (range.from && range.to) {
            return `${formatDate(range.from)} - ${formatDate(range.to)}`;
        }
        return formatDate(range.from ?? range.to);
    }, []);

    const label = React.useMemo(() => {
        if (compact) return null;

        if (multiple) {
            if (!getIsDateRange(selectedDates)) return null;

            const hasSelected = selectedDates.from || selectedDates.to;
            const dateText = hasSelected ? formatDateRange(selectedDates) : 'Select date range';

            return (
                <span className="flex items-center gap-2">
                    <span>{title}</span>
                    {hasSelected && (
                        <>
                            <Separator orientation="vertical" className="mx-0.5 data-[orientation=vertical]:h-4" />
                            <span>{dateText}</span>
                        </>
                    )}
                </span>
            );
        }

        if (getIsDateRange(selectedDates)) return null;

        const hasSelected = selectedDates.length > 0;
        const dateText = hasSelected ? formatDate(selectedDates[0]) : 'Select date';

        return (
            <span className="flex items-center gap-2">
                <span>{title}</span>
                {hasSelected && (
                    <>
                        <Separator orientation="vertical" className="mx-0.5 data-[orientation=vertical]:h-4" />
                        <span>{dateText}</span>
                    </>
                )}
            </span>
        );
    }, [compact, multiple, selectedDates, title, formatDateRange]);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    // size={compact ? 'icon' : 'sm'}
                    size="sm"
                    // className={cn('border-dashed font-normal', compact && 'h-7 w-7 p-0')}
                    className={cn('border-dashed font-normal')}
                >
                    {hasValue ? (
                        <div
                            role="button"
                            aria-label={`Clear ${title} filter`}
                            tabIndex={0}
                            onClick={onReset}
                            className="rounded-sm opacity-70 transition-opacity hover:opacity-100"
                        >
                            <XCircle className={cn(compact && 'h-4 w-4')} />
                        </div>
                    ) : (
                        <CalendarIcon className={cn(compact && 'h-4 w-4')} />
                    )}

                    {/* NON-COMPACT ONLY */}
                    {label}
                </Button>
            </PopoverTrigger>

            <PopoverContent align="start" className={cn('p-0', compact ? 'w-auto' : 'w-auto')}>
                {multiple ? (
                    <Calendar
                        autoFocus
                        captionLayout="dropdown"
                        mode="range"
                        selected={getIsDateRange(selectedDates) ? selectedDates : { from: undefined, to: undefined }}
                        onSelect={onSelect}
                    />
                ) : (
                    <Calendar
                        captionLayout="dropdown"
                        mode="single"
                        selected={!getIsDateRange(selectedDates) ? selectedDates[0] : undefined}
                        onSelect={onSelect}
                    />
                )}
            </PopoverContent>
        </Popover>
    );
}
