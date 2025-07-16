import { env } from '@/lib/env'

/**
 * Performance utilities for the ResumeBuilder AI application
 */

// Simple in-memory cache with TTL
class SimpleCache<T> {
  private cache = new Map<string, { value: T; expires: number }>()
  private defaultTTL: number

  constructor(defaultTTL = 5 * 60 * 1000) { // 5 minutes default
    this.defaultTTL = defaultTTL
  }

  set(key: string, value: T, ttl = this.defaultTTL): void {
    const expires = Date.now() + ttl
    this.cache.set(key, { value, expires })
  }

  get(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []
    this.cache.forEach((item, key) => {
      if (now > item.expires) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach(key => this.cache.delete(key))
  }

  size(): number {
    this.cleanup()
    return this.cache.size
  }
}

// Create singleton cache instances
export const apiCache = new SimpleCache<any>(5 * 60 * 1000) // 5 minutes
export const componentCache = new SimpleCache<React.ComponentType<any>>(10 * 60 * 1000) // 10 minutes

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics = new Map<string, number[]>()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  startTiming(label: string): () => number {
    const start = performance.now()
    return () => {
      const duration = performance.now() - start
      this.recordMetric(label, duration)
      return duration
    }
  }

  recordMetric(label: string, value: number): void {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, [])
    }
    const values = this.metrics.get(label)!
    values.push(value)
    
    // Keep only last 100 measurements to prevent memory leaks
    if (values.length > 100) {
      values.shift()
    }
  }

  getMetrics(label: string): { avg: number; min: number; max: number; count: number } | null {
    const values = this.metrics.get(label)
    if (!values || values.length === 0) return null

    const avg = values.reduce((sum, val) => sum + val, 0) / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)

    return { avg, min, max, count: values.length }
  }

  getAllMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, { avg: number; min: number; max: number; count: number }> = {}
    this.metrics.forEach((_, label) => {
      const metrics = this.getMetrics(label)
      if (metrics) {
        result[label] = metrics
      }
    })
    return result
  }

  clearMetrics(): void {
    this.metrics.clear()
  }
}

// Lazy loading utility with intersection observer
export function createLazyLoader<T>(
  importFn: () => Promise<{ default: T }>,
  fallback?: T
): () => Promise<T> {
  let cached: T | null = null
  let loading: Promise<T> | null = null

  return async (): Promise<T> => {
    if (cached) return cached

    if (!loading) {
      loading = importFn().then(module => {
        cached = module.default
        loading = null
        return cached
      }).catch(error => {
        loading = null
        if (fallback) {
          cached = fallback
          return fallback
        }
        throw error
      })
    }

    return loading
  }
}

// Debounce utility for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }

    const callNow = immediate && !timeout

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)

    if (callNow) func(...args)
  }
}

// Throttle utility
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function executedFunction(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Memory usage monitoring (client-side only)
export function getMemoryUsage(): { used: number; total: number; percentage: number } | null {
  if (typeof window === 'undefined' || !('memory' in performance)) {
    return null
  }

  const memory = (performance as any).memory
  return {
    used: memory.usedJSHeapSize,
    total: memory.totalJSHeapSize,
    percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
  }
}

// Image optimization utility
export function createOptimizedImageUrl(
  src: string,
  width?: number,
  height?: number,
  quality = 75
): string {
  if (!src.startsWith('/') && !src.startsWith('http')) {
    return src // External URLs or data URLs
  }

  const params = new URLSearchParams()
  if (width) params.set('w', width.toString())
  if (height) params.set('h', height.toString())
  params.set('q', quality.toString())

  return `/_next/image?url=${encodeURIComponent(src)}&${params.toString()}`
}

// Bundle size analyzer (development only)
export function analyzeBundleSize(): void {
  if (env.NODE_ENV !== 'development') return

  console.group('📦 Bundle Analysis')
  
  // Analyze chunk sizes
  const scripts = Array.from(document.querySelectorAll('script[src]')) as HTMLScriptElement[]
  const chunks = scripts
    .filter(script => script.src.includes('/_next/static/chunks/'))
    .map(script => ({
      name: script.src.split('/').pop() || 'unknown',
      src: script.src
    }))

  console.table(chunks)
  
  // Memory usage
  const memory = getMemoryUsage()
  if (memory) {
    console.log(`💾 Memory Usage: ${(memory.used / 1024 / 1024).toFixed(2)}MB / ${(memory.total / 1024 / 1024).toFixed(2)}MB (${memory.percentage.toFixed(1)}%)`)
  }

  // Performance metrics
  const monitor = PerformanceMonitor.getInstance()
  const metrics = monitor.getAllMetrics()
  if (Object.keys(metrics).length > 0) {
    console.log('⏱️ Performance Metrics:')
    console.table(metrics)
  }

  console.groupEnd()
}

// Preload critical resources
export function preloadResource(href: string, as: 'script' | 'style' | 'font' | 'image' = 'script'): void {
  if (typeof document === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  link.as = as
  
  if (as === 'font') {
    link.crossOrigin = 'anonymous'
  }

  document.head.appendChild(link)
}

// Critical CSS inlining helper
export function inlineCriticalCSS(css: string): void {
  if (typeof document === 'undefined') return

  const style = document.createElement('style')
  style.textContent = css
  style.setAttribute('data-critical', 'true')
  document.head.appendChild(style)
}

// Service Worker registration helper
export async function registerServiceWorker(swPath = '/sw.js'): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register(swPath)
    console.log('Service Worker registered successfully')
    return registration
  } catch (error) {
    console.warn('Service Worker registration failed:', error)
    return null
  }
}

// Export singleton performance monitor
export const performanceMonitor = PerformanceMonitor.getInstance()