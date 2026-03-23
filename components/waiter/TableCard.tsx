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
  table: any; // TODO: Replace with proper Table type
  onViewTable: (tableId: string) => void;
}

export default function TableCard({ table: _table, onViewTable: _onViewTable }: TableCardProps) {
  return (
    <div className="table-card">
      {/* Table card implementation */}
    </div>
  );
}
