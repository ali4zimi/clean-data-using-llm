'use client';

import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  ColumnOrderState,
} from '@tanstack/react-table';

interface DataTableProps {
  data: any[];
  columns: ColumnDef<any>[];
  columnOrder: ColumnOrderState;
  onColumnOrderChange: (newOrder: ColumnOrderState) => void;
  maxHeight?: string;
}

export default function DataTable({ 
  data, 
  columns, 
  columnOrder, 
  onColumnOrderChange,
  maxHeight = '400px' 
}: DataTableProps) {
  const table = useReactTable({
    data,
    columns,
    state: {
      columnOrder,
    },
    onColumnOrderChange: (updaterOrValue) => {
      const newOrder = typeof updaterOrValue === 'function' 
        ? updaterOrValue(columnOrder) 
        : updaterOrValue;
      onColumnOrderChange(newOrder);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    const draggedColumnId = e.dataTransfer.getData('text/plain');
    
    if (draggedColumnId !== targetColumnId) {
      const draggedIndex = columnOrder.indexOf(draggedColumnId);
      const targetIndex = columnOrder.indexOf(targetColumnId);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newOrder = [...columnOrder];
        const [movedColumn] = newOrder.splice(draggedIndex, 1);
        newOrder.splice(targetIndex, 0, movedColumn);
        onColumnOrderChange(newOrder);
      }
    }
  };

  return (
    <div className="mb-4">
      <p className="text-xs text-gray-500 mb-2">
        💡 Drag the ⋮⋮ handles to reorder columns. Click column names to sort data.
      </p>
      <div 
        className="overflow-x-auto overflow-y-auto border border-gray-300 rounded"
        style={{ maxHeight }}
      >
        <table className="min-w-full text-sm border-collapse">
          <thead className="bg-gray-100 sticky top-0">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id} 
                    className="border border-gray-300 px-3 py-2 text-left font-medium cursor-pointer hover:bg-gray-200 select-none"
                    onClick={header.column.getToggleSortingHandler()}
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', header.column.id);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDrop={(e) => handleDrop(e, header.column.id)}
                    style={{ 
                      userSelect: 'none',
                      cursor: 'grab'
                    }}
                    onMouseDown={(e) => {
                      (e.target as HTMLElement).style.cursor = 'grabbing';
                    }}
                    onMouseUp={(e) => {
                      (e.target as HTMLElement).style.cursor = 'grab';
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <span className="mr-2" style={{ cursor: 'grab' }} title="Drag to reorder columns">⋮⋮</span>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </span>
                      <span className="ml-1">
                        {{
                          asc: '↑',
                          desc: '↓',
                        }[header.column.getIsSorted() as string] ?? '↕'}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, index) => (
              <tr key={row.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="border border-gray-300 px-3 py-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
