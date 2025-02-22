// src/components/ui/alert-dialog.tsx
import * as React from 'react';

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface AlertDialogContentProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

interface AlertDialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDialogCancelProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      {children}
    </div>
  );
}

export function AlertDialogContent({ children, className = "", style }: AlertDialogContentProps) {
  return (
    <div 
      className={`bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

export function AlertDialogHeader({ children, className = "" }: AlertDialogHeaderProps) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function AlertDialogTitle({ children, className = "" }: AlertDialogTitleProps) {
  return <h2 className={`text-2xl font-bold ${className}`}>{children}</h2>;
}

export function AlertDialogDescription({ children, className = "" }: AlertDialogDescriptionProps) {
  return <p className={`text-gray-600 mt-2 ${className}`}>{children}</p>;
}

export function AlertDialogFooter({ children, className = "" }: AlertDialogFooterProps) {
  return <div className={`mt-6 flex justify-end gap-4 ${className}`}>{children}</div>;
}

export function AlertDialogCancel({ 
  children, 
  onClick,
  className = ""
}: AlertDialogCancelProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg ${className || 'bg-gray-100 hover:bg-gray-200'}`}
    >
      {children}
    </button>
  );
}