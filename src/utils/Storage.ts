export const loadFromStorage = (key: string) => localStorage.getItem(key) || '';

export const saveToStorage = (key: string, data: string) =>
  localStorage.setItem(key, data);
