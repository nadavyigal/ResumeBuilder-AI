'use client';

import { useEffect, useState } from 'react';
import { performanceMonitor, getMemoryUsage, analyzeBundleSize } from '@/lib/performance';

interface PerformanceMetrics {
  memory?: {
    used: number;
    total: number;
    percentage: number;
  };
  timing: Record<string, {
    avg: number;
    min: number;
    max: number;
    count: number;
  }>;
}

interface PerformanceMonitorProps {
  showInProduction?: boolean;
  refreshInterval?: number;
}

export default function PerformanceMonitor({ 
  showInProduction = false, 
  refreshInterval = 5000 
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({ timing: {} });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development unless explicitly enabled for production
    if (process.env.NODE_ENV === 'production' && !showInProduction) {
      return;
    }

    const updateMetrics = () => {
      const memory = getMemoryUsage();
      const timing = performanceMonitor.getAllMetrics();
      
      setMetrics({
        memory: memory || undefined,
        timing
      });
    };

    // Initial update
    updateMetrics();

    // Set up interval for updates
    const interval = setInterval(updateMetrics, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, showInProduction]);

  // Don't render in production unless explicitly enabled
  if (process.env.NODE_ENV === 'production' && !showInProduction) {
    return null;
  }

  const handleAnalyzeBundle = () => {
    analyzeBundleSize();
  };

  const handleClearMetrics = () => {
    performanceMonitor.clearMetrics();
    setMetrics({ timing: {} });
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-md text-sm shadow-lg hover:bg-blue-700 z-50"
        title="Show Performance Monitor"
      >
        📊
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-xl p-4 max-w-md w-full z-50 max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-900">Performance Monitor</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
          title="Hide Performance Monitor"
        >
          ✕
        </button>
      </div>

      {/* Memory Usage */}
      {metrics.memory && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Memory Usage</h4>
          <div className="bg-gray-100 rounded p-2">
            <div className="text-xs text-gray-600">
              {(metrics.memory.used / 1024 / 1024).toFixed(2)}MB / {(metrics.memory.total / 1024 / 1024).toFixed(2)}MB
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className={`h-2 rounded-full ${
                  metrics.memory.percentage > 80 ? 'bg-red-500' :
                  metrics.memory.percentage > 60 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${metrics.memory.percentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {metrics.memory.percentage.toFixed(1)}% used
            </div>
          </div>
        </div>
      )}

      {/* Timing Metrics */}
      {Object.keys(metrics.timing).length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Performance Metrics</h4>
          <div className="space-y-2">
            {Object.entries(metrics.timing).map(([label, data]) => (
              <div key={label} className="bg-gray-50 rounded p-2">
                <div className="text-xs font-medium text-gray-700">{label}</div>
                <div className="text-xs text-gray-600 grid grid-cols-2 gap-1 mt-1">
                  <span>Avg: {data.avg.toFixed(1)}ms</span>
                  <span>Count: {data.count}</span>
                  <span>Min: {data.min.toFixed(1)}ms</span>
                  <span>Max: {data.max.toFixed(1)}ms</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleAnalyzeBundle}
          className="flex-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200"
        >
          Analyze Bundle
        </button>
        <button
          onClick={handleClearMetrics}
          className="flex-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-200"
        >
          Clear Metrics
        </button>
      </div>

      {/* Environment indicator */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        {process.env.NODE_ENV} mode
      </div>
    </div>
  );
}