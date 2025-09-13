import { collectDefaultMetrics, register, Counter, Histogram, Gauge } from 'prom-client';

// Collect default Node.js metrics
collectDefaultMetrics();

// Custom application metrics
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

export const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
});

export const databaseConnections = new Gauge({
  name: 'database_connections_active',
  help: 'Number of active database connections',
});

// Business metrics
export const totalDeals = new Gauge({
  name: 'crm_deals_total',
  help: 'Total number of deals in the system',
  labelNames: ['stage'],
});

export const pipelineValue = new Gauge({
  name: 'crm_pipeline_value_dollars',
  help: 'Total value of deals in pipeline',
});

export const conversionRate = new Gauge({
  name: 'crm_conversion_rate_percent',
  help: 'Lead to customer conversion rate',
});

// Export the register for scraping
export { register };