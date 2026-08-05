import * as React from "react";
import { cn } from "@/lib/utils";

function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "group overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37] hover:shadow-xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 border-b border-[#F3F4F6] px-6 py-5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function CardTitle({ className, children, ...props }) {
  return (
    <h3
      className={cn(
        "text-xl font-bold tracking-tight text-[#111827]",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

function CardDescription({
  className,
  children,
  ...props
}) {
  return (
    <p
      className={cn(
        "text-sm leading-6 text-slate-500",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

function CardAction({
  className,
  children,
  ...props
}) {
  return (
    <div
      className={cn(
        "ml-auto flex items-center",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function CardContent({
  className,
  children,
  ...props
}) {
  return (
    <div
      className={cn(
        "px-6 py-5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function CardFooter({
  className,
  children,
  ...props
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-t border-[#F3F4F6] bg-[#FAFAFA] px-6 py-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};