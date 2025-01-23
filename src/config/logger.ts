import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

// Define log directory
const logDir = 'logs';

// Define colors for different log levels
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(colors);

// Define the custom format for file logging
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  })
);

// Define the custom format for console logging with colors
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] ${level}: ${message}`;
  })
);

// Create a rotating transport for error logs
const errorRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '7d', // Keep logs for 7 days
  level: 'error',
  format: fileFormat,
});

// Create a rotating transport for combined logs
const combinedRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '7d', // Keep logs for 7 days
  format: fileFormat,
});

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: fileFormat,
  transports: [
    // Write all logs error (and below) to error.log
    errorRotateTransport,
    // Write all logs to combined.log
    combinedRotateTransport,
  ],
});

// If we're not in production, log to the console with colors
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
  }));
}

// Export a function to get logger instance
export const getLogger = () => logger;

// Export common logging methods
export const logInfo = (message: string) => logger.info(message);
export const logError = (message: string, error?: Error) => {
  if (error) {
    logger.error(`${message} - ${error.message}\n${error.stack}`);
  } else {
    logger.error(message);
  }
};
export const logWarn = (message: string) => logger.warn(message);
export const logDebug = (message: string) => logger.debug(message);
export const logHttp = (message: string) => logger.http(message);
