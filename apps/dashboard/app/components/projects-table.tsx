import { useMemo, useRef, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { useAuraEvent } from '~/lib/aura';
import { ArrowUpDown, Eye, Plus } from 'lucide-react';
import { Link } from 'react-router';
import { useProjectStore } from '~/store/project-store';
import { format } from 'date-fns';
export type { Project } from '~/types/projects';
import type { Project } from '~/types/projects';

const columns: ColumnDef<Project>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <a-button
        variant="ghost"
        size="sm"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Project
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </a-button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        {row.original.logoUrl ? (
          <img
            src={row.original.logoUrl}
            alt={row.original.name}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
            {row.original.name[0]}
          </div>
        )}
        <span className="font-medium">{row.original.name}</span>
      </div>
    ),
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => (
      <p className="text-sm text-muted-foreground line-clamp-2">
        {row.original.description}
      </p>
    ),
  },
  {
    accessorKey: 'remainingtokens',
    header: 'Remaining Tokens',
    cell: ({ getValue }) => getValue() ?? '-',
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ getValue }) =>
      getValue() ? format(new Date(getValue() as string), 'PP') : '-',
  },
  {
    accessorKey: 'selectedPlanId',
    header: 'Plan',
    cell: ({ getValue }) => {
      const planId = getValue() as number | null;
      return planId === null ? (
        <span className="text-green-600 font-medium">Free</span>
      ) : (
        `#${planId}`
      );
    },
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ getValue }) => (
      <span
        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
          getValue()
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        {getValue() ? 'Active' : 'Inactive'}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <Link to={`/projects/${row.original.id}`}>
        <a-button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </a-button>
      </Link>
    ),
  },
];

export function ProjectsTable({ data }: { data: Project[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filter, setFilter] = useState('');
  const filterRef = useRef<HTMLElement>(null);
  useAuraEvent<string>(filterRef, 'change', setFilter);
  const { setSelectedProject } = useProjectStore();

  const filteredData = useMemo(
    () =>
      data.filter((p) => p.name.toLowerCase().includes(filter.toLowerCase())),
    [data, filter],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <a-input
          ref={filterRef}
          placeholder="Search projects..."
          value={filter}
          className="max-w-xs"
        />
        <Link to="/projects/new">
          <a-button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </a-button>
        </Link>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No projects found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
