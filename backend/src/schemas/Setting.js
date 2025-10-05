const { Schema, model } = require('mongoose');

const settingSchema = new Schema(
	{
		key: { type: String, required: true, unique: true },
		value: { type: Schema.Types.Mixed, required: true },
		description: { type: String }
	},
	{ timestamps: true }
);

const Setting = model('Setting', settingSchema);

module.exports = { Setting };
