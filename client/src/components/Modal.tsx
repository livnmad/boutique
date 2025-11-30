import React from 'react';
import './modal.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" tabIndex={-1}>
      <div className="modal" role="dialog" aria-modal="true">
        {title && <div className="modal-title">{title}</div>}
        <div className="modal-content">{children}</div>
        <button className="modal-close" onClick={onClose} autoFocus>OK</button>
      </div>
    </div>
  );
}
