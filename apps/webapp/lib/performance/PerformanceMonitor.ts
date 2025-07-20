/**
 * Performance monitoring utilities for tracking app performance
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  labels?: Record<string, string>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();

  constructor() {
    this.setupWebVitalsObserver();
    this.setupNavigationObserver();
    this.setupResourceObserver();
  }

  /**
   * Record a custom performance metric
   */
  recordMetric(name: string, value: number, labels?: Record<string, string>) {
    this.metrics.push({
      name,
      value,
      timestamp: performance.now(),
      labels,
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance metric: ${name} = ${value}ms`, labels);
    }
  }

  /**
   * Measure and record the execution time of a function
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>, labels?: Record<string, string>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.recordMetric(name, duration, labels);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(`${name}_error`, duration, { ...labels, error: 'true' });
      throw error;
    }
  }

  /**
   * Measure and record the execution time of a synchronous function
   */
  measure<T>(name: string, fn: () => T, labels?: Record<string, string>): T {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      this.recordMetric(name, duration, labels);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(`${name}_error`, duration, { ...labels, error: 'true' });
      throw error;
    }
  }

  /**
   * Setup Web Vitals observer for Core Web Vitals
   */
  private setupWebVitalsObserver() {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.recordMetric('lcp', lastEntry.startTime, { type: 'web-vital' });
    });

    try {
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.set('lcp', lcpObserver);
    } catch {
      // LCP not supported
    }

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        this.recordMetric('fid', (entry as any).processingStart - entry.startTime, { type: 'web-vital' });
      });
    });

    try {
      fidObserver.observe({ type: 'first-input', buffered: true });
      this.observers.set('fid', fidObserver);
    } catch {
      // FID not supported
    }

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    let clsEntries: any[] = [];

    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (!(entry as any).hadRecentInput) {
          const firstSessionEntry = clsEntries[0];
          const lastSessionEntry = clsEntries[clsEntries.length - 1];

          if (!lastSessionEntry || 
              entry.startTime - lastSessionEntry.startTime < 1000 ||
              entry.startTime - firstSessionEntry.startTime < 5000) {
            clsEntries.push(entry);
            clsValue += (entry as any).value;
          } else {
            this.recordMetric('cls', clsValue, { type: 'web-vital' });
            clsEntries = [entry];
            clsValue = (entry as any).value;
          }
        }
      });
    });

    try {
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      this.observers.set('cls', clsObserver);
    } catch {
      // CLS not supported
    }
  }

  /**
   * Setup navigation observer for page load metrics
   */
  private setupNavigationObserver() {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const navEntry = entry as any;
        this.recordMetric('ttfb', navEntry.responseStart - navEntry.fetchStart, { type: 'navigation' });
        this.recordMetric('dom_content_loaded', navEntry.domContentLoadedEventEnd - navEntry.fetchStart, { type: 'navigation' });
        this.recordMetric('page_load', navEntry.loadEventEnd - navEntry.fetchStart, { type: 'navigation' });
      });
    });

    try {
      observer.observe({ type: 'navigation', buffered: true });
      this.observers.set('navigation', observer);
    } catch {
      // Navigation timing not supported
    }
  }

  /**
   * Setup resource observer for resource loading metrics
   */
  private setupResourceObserver() {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const resourceEntry = entry as any;
        const resourceType = resourceEntry.initiatorType || 'unknown';
        const resourceName = resourceEntry.name.split('/').pop() || 'unknown';
        
        this.recordMetric('resource_load', resourceEntry.responseEnd - resourceEntry.fetchStart, {
          type: 'resource',
          resource_type: resourceType,
          resource_name: resourceName,
        });
      });
    });

    try {
      observer.observe({ type: 'resource', buffered: true });
      this.observers.set('resource', observer);
    } catch {
      // Resource timing not supported
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics by name
   */
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.name === name);
  }

  /**
   * Get performance summary
   */
  getSummary() {
    const summary: Record<string, { count: number; average: number; min: number; max: number }> = {};

    this.metrics.forEach(metric => {
      if (!summary[metric.name]) {
        summary[metric.name] = { count: 0, average: 0, min: Infinity, max: -Infinity };
      }

      const stat = summary[metric.name];
      stat.count++;
      stat.min = Math.min(stat.min, metric.value);
      stat.max = Math.max(stat.max, metric.value);
      stat.average = (stat.average * (stat.count - 1) + metric.value) / stat.count;
    });

    return summary;
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics = [];
  }

  /**
   * Disconnect all observers
   */
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Convenience hook for React components
export function usePerformanceMonitor() {
  return {
    recordMetric: performanceMonitor.recordMetric.bind(performanceMonitor),
    measureAsync: performanceMonitor.measureAsync.bind(performanceMonitor),
    measure: performanceMonitor.measure.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    getSummary: performanceMonitor.getSummary.bind(performanceMonitor),
  };
}