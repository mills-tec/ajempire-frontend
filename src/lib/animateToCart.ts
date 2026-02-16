interface AnimateToCartParams {
  buttonElement: HTMLElement;
  cartElement: HTMLElement;
  addItemCallback: () => void;
}

export function animateToCart({
  buttonElement,
  cartElement,
  addItemCallback,
}: AnimateToCartParams) {
  if (!buttonElement || !cartElement) {
    addItemCallback();
    return;
  }

  const buttonRect = buttonElement.getBoundingClientRect();
  const cartRect = cartElement.getBoundingClientRect();

  const startX = buttonRect.left + buttonRect.width / 2;
  const startY = buttonRect.top + buttonRect.height / 2;

  const endX = cartRect.left + cartRect.width / 2;
  const endY = cartRect.top + cartRect.height / 2;

  const deltaX = endX - startX;
  const deltaY = endY - startY;

  // Dynamic jump height based on distance
  const distance = Math.hypot(deltaX, deltaY);
  const minJump = 60;
  const maxJump = 150;
  const jumpHeight = Math.min(maxJump, Math.max(minJump, distance / 2));

  const circle = document.createElement('div');
  circle.style.position = 'fixed';
  circle.style.left = `${startX}px`;
  circle.style.top = `${startY}px`;
  circle.style.width = '14px';
  circle.style.height = '14px';
  circle.style.borderRadius = '50%';
  circle.style.background = '#FF008C';
  circle.style.pointerEvents = 'none';
  circle.style.zIndex = '9999';
  circle.style.transform = 'translate(-50%, -50%) scale(1)';
  circle.style.transition = `transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)`;

  document.body.appendChild(circle);

  // First animation — fly along arc
  requestAnimationFrame(() => {
    circle.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY - jumpHeight}px)) scale(0.8)`;
  });

  // Second animation — drop to cart
  setTimeout(() => {
    circle.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px)) scale(0.5)`;
  }, 300);

  setTimeout(() => {
    circle.remove();

    // Glow flash
    const glow = document.createElement('div');
    glow.className = 'cart-glow';
    cartElement.appendChild(glow);
    setTimeout(() => glow.remove(), 250);

    // Cart bounce
    cartElement.classList.add('cart-bounce');
    setTimeout(() => cartElement.classList.remove('cart-bounce'), 350);

    // Finally, add item
    addItemCallback();
  }, 650);
}
