import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { routes } from './routes';
import { getLogger, logError, logInfo, logHttp } from './config/logger';

const app = express();
const logger = getLogger();

// Connect to MongoDB
mongoose
  .connect(config.mongodb.uri)
  .then(() => {
    logInfo('Connected to MongoDB');
  })
  .catch((error) => {
    logError('MongoDB connection error:', error);
    process.exit(1);
  });

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined', {
  stream: {
    write: (message: string) => {
      logHttp(message.trim());
    },
  },
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  logInfo(`Server running on port ${config.port}`);
});