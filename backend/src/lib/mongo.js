const mongoose = require('mongoose');

async function connectMongo() {
	const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/manager';
	mongoose.set('strictQuery', true);
	await mongoose.connect(uri, { dbName: process.env.MONGO_DB || undefined });
	console.log('Mongo connected');
}

module.exports = { connectMongo };
