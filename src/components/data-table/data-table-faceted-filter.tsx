'use client';

import type { Column } from '@tanstack/react-table';
import { Check, PlusCircle, XCircle } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { Option } from '@/types/data-table';

interface DataTableFacetedFilterProps<TData, TValue> {
    column?: Column<TData, TValue>;
    title?: string;
    options: Option[];
    multiple?: boolean;
    compact?: boolean;
}

export function DataTableFacetedFilter<TData, TValue>({
    column,
    title,
    options,
    multiple,
    compact = false,
}: DataTableFacetedFilterProps<TData, TValue>) {
    const [open, setOpen] = React.useState(false);

    const columnFilterValue = column?.getFilterValue();
    const selectedValues = new Set(Array.isArray(columnFilterValue) ? columnFilterValue : []);

    const onItemSelect = React.useCallback(
        (option: Option, isSelected: boolean) => {
            if (!column) return;

            if (multiple) {
                const next = new Set(selectedValues);

                if (isSelected) {
                    next.delete(option.value);
                } else {
                    next.add(option.value);
                }

                const values = Array.from(next);
                column.setFilterValue(values.length ? values : undefined);
            } else {
                column.setFilterValue(isSelected ? undefined : [option.value]);
                setOpen(false);
            }
        },
        [column, multiple, selectedValues]
    );

    const onReset = React.useCallback(
        (e?: React.MouseEvent) => {
            e?.stopPropagation();
            column?.setFilterValue(undefined);
        },
        [column]
    );

    const hasValue = selectedValues.size > 0;
    const hasShowTopResetFilter = selectedValues.size > 3;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size={compact ? 'icon' : 'sm'}
                    className={cn('border-dashed font-normal', compact && 'h-7 w-7 p-0')}
                >
                    {/* ICON */}
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
                        <PlusCircle className={cn(compact && 'h-4 w-4')} />
                    )}

                    {/* NON-COMPACT CONTENT */}
                    {!compact && title}

                    {!compact && hasValue && (
                        <>
                            <Separator orientation="vertical" className="mx-0.5 data-[orientation=vertical]:h-4" />

                            <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                                {selectedValues.size}
                            </Badge>

                            <div className="hidden items-center gap-1 lg:flex">
                                {selectedValues.size > 2 ? (
                                    <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                                        {selectedValues.size} selected
                                    </Badge>
                                ) : (
                                    options
                                        .filter((opt) => selectedValues.has(opt.value))
                                        .map((opt) => (
                                            <Badge
                                                key={opt.value}
                                                variant="secondary"
                                                className="rounded-sm px-1 font-normal"
                                            >
                                                {opt.label}
                                            </Badge>
                                        ))
                                )}
                            </div>
                        </>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent align="start" className={cn('p-0', compact ? 'w-48' : 'w-50')}>
                <Command>
                    <CommandInput placeholder={compact ? 'Filter…' : title} />

                    <CommandList className="max-h-full">
                        <CommandEmpty>No results found.</CommandEmpty>

                        {hasShowTopResetFilter && (
                            <>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem onSelect={() => onReset()} className="justify-center text-center">
                                        Clear filters
                                    </CommandItem>
                                </CommandGroup>
                            </>
                        )}

                        <CommandGroup className="max-h-75 overflow-y-auto">
                            {options.map((option) => {
                                const isSelected = selectedValues.has(option.value);

                                return (
                                    <CommandItem key={option.value} onSelect={() => onItemSelect(option, isSelected)}>
                                        <div
                                            className={cn(
                                                'flex size-4 items-center justify-center rounded-sm border border-primary',
                                                isSelected ? 'bg-primary' : 'opacity-50 [&_svg]:invisible'
                                            )}
                                        >
                                            <Check />
                                        </div>

                                        {option.icon && <option.icon />}

                                        <span className="truncate">{option.label}</span>

                                        {option.count && (
                                            <span className="ml-auto font-mono text-xs">{option.count}</span>
                                        )}
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>

                        {hasValue && (
                            <>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem onSelect={() => onReset()} className="justify-center text-center">
                                        Clear filters
                                    </CommandItem>
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
