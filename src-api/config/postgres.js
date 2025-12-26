module.exports = { 
	connectionString: process.env.DATABASE_URL_PLANETSCALE,
	ssl: { rejectUnauthorized: false }
	// ssl: {
	// 	rejectUnauthorized: true,
	// 	ca: fs.readFileSync(
	// 		path.join(__dirname, 'rds-us-east-2-bundle.pem'),
	// 		{
	// 			encoding: 'utf-8'
	// 		}
	// 	)
	// }
	// ssl: process.env.ENV === 'dev' ? false : { rejectUnauthorized: false }
	// connectionString: process.env.DEV_DATABASE_URL
};
