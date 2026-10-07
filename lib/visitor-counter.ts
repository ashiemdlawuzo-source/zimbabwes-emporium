'use client';

const STORAGE_KEY = 'ze_visit_count';
const COUNTAPI_NAMESPACE = 'zimbabwes-emporium-global';
const COUNTAPI_KEY = 'visits';
const SESSION_KEY = 'ze_visit_session';

export async function incrementVisitorCount(): Promise<number> {
  if (typeof window === 'undefined') return 0;

  if (sessionStorage.getItem(SESSION_KEY)) {
    return getStoredCount();
  }
  sessionStorage.setItem(SESSION_KEY, '1');

  try {
    const res = await fetch(
      `https://api.countapi.xyz/hit/${COUNTAPI_NAMESPACE}/${COUNTAPI_KEY}`,
      { cache: 'no-store' }
    );
    if (res.ok) {
      const data = await res.json();
      if (typeof data.value === 'number') {
        localStorage.setItem(STORAGE_KEY, String(data.value));
        return data.value;
      }
    }
  } catch {
    // network error — fall through to localStorage
  }

  const current = getStoredCount();
  const next = current + 1;
  localStorage.setItem(STORAGE_KEY, String(next));
  return next;
}

export async function fetchGlobalCount(): Promise<number | null> {
  if (typeof window === 'undefined') return null;

  try {
    const res = await fetch(
      `https://api.countapi.xyz/get/${COUNTAPI_NAMESPACE}/${COUNTAPI_KEY}`,
      { cache: 'no-store' }
    );
    if (res.ok) {
      const data = await res.json();
      if (typeof data.value === 'number') {
        localStorage.setItem(STORAGE_KEY, String(data.value));
        return data.value;
      }
    }
  } catch {
    // network error
  }
  return null;
}

export function getStoredCount(): number {
  if (typeof window === 'undefined') return 0;
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? parseInt(raw, 10) || 0 : 0;
}
