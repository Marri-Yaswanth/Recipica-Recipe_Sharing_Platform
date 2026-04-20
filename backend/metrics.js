import client from "prom-client";

// Create a registry
const register = new client.Registry();

// Default Node.js metrics (CPU, memory, event loop, etc.)
client.collectDefaultMetrics({ register });

/**
 * HTTP Request Counter
 */
const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

/**
 * HTTP Error Counter
 */
const httpErrorsTotal = new client.Counter({
  name: "http_errors_total",
  help: "Total number of HTTP error responses",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

/**
 * Request Duration Histogram
 */
const httpRequestDurationSeconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

/**
 * Resolve route safely (important for Express dynamic routes)
 */
function resolveRoute(req) {
  if (req.route?.path) return req.route.path;
  if (req.baseUrl && req.path) return `${req.baseUrl}${req.path}`;
  return req.originalUrl || req.path || "unknown";
}

/**
 * Middleware to collect metrics
 */
export function metricsMiddleware(req, res, next) {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const durationSeconds = Number(process.hrtime.bigint() - start) / 1e9;

    const labels = {
      method: req.method,
      route: resolveRoute(req),
      status_code: String(res.statusCode),
    };

    httpRequestsTotal.inc(labels);
    httpRequestDurationSeconds.observe(labels, durationSeconds);

    if (res.statusCode >= 400) {
      httpErrorsTotal.inc(labels);
    }
  });

  next();
}

/**
 * Metrics endpoint (/metrics)
 */
export function exposeMetricsEndpoint(app, path = "/metrics") {
  app.get(path, async (_req, res) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  });
}

// export registry (optional debugging)
export { register };