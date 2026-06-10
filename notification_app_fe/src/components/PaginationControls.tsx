"use client";

import React from 'react';

interface Props {
  page: number;
  limit: number;
  onPageChange(next: number): void;
  onLimitChange(next: number): void;
}

export function PaginationControls({ page, limit, onPageChange, onLimitChange }: Props) {
  return (
    <div className="page-controls">
      <button onClick={() => onPageChange(Math.max(1, page - 1))} aria-label="Previous page">
        Prev
      </button>

      <span>Page {page}</span>

      <button onClick={() => onPageChange(page + 1)} aria-label="Next page">
        Next
      </button>

      <label style={{ marginLeft: 8 }}>
        Limit:
        <select value={String(limit)} onChange={(e) => onLimitChange(Number(e.target.value))} style={{ marginLeft: 6 }}>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
        </select>
      </label>
    </div>
  );
}
