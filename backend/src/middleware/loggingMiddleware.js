const loggingMiddleware = (loggingServiceUrl = 'http://localhost:3000') => {
  return async (req, res, next) => {
    const startTime = Date.now();
    
    req.logger = async (service, level, category, message) => {
      const logData = {
        timestamp: new Date().toISOString(),
        service: service || 'backend',
        level: level || 'info',
        category: category || 'general',
        message,
        requestId: req.headers['x-request-id'] || generateRequestId(),
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress
      };

      try {
        const response = await fetch(`${loggingServiceUrl}/log`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(logData),
        });

        if (!response.ok) {
          console.error(`Logging service error: ${response.status}`);
          console.log(`[FALLBACK] ${logData.timestamp} - ${logData.service.toUpperCase()} - ${logData.level.toUpperCase()} - ${logData.category}: ${logData.message}`);
        }
      } catch (error) {
        console.error('Failed to send log to logging service:', error.message);
        console.log(`[FALLBACK] ${logData.timestamp} - ${logData.service.toUpperCase()} - ${logData.level.toUpperCase()} - ${logData.category}: ${logData.message}`);
      }
    };

    const originalSend = res.send;
    const originalJson = res.json;

    res.send = function(data) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      req.logger('backend', 'info', 'response', `${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
      
      return originalSend.call(this, data);
    };

    res.json = function(data) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      req.logger('backend', 'info', 'response', `${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
      
      return originalJson.call(this, data);
    };

    await req.logger('backend', 'info', 'request', `${req.method} ${req.url} - Started`);
    
    next();
  };
};

const generateRequestId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export default loggingMiddleware;