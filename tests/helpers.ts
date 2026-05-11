import { page } from '@rstest/browser';

export const NOTIFICATION_SELECTOR = '[data-monetr-notification]';
export const FRONT_NOTIFICATION_SELECTOR = '[data-monetr-notification][data-stack-index="0"]';
export const STACK_SELECTOR = '[data-monetr-notifier-stack]';

type DragOpts = { steps?: number; pointerType?: 'mouse' | 'touch'; targetSelector?: string };

export function getNotification(selector = FRONT_NOTIFICATION_SELECTOR): HTMLElement {
  const target = document.querySelector<HTMLElement>(selector);
  if (!target) {
    throw new Error(`No element matching ${selector} in the DOM`);
  }
  // Notification's onPointerDown calls setPointerCapture(event.pointerId). Synthetic PointerEvents
  // have a pointerId the browser never observed, so Chromium throws InvalidPointerId. Stub the
  // capture APIs to no-ops on the notification and its descendants. Local to tests, doesn't
  // change library behavior.
  for (const el of [target, ...Array.from(target.querySelectorAll<HTMLElement>('*'))]) {
    el.setPointerCapture = () => {};
    el.releasePointerCapture = () => {};
    el.hasPointerCapture = () => false;
  }
  return target;
}

function fire(target: HTMLElement, type: string, x: number, y: number, pointerType: 'mouse' | 'touch') {
  return target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      composed: true,
      pointerId: 1,
      pointerType,
      isPrimary: true,
      button: 0,
      buttons: type === 'pointerup' ? 0 : 1,
      clientX: x,
      clientY: y,
    }),
  );
}

// Yield to the event loop so React commits state updates between pointermove events.
const tick = () => new Promise<void>(r => setTimeout(r, 16));

export async function dragVertically(deltaY: number, opts: DragOpts = {}) {
  const steps = opts.steps ?? 8;
  const pointerType = opts.pointerType ?? 'touch';
  const target = getNotification(opts.targetSelector);
  const rect = target.getBoundingClientRect();
  const startX = rect.left + rect.width / 2;
  const startY = rect.top + rect.height / 2;

  fire(target, 'pointerdown', startX, startY, pointerType);
  await tick();
  for (let i = 1; i <= steps; i++) {
    fire(target, 'pointermove', startX, startY + (deltaY * i) / steps, pointerType);
    await tick();
  }
  fire(target, 'pointerup', startX, startY + deltaY, pointerType);
}

export async function dragHorizontally(deltaX: number, opts: DragOpts = {}) {
  const steps = opts.steps ?? 8;
  const pointerType = opts.pointerType ?? 'touch';
  const target = getNotification(opts.targetSelector);
  const rect = target.getBoundingClientRect();
  const startX = rect.left + rect.width / 2;
  const startY = rect.top + rect.height / 2;

  fire(target, 'pointerdown', startX, startY, pointerType);
  await tick();
  for (let i = 1; i <= steps; i++) {
    fire(target, 'pointermove', startX + (deltaX * i) / steps, startY, pointerType);
    await tick();
  }
  fire(target, 'pointerup', startX + deltaX, startY, pointerType);
}

export async function dragVerticallyImperfect(deltaY: number, driftX: number, opts: DragOpts = {}) {
  // Simulates a realistic human swipe: mostly vertical motion with a small lateral end-flick
  // as the finger lifts. Real hands almost never travel in a perfectly straight line, and a
  // fast vertical fling typically carries a few pixels of horizontal drift in the moment
  // between the last "real" motion and the lift.
  const steps = opts.steps ?? 4;
  const pointerType = opts.pointerType ?? 'touch';
  const target = getNotification(opts.targetSelector);
  const rect = target.getBoundingClientRect();
  const startX = rect.left + rect.width / 2;
  const startY = rect.top + rect.height / 2;

  fire(target, 'pointerdown', startX, startY, pointerType);
  await tick();
  for (let i = 1; i <= steps; i++) {
    fire(target, 'pointermove', startX, startY + (deltaY * i) / steps, pointerType);
    await tick();
  }
  // Drift fires tight against the lift (no tick gap) - a brief end-flick rather than a
  // separately-timed gesture.
  fire(target, 'pointermove', startX + driftX, startY + deltaY, pointerType);
  fire(target, 'pointerup', startX + driftX, startY + deltaY, pointerType);
}

export async function dragDiagonally(deltaX: number, deltaY: number, opts: DragOpts = {}) {
  const steps = opts.steps ?? 8;
  const pointerType = opts.pointerType ?? 'touch';
  const target = getNotification(opts.targetSelector);
  const rect = target.getBoundingClientRect();
  const startX = rect.left + rect.width / 2;
  const startY = rect.top + rect.height / 2;

  fire(target, 'pointerdown', startX, startY, pointerType);
  await tick();
  for (let i = 1; i <= steps; i++) {
    fire(target, 'pointermove', startX + (deltaX * i) / steps, startY + (deltaY * i) / steps, pointerType);
    await tick();
  }
  fire(target, 'pointerup', startX + deltaX, startY + deltaY, pointerType);
}

export async function enqueueViaButton(testId = 'enqueue') {
  await page.getByTestId(testId).click();
}

export async function clickAction() {
  await page.getByTestId('notification-action').click();
}

export async function clickDismiss() {
  await page.getByTestId('notification-dismiss').click();
}

export async function hoverStack(anchor = 'bottom-center') {
  // Real Playwright hover; synthetic pointerenter/leave events don't reliably trigger React's
  // listeners attached to non-bubbling events.
  await page.locator(`[data-stack-anchor="${anchor}"]`).hover();
}

export async function unhoverStack(_anchor = 'bottom-center') {
  // Move the pointer to a corner well away from any stack to fire pointerleave.
  await page.locator('body').hover({ position: { x: 1, y: 1 } });
}

export const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
