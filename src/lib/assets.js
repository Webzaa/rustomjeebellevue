export function asset(path) {
  if (!path) return '';
  const clean = path.replace(/^\/+/, '');
  return `${import.meta.env.BASE_URL}${clean}`;
}

