const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
require('dotenv').config();
const { connectMongo } = require('./lib/mongo');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const videosRouter = require('./routes/videos');
const walletRouter = require('./routes/wallet');
const transactionsRouter = require('./routes/transactions');
const settingsRouter = require('./routes/settings');
const adminRouter = require('./routes/admin');
const productsRouter = require('./routes/products');
const partnerRouter = require('./routes/vendor');
const ordersRouter = require('./routes/orders');
const subscriptionsRouter = require('./routes/subscriptions');
const { initSubscriptionCron } = require('./lib/subscriptionCron');

const app = express();

app.use(cors({ 
	origin: [
		'https://task-manager-frontend.vercel.app',
		'https://www.showcaseretail.in', 
		'https://showcaseretail.in',
		'http://localhost:5174',
		'http://localhost:3000'
	], 
	credentials: true 
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

app.get('/', (_req, res) => {
	res.json({ ok: true, service: 'Manager API', timestamp: new Date().toISOString() });
});

// Health check endpoint
app.get('/health', (_req, res) => {
	res.json({ 
		status: 'healthy', 
		timestamp: new Date().toISOString(),
		environment: process.env.NODE_ENV || 'development'
	});
});

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/videos', videosRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/products', productsRouter);
app.use('/api/partner', partnerRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/subscriptions', subscriptionsRouter);

app.use((err, _req, res, _next) => {
	const status = err.status || 500;
	res.status(status).json({ message: err.message || 'Server error' });
});

const port = process.env.PORT || 5000;
connectMongo()
	.then(() => {
		app.listen(port, () => {
			console.log(`API listening on ${port}`);
			// Initialize subscription cron jobs
			initSubscriptionCron();
		});
	})
	.catch((error) => {
		console.error('Mongo connection failed', error);
		process.exit(1);
	});

module.exports = app;
