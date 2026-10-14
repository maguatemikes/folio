/**
 * Run expensive setup (a WebGL context, texture uploads) only once an element is
 * close to the viewport, and tear it down with the caller. Keeps navigation
 * smooth: work far down the page costs nothing until it is nearly on screen.
 */
export function whenNear(
  el: Element,
  boot: () => (() => void) | void,
  rootMargin = "300px"
): () => void {
  let teardown: (() => void) | void;
  let disposed = false;

  const io = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting || teardown || disposed) return;
      io.disconnect();
      teardown = boot();
    },
    { rootMargin }
  );
  io.observe(el);

  return () => {
    disposed = true;
    io.disconnect();
    teardown?.();
  };
}
