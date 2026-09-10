import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRoutes } from './routes/auth.routes.js';
import { categoryRoutes } from './routes/category.routes.js';
import { equipmentRoutes } from './routes/equipment.routes.js';
import { requestRoutes } from './routes/request.routes.js';
import path from 'path';
import { dashboardRoutes } from './routes/dashboard.routes.js';
import { historyRoutes } from './routes/history.routes.js';
import { userRoutes } from './routes/user.routes.js';
import { uploadRoutes } from './routes/upload.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  if (req.url.includes('//')) {
    req.url = req.url.replace(/\/{2,}/g, '/');
  }
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms) [Origin: ${req.headers.origin || 'none'}]`);
  });
  next();
});

// Static file serving for uploaded equipment images
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes - support both /api/* and root /* to prevent 404 if /api is omitted in client config
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/categories', '/categories'], categoryRoutes);
app.use(['/api/equipment', '/equipment'], equipmentRoutes);
app.use(['/api/requests', '/requests'], requestRoutes);
app.use(['/api/dashboard', '/dashboard'], dashboardRoutes);
app.use(['/api/history', '/history'], historyRoutes);
app.use(['/api/users', '/users'], userRoutes);
app.use(['/api/upload', '/upload'], uploadRoutes);

// Health check
app.get(['/api/health', '/health'], (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 IT Equipment Backend running on http://localhost:${PORT}`);
});
