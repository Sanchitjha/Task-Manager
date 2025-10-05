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

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/', (_req, res) => {
	res.json({ ok: true, service: 'Manager API' });
});

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/videos', videosRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/settings', settingsRouter);

app.use((err, _req, res, _next) => {
	const status = err.status || 500;
	res.status(status).json({ message: err.message || 'Server error' });
});

const port = process.env.PORT || 5000;
connectMongo()
	.then(() => {
		app.listen(port, () => console.log(`API listening on ${port}`));
	})
	.catch((error) => {
		console.error('Mongo connection failed', error);
		process.exit(1);
	});

module.exports = app;
