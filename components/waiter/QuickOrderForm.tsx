/**
 * Quick Order Form Component
 * 
 * Simplified order taking interface for waiters
 * - Quick item search/selection
 * - Quantity input
 * - Special instructions
 * - Submit order
 */

'use client';

interface QuickOrderFormProps {
  tableId: string;
  onSubmit: (data: any) => void;
}

export default function QuickOrderForm({ tableId, onSubmit }: QuickOrderFormProps) {
  return (
    <form className="quick-order-form">
      {/* Quick order form implementation */}
    </form>
  );
}
