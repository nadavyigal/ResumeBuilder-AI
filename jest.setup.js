import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Polyfill for Next.js API routes
Object.assign(global, { TextDecoder, TextEncoder })

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ''
  },
}))

// Mock PostHog
jest.mock('posthog-js', () => ({
  init: jest.fn(),
  capture: jest.fn(),
  identify: jest.fn(),
}))

// Setup global fetch mock if needed
global.fetch = jest.fn()

// Mock Request and Response for API route testing
if (typeof globalThis.Request === 'undefined') {
  globalThis.Request = class Request {
    constructor(url, options = {}) {
      this.url = url
      this.method = options.method || 'GET'
      this.headers = new Map(Object.entries(options.headers || {}))
      this.body = options.body
    }
    
    async formData() {
      return this.body
    }
    
    async json() {
      return JSON.parse(this.body)
    }
  }
}

if (typeof globalThis.Response === 'undefined') {
  globalThis.Response = class Response {
    constructor(body, options = {}) {
      this.body = body
      this.status = options.status || 200
      this.headers = new Map(Object.entries(options.headers || {}))
    }
    
    async json() {
      return JSON.parse(this.body)
    }
    
    async text() {
      return this.body
    }
  }
} 