"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogClose = DialogPrimitive.Close;
const DialogTitle = DialogPrimitive.Title;

function DialogContent({ className, children, ...props }: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="modal-backdrop" />
    <DialogPrimitive.Content className={cn("modal", className)} {...props}>
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>;
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("dialog-header", className)} {...props} />;
}

function DialogCloseButton() {
  return <DialogClose className="icon-btn" aria-label="关闭"><X size={18} /></DialogClose>;
}

export { Dialog, DialogClose, DialogCloseButton, DialogContent, DialogHeader, DialogTitle };
