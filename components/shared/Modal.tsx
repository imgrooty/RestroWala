/**
 * Modal Component
 * 
 * Reusable modal dialog
 * - Backdrop with click-to-close
 * - Customizable content
 * - Keyboard navigation (ESC to close)
 */

'use client';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal">
      {/* Modal implementation */}
    </div>
  );
}
