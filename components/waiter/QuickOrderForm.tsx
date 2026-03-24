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

/**
 * Renders a simplified quick-order form for taking orders at a table.
 *
 * @param _props - Component props containing:
 *   - `tableId`: identifier of the table the order is for
 *   - `onSubmit`: callback invoked with the form data when the order is submitted
 * @returns A JSX element containing the quick-order form markup
 */
export default function QuickOrderForm(_props: QuickOrderFormProps) {
  return (
    <form className="quick-order-form">
      {/* Quick order form implementation */}
    </form>
  );
}
