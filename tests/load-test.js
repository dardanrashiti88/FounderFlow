import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('error_rate');
const responseTime = new Trend('response_time', true);
const requestsPerSecond = new Counter('requests_per_second');

// Test configuration
export let options = {
  stages: [
    { duration: '2m', target: 10 },   // Ramp up
    { duration: '5m', target: 10 },   // Stay at 10 users
    { duration: '2m', target: 20 },   // Ramp up
    { duration: '5m', target: 20 },   // Stay at 20 users
    { duration: '2m', target: 50 },   // Ramp up
    { duration: '10m', target: 50 },  // Stay at 50 users
    { duration: '3m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must be below 500ms
    http_req_failed: ['rate<0.02'],   // Error rate must be below 2%
    error_rate: ['rate<0.02'],
  },
};

// Base URL - should be set via environment variable
const BASE_URL = __ENV.BASE_URL || 'https://crm-staging.yourdomain.com';

// Test data
const testCompany = {
  name: 'Load Test Company',
  website: 'https://example.com',
  industry: 'Technology',
  size: '11-50'
};

const testContact = {
  firstName: 'Load',
  lastName: 'Test',
  email: `loadtest${Math.random()}@example.com`,
  title: 'Test Manager'
};

export default function() {
  let response;
  
  // Test 1: Health check
  response = http.get(`${BASE_URL}/health`);
  check(response, {
    'Health check status is 200': (r) => r.status === 200,
    'Health check has status healthy': (r) => JSON.parse(r.body).status === 'healthy',
  });
  
  errorRate.add(response.status !== 200);
  responseTime.add(response.timings.duration);
  requestsPerSecond.add(1);
  
  sleep(1);
  
  // Test 2: Get companies list
  response = http.get(`${BASE_URL}/api/companies`);
  check(response, {
    'Companies list status is 200': (r) => r.status === 200,
    'Companies list returns array': (r) => Array.isArray(JSON.parse(r.body)),
  });
  
  errorRate.add(response.status !== 200);
  responseTime.add(response.timings.duration);
  requestsPerSecond.add(1);
  
  sleep(1);
  
  // Test 3: Get contacts list
  response = http.get(`${BASE_URL}/api/contacts`);
  check(response, {
    'Contacts list status is 200': (r) => r.status === 200,
    'Contacts list returns array': (r) => Array.isArray(JSON.parse(r.body)),
  });
  
  errorRate.add(response.status !== 200);
  responseTime.add(response.timings.duration);
  requestsPerSecond.add(1);
  
  sleep(1);
  
  // Test 4: Get deals list
  response = http.get(`${BASE_URL}/api/deals`);
  check(response, {
    'Deals list status is 200': (r) => r.status === 200,
    'Deals list returns array': (r) => Array.isArray(JSON.parse(r.body)),
  });
  
  errorRate.add(response.status !== 200);
  responseTime.add(response.timings.duration);
  requestsPerSecond.add(1);
  
  sleep(1);
  
  // Test 5: Get metrics
  response = http.get(`${BASE_URL}/api/metrics`);
  check(response, {
    'Metrics status is 200': (r) => r.status === 200,
    'Metrics has pipelineValue': (r) => JSON.parse(r.body).hasOwnProperty('pipelineValue'),
  });
  
  errorRate.add(response.status !== 200);
  responseTime.add(response.timings.duration);
  requestsPerSecond.add(1);
  
  sleep(1);
  
  // Test 6: Create company (10% of users)
  if (Math.random() < 0.1) {
    response = http.post(`${BASE_URL}/api/companies`, JSON.stringify(testCompany), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    check(response, {
      'Company creation status is 201': (r) => r.status === 201,
      'Created company has id': (r) => JSON.parse(r.body).hasOwnProperty('id'),
    });
    
    errorRate.add(response.status !== 201);
    responseTime.add(response.timings.duration);
    requestsPerSecond.add(1);
  }
  
  sleep(2);
  
  // Test 7: Prometheus metrics endpoint
  response = http.get(`${BASE_URL}/metrics`);
  check(response, {
    'Prometheus metrics status is 200': (r) => r.status === 200,
    'Prometheus metrics content type': (r) => r.headers['Content-Type'].includes('text/plain'),
  });
  
  errorRate.add(response.status !== 200);
  responseTime.add(response.timings.duration);
  requestsPerSecond.add(1);
  
  sleep(3);
}

export function handleSummary(data) {
  return {
    'load-test-results.json': JSON.stringify(data),
    'load-test-summary.txt': textSummary(data, { indent: ' ', enableColors: true }),
  };
}