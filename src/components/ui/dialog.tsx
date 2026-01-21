import React, { createContext, useContext, useMemo, useState } from "react";

type DialogContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);

export function Dialog({ defaultOpen, open, onOpenChange, children }: {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
  const actualOpen = open ?? internalOpen;

  const setOpen = (next: boolean) => {
    if (open === undefined) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  const context = useMemo(() => ({ open: actualOpen, setOpen }), [actualOpen]);

  return <DialogContext.Provider value={context}>{children}</DialogContext.Provider>;
}

export function DialogTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactElement }) {
  const context = useContext(DialogContext);
  if (!context) return null;
  const triggerProps = {
    onClick: () => context.setOpen(true),
  };
  return asChild ? React.cloneElement(children, triggerProps) : <button type="button" {...triggerProps}>{children}</button>;
}

export function DialogContent({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  const context = useContext(DialogContext);
  if (!context || !context.open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className={`relative ${className ?? ""}`}>
        <button
          type="button"
          className="absolute right-4 top-4 text-white/60"
          onClick={() => context.setOpen(false)}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={className} {...props} />;
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={className} {...props} />;
}

export function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={className} {...props} />;
}
