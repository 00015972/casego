/**
 * Sends a small orb from an add control to the visible cart button. This is
 * deliberately DOM-only: cart data remains owned by CartProvider.
 */
export function animateToCart(from: HTMLElement) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const targets = Array.from(
    document.querySelectorAll<HTMLElement>("[data-cart-target]"),
  );
  const to = targets.reverse().find((target) => {
    const rect = target.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });
  if (!to) return;

  const start = from.getBoundingClientRect();
  const end = to.getBoundingClientRect();
  const orb = document.createElement("span");
  orb.className = "cart-fly-orb";
  orb.style.left = `${start.left + start.width / 2 - 9}px`;
  orb.style.top = `${start.top + start.height / 2 - 9}px`;
  document.body.appendChild(orb);

  requestAnimationFrame(() => {
    orb.style.left = `${end.left + end.width / 2 - 9}px`;
    orb.style.top = `${end.top + end.height / 2 - 9}px`;
    orb.style.opacity = "0.35";
    orb.style.transform = "scale(0.25)";
  });

  to.classList.remove("cart-target-bounce");
  requestAnimationFrame(() => to.classList.add("cart-target-bounce"));
  window.setTimeout(() => {
    orb.remove();
    to.classList.remove("cart-target-bounce");
  }, 700);

  navigator.vibrate?.(18);
}
