"use client";

import Link from "next/link";
import { PT_EVENT } from "./PageTransition";

type Props = React.ComponentProps<typeof Link> & { href: string };

/**
 * A link that hands the navigation to the tile overlay.
 *
 * It asks by dispatching a cancelable event rather than calling into a
 * module-level singleton. If the overlay is mounted and willing it calls
 * `preventDefault()`, and we stop the link here so the overlay can route when
 * its tiles have landed. If nothing claims the event — overlay not mounted
 * yet, reduced motion, same route — the event comes back uncancelled and this
 * stays an ordinary `<Link>`, which navigates as usual. There is no state in
 * which a click does nothing.
 */
export default function TransitionLink({ href, onClick, ...rest }: Props) {
  return (
    <Link
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        const ask = new CustomEvent(PT_EVENT, { detail: href, cancelable: true });
        window.dispatchEvent(ask);
        if (ask.defaultPrevented) e.preventDefault();
      }}
      {...rest}
    />
  );
}
