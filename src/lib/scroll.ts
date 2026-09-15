/** Smooth scrolling, unless the visitor has asked their OS for reduced motion. */
export function scrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
}

/**
 * Scrolls an on-page section into view and records it in the URL hash.
 * Returns false when the section is not on the current page.
 */
export function scrollToSection(id: string): boolean {
  const section = document.getElementById(id);
  if (!section) return false;

  section.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
  window.history.replaceState(null, "", `#${id}`);
  return true;
}
