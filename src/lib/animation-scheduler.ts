type AnimationCallback = (seconds: number) => void;
const subscribers = new Set<AnimationCallback>();
let frame = 0;
let lastFrame = 0;

function tick(timestamp: number) {
  if (document.hidden || subscribers.size === 0) {
    frame = 0;
    return;
  }
  if (timestamp - lastFrame >= 80) {
    lastFrame = timestamp;
    for (const callback of subscribers) callback(timestamp / 1_000);
  }
  frame = requestAnimationFrame(tick);
}
function start() {
  if (!frame && !document.hidden && subscribers.size) frame = requestAnimationFrame(tick);
}
function onVisibilityChange() {
  if (document.hidden) {
    cancelAnimationFrame(frame);
    frame = 0;
  } else start();
}

/** A single 12.5 fps scheduler shared by visible previews; completely stopped when tab is hidden. */
export function subscribeAnimation(callback: AnimationCallback) {
  subscribers.add(callback);
  if (subscribers.size === 1) {
    document.addEventListener("visibilitychange", onVisibilityChange);
    start();
  }
  return () => {
    subscribers.delete(callback);
    if (subscribers.size === 0) {
      cancelAnimationFrame(frame);
      frame = 0;
      document.removeEventListener("visibilitychange", onVisibilityChange);
    }
  };
}
