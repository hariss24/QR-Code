import * as React from "react";
import { cn } from "@/lib/utils";

export function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn("rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary-light", className)} {...props} />;
}
