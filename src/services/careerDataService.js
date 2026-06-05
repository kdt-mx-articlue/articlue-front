export function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function readString(key, fallback = "") {
  return localStorage.getItem(key) || fallback;
}

export function writeString(key, value) {
  localStorage.setItem(key, String(value));
}

export function removeItem(key) {
  localStorage.removeItem(key);
}

export function clamp(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.min(100, Math.max(0, Math.round(number)));
}