// Vite rewrites CSS and HTML assets. Runtime URLs also need the deployment prefix.
export function publicUrl(path) {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  const base = import.meta.env.BASE_URL;
  if (base !== '/' && path.startsWith(base)) return path;
  return base + path.slice(1);
}
