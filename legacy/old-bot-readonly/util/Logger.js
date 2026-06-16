const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
const DiscordLogger = require( 'winston3-discord') 
const { BOT_NAME, CHANNEL_REPORT, CONSOLE_REPORT, DISCORD_WEBHOOK, LOG_LEVEL } = process.env;

const myFormat = printf(({ level, message, label, timestamp}) => {
	return `${timestamp} [${label}] ${level}: ${message}`;
});

const discordOptions = {
	level: "warn",
	webhooks: DISCORD_WEBHOOK,
	colors: { 'warn': 0xF58A07, 'error': 0xf20707 },
	inline: true
};

const logger = createLogger({
	format: combine(
		label({ label: `${BOT_NAME}` }),
		timestamp(),
		myFormat
	),
	transports: [
		new transports.File( {
			filename: "logs/error.log",
			level: "error",
			handleExceptions: true,
			json: true,
			maxsize: 5242880, // 5MB
			maxFiles: 5,
			colorize: false
		}),
		new transports.File( {
			filename: "logs/combined.log",
			level: "info",
			handleExceptions: true,
			json: true,
			maxsize: 5242880, // 5MB
			maxFiles: 5,
			colorize: false
		}),
		new transports.File( {
			filename: "logs/debug.log",
			level: "debug",
			handleExceptions: true,
			json: true,
			maxsize: 5242880, // 5MB
			maxFiles: 5,
			colorize: false
		})
	],
	exitOnError: false
});

if (CHANNEL_REPORT === 'true') {
	logger.add(new DiscordLogger(discordOptions));
	
}

if (CONSOLE_REPORT === 'true') {
	logger.add(new transports.Console({
		format: myFormat,
		colorize: true
	}));
}

logger.level = LOG_LEVEL;

module.exports = logger;
exports.logger = logger;
