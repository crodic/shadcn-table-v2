import { getSortingStateParser } from '@/lib/parsers';
import { ColumnDef } from '@tanstack/react-table';
import { parseAsArrayOf, parseAsInteger, parseAsString, SingleParser, useQueryState, useQueryStates } from 'nuqs';
import { useMemo } from 'react';

interface useGetFilterParamsProps<TData> {
    allowedSorts?: string[];
    filterableColumns?: ColumnDef<TData>[];
}

export default function useGetFilterParams<TData>({ allowedSorts = [], filterableColumns = [] }: useGetFilterParamsProps<TData>) {
    const [page] = useQueryState('page', parseAsInteger.withDefault(1));
    const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10));
    const [sorting] = useQueryState('sort', getSortingStateParser<TData>(allowedSorts).withDefault([]));

    const filterParsers = useMemo(() => {
        return filterableColumns.reduce<Record<string, SingleParser<string> | SingleParser<string[]>>>(
            (acc, column) => {
                if (column.meta?.options) {
                    acc[column.id ?? ''] = parseAsArrayOf(parseAsString, ',');
                } else {
                    acc[column.id ?? ''] = parseAsString;
                }
                return acc;
            },
            {}
        );
    }, [filterableColumns]);
    const [filterValues] = useQueryStates(filterParsers);

    return {
        page,
        perPage,
        sorting,
        filter: filterValues,
    };
}
