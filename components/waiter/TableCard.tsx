/**
 * Table Card Component (Waiter)
 * 
 * Display table information for waiters
 * - Table number and status
 * - Active orders count
 * - Quick actions
 * - Status color coding
 */

'use client';

interface TableCardProps {
  table: unknown; // TODO: Replace with proper Table type
  onViewTable: (tableId: string) => void;
}

export default function TableCard(_props: TableCardProps) {
  return (
    <div className="table-card">
      {/* Table card implementation */}
    </div>
  );
}
