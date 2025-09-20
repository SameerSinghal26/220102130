import express from "express";

const logApp = express();
const LOG_PORT = process.env.LOG_PORT || 3000;

logApp.use(express.json());

const logs = [];

logApp.post("/log", (req, res) => {
  const logEntry = {
    id: logs.length + 1,
    receivedAt: new Date().toISOString(),
    ...req.body
  };
  
  logs.push(logEntry);
  
  console.log(`[${logEntry.timestamp}] ${logEntry.service.toUpperCase()} - ${logEntry.level.toUpperCase()} - ${logEntry.category}: ${logEntry.message}`);
  
  res.status(200).json({ status: 'logged', id: logEntry.id });
});

logApp.get("/logs", (req, res) => {
  const { service, level, category, limit = 100 } = req.query;
  
  let filteredLogs = logs;
  
  if (service) {
    filteredLogs = filteredLogs.filter(log => log.service === service);
  }
  
  if (level) {
    filteredLogs = filteredLogs.filter(log => log.level === level);
  }
  
  if (category) {
    filteredLogs = filteredLogs.filter(log => log.category === category);
  }
  
  const limitedLogs = filteredLogs.slice(-parseInt(limit));
  
  res.json({
    total: filteredLogs.length,
    logs: limitedLogs
  });
});

logApp.get("/", (req, res) => {
  res.json({ 
    message: "Logging Service API", 
    status: "running",
    totalLogs: logs.length,
    endpoints: {
      "/log": "POST - Receive log entries",
      "/logs": "GET - Retrieve logs (query: service, level, category, limit)",
      "/logs/clear": "DELETE - Clear all logs"
    }
  });
});

logApp.delete("/logs/clear", (req, res) => {
  const clearedCount = logs.length;
  logs.length = 0;
  res.json({ message: `Cleared ${clearedCount} logs` });
});

logApp.listen(LOG_PORT, () => {
  console.log(`Logging service running on http://localhost:${LOG_PORT}`);
});

export default logApp;