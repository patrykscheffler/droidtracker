import React from "react";

import { cn } from "~/lib/utils";

type Props = {
  children: React.ReactNode;
  combined?: boolean;
  containerProps?: JSX.IntrinsicElements["div"];
};

/**
 * Breakdown of Tailwind Magic below
 * [&_button]:border-l-0 [&_a]:border-l-0 -> Selects all buttons/a tags and applies a border left of 0
 * [&>*:first-child]:rounded-l-md [&>*:first-child]:border-l -> Selects the first child of the content
 * ounds the left side
 * [&>*:last-child]:rounded-r-md -> Selects the last child of the content and rounds the right side
 * We dont need to add border to the right as we never remove it
 */

export function ButtonGroup({
  children,
  combined = false,
  containerProps,
}: Props) {
  return (
    <div
      {...containerProps}
      className={cn(
        "flex",
        !combined
          ? "space-x-2"
          : "[&>*:first-child]:ml-0 [&>*:first-child]:rounded-l-md [&>*:first-child]:border-l [&>*:last-child]:rounded-r-md [&>a]:-ml-[1px] hover:[&>a]:z-[1] [&>button]:-ml-[1px] hover:[&>button]:z-[1] [&_a]:rounded-none [&_button]:rounded-none",
        containerProps?.className
      )}
    >
      {children}
    </div>
  );
}
