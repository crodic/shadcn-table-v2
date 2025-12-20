'use client';

import * as React from 'react';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar';
import { DataTableFilterList } from '@/components/data-table/data-table-filter-list';
import { DataTableFilterMenu } from '@/components/data-table/data-table-filter-menu';
import { DataTableSortList } from '@/components/data-table/data-table-sort-list';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import type { Task } from '@/db/schema';
import { useDataTable } from '@/hooks/use-data-table';
import type { DataTableRowAction, QueryKeys } from '@/types/data-table';
import type { getEstimatedHoursRange, getTaskPriorityCounts, getTaskStatusCounts, getTasks } from '../lib/queries';
import { DeleteTasksDialog } from './delete-tasks-dialog';
import { useFeatureFlags } from './feature-flags-provider';
import { TasksTableActionBar } from './tasks-table-action-bar';
import { getTasksTableColumns } from './tasks-table-columns';
import { UpdateTaskSheet } from './update-task-sheet';
import { useRouter } from 'next/navigation';
import { parseAsArrayOf, parseAsInteger, parseAsString, SingleParser, useQueryState, useQueryStates } from 'nuqs';
import { getSortingStateParser } from '@/lib/parsers';
import useGetFilterParams from '@/hooks/use-get-filter-params';

interface TasksTableProps {
    promises: Promise<
        [
            Awaited<ReturnType<typeof getTasks>>,
            Awaited<ReturnType<typeof getTaskStatusCounts>>,
            Awaited<ReturnType<typeof getTaskPriorityCounts>>,
            Awaited<ReturnType<typeof getEstimatedHoursRange>>
        ]
    >;
    queryKeys?: Partial<QueryKeys>;
}

export function TasksTable({ promises, queryKeys }: TasksTableProps) {
    const { enableAdvancedFilter, filterFlag } = useFeatureFlags();
    const [rowAction, setRowAction] = React.useState<DataTableRowAction<Task> | null>(null);
    const router = useRouter();

    const [{ data, pageCount }, statusCounts, priorityCounts, estimatedHoursRange] = React.use(promises);

    const columns = React.useMemo(
        () =>
            getTasksTableColumns({
                statusCounts,
                priorityCounts,
                estimatedHoursRange,
                setRowAction,
            }),
        [statusCounts, priorityCounts, estimatedHoursRange]
    );

    const filterableColumns = React.useMemo(() => {
        if (enableAdvancedFilter) return [];

        return columns.filter((column) => column.enableColumnFilter);
    }, [columns, enableAdvancedFilter]);

    const { filter } = useGetFilterParams<Task>({ allowedSorts: ['status'], filterableColumns });

    React.useEffect(() => {
        console.log(filter);
        console.log('Call API');
    }, [filter]);

    const { table, shallow, debounceMs, throttleMs } = useDataTable({
        data,
        columns,
        pageCount,
        enableAdvancedFilter,
        initialState: {
            sorting: [{ id: 'createdAt', desc: true }],
            columnPinning: { right: ['actions'] },
        },
        queryKeys,
        getRowId: (originalRow) => originalRow.id,
        shallow: false,
        clearOnDefault: true,
    });

    const handleClickOnRow = (row: Task) => {
        router.push(`/tasks/${row.id}`);
    };

    return (
        <>
            <DataTable table={table} actionBar={<TasksTableActionBar table={table} />} onRowClick={handleClickOnRow}>
                {enableAdvancedFilter ? (
                    <DataTableAdvancedToolbar table={table}>
                        <DataTableSortList table={table} align="start" />
                        {filterFlag === 'advancedFilters' ? (
                            <DataTableFilterList
                                table={table}
                                shallow={shallow}
                                debounceMs={debounceMs}
                                throttleMs={throttleMs}
                                align="start"
                            />
                        ) : (
                            <DataTableFilterMenu
                                table={table}
                                shallow={shallow}
                                debounceMs={debounceMs}
                                throttleMs={throttleMs}
                            />
                        )}
                    </DataTableAdvancedToolbar>
                ) : (
                    <DataTableToolbar table={table}>
                        <DataTableSortList table={table} align="end" />
                    </DataTableToolbar>
                )}
            </DataTable>
            <UpdateTaskSheet
                open={rowAction?.variant === 'update'}
                onOpenChange={() => setRowAction(null)}
                task={rowAction?.row.original ?? null}
            />
            <DeleteTasksDialog
                open={rowAction?.variant === 'delete'}
                onOpenChange={() => setRowAction(null)}
                tasks={rowAction?.row.original ? [rowAction?.row.original] : []}
                showTrigger={false}
                onSuccess={() => rowAction?.row.toggleSelected(false)}
            />
        </>
    );
}
