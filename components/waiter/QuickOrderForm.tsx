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
  onSubmit: (data: unknown) => void;
}

export default function QuickOrderForm(_props: QuickOrderFormProps) {
  return (
    <form className="quick-order-form">
      {/* Quick order form implementation */}
    </form>
  );
}
