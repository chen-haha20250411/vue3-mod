/**
 * Simple path resolution for URL paths (not file system paths)
 * Replaces Node.js path module for browser compatibility
 */
export function resolvePath(basePath, routePath) {
  if (!basePath || basePath === '/') return routePath || '/'
  if (!routePath || routePath === '/') return basePath
  
  // Handle external URLs
  if (routePath.startsWith('http')) return routePath
  
  // Remove trailing slash from basePath
  const base = basePath.replace(/\/$/, '')
  // Remove leading slash from routePath
  const route = routePath.replace(/^\//, '')
  
  if (!route) return base
  return base + '/' + route
}

export default {
  resolve: resolvePath
}