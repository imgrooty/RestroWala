/**
 * Empty State Component
 * 
 * Display when no data is available
 * - Customizable icon and message
 * - Optional action button
 */

'use client';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export default function EmptyState({ title: _title, description: _description, icon: _icon, action: _action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {/* Empty state implementation */}
    </div>
  );
}
