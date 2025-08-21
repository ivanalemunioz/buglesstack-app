/* eslint-disable no-unreachable */
// Initialize dotenv
require('dotenv').config({ path: require('path').join(__dirname, '/../../.env') });

process.env.ENV = 'production';

// Require the models module to initialize them
require('../models/index');

const axios = require('axios');
const { sendEmail } = require('../libraries/AmazonSES/index');
const { createFields } = require('../libraries/ModelCore/utils');

const Postgres = require('../libraries/Postgres/index');

const userModel = require('../models/user/index');

(async () => {
	console.log('> Send welcome email to users');
    
	const options = { select: createFields(['id', 'email', 'subscription_status']) };

	// Yesterday
	const dateSince = new Date(Date.now() - 86400000);

	// Now
	const dateUntil = new Date();

	// Get users
	const users = await userModel.getByCreatedAt(dateSince, dateUntil, 1000, undefined, options);
    
	console.log(` > Users: ${users.length}`);

	for (let i = 0; i < users.length; i++) {
		console.log(`  > User #${i}`);
		console.log(`   > Email: ${users[i].email}`);
		console.log(`   > Subscription status: ${users[i].subscription_status}`);

		// continue;
        
		await sendEmail({
			Source: 'Ivan from Buglesstack <ivan@buglesstack.com>',
			Destination: { ToAddresses: [users[i].email] },
			Message: {
				Subject: {
					Charset: 'UTF-8',
					Data: 'Buglesstack Contact'
				},
				Body: {
					Html: {
						Charset: 'UTF-8',
						Data: `
							Hello, I'm the creator of Buglesstack.<br/>  
							<br/>  
							I'm reaching out to share my contact information. This platform is still in development, and I’d appreciate any suggestions you may have for improvement.<br/>  
							<br/>
							Do you mind if I ask what encouraged you to register? What browser automation platform are you using, if any?<br/>
							<br/>
							If there’s anything I can assist you with, please don’t hesitate to let me know.<br/>
							<br/>
							Have a great day,<br/>  
							Ivan
						`
					}
				}
			}
		});

		console.log('   > Welcome email sent');

		// break;
	}

	console.log('> Successfully sent all welcome emails');

	// End postgress connection
	Postgres.pool.end();
	
	// Send heartbeat
	await axios.get(process.env.WELCOME_EMAIL_HEARTBEAT);
})();
