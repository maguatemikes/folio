"use client";

import Link from "next/link";
import { transitionTo } from "./PageTransition";

type Props = React.ComponentProps<typeof Link> & { href: string };

/** A link that plays the grid wipe before the route changes. */
export default function TransitionLink({ href, onClick, children, ...rest }: Props) {
  return (
    <Link
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        // let the overlay run; it pushes the route itself
        if (transitionTo(href)) e.preventDefault();
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
