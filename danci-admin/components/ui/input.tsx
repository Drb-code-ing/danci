import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return <input type={type} className={cn("flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />;
}

export { Input };
