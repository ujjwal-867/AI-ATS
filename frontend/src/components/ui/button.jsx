import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-4 focus-visible:ring-[#D4AF37]/20 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#D4AF37] text-white shadow-md hover:bg-[#C49A18] hover:shadow-xl",

        outline:
          "border border-[#D4AF37] bg-white text-[#D4AF37] hover:bg-[#FFF8E1]",

        secondary:
          "bg-[#F3F4F6] text-[#111827] hover:bg-[#E5E7EB]",

        ghost:
          "bg-transparent text-[#374151] hover:bg-[#F9FAFB] hover:text-[#D4AF37]",

        destructive:
          "bg-red-600 text-white hover:bg-red-700",

        link:
          "bg-transparent text-[#D4AF37] underline-offset-4 hover:underline hover:text-[#B8860B]",
      },

      size: {
        xs: "h-8 px-3 text-xs",

        sm: "h-10 px-4 text-sm",

        default: "h-11 px-6 text-sm",

        lg: "h-12 px-8 text-base",

        icon: "h-11 w-11",

        "icon-xs": "h-8 w-8",

        "icon-sm": "h-10 w-10",

        "icon-lg": "h-12 w-12",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };