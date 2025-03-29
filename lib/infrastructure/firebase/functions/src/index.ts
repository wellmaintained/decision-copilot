import { HttpsError, beforeUserCreated } from 'firebase-functions/v2/identity';
import { onCall } from 'firebase-functions/v2/https';
import { info } from 'firebase-functions/logger';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp } from 'firebase-admin/app';
import { config } from 'dotenv';

// Load environment variables in development
if (process.env.NODE_ENV == 'development') {
	config({ path: '.env.development' });
}

// Initialize Firebase Admin
initializeApp();

// Read admin emails from environment variable
let ADMIN_EMAILS: string[] = [];
if (process.env.NODE_ENV) {
	if (process.env.ADMIN_EMAILS) {
		ADMIN_EMAILS = process.env.ADMIN_EMAILS.split(',').map(email => email.trim());
	} else {
		info('⚠️ WARNING: ADMIN_EMAILS environment variable is not set', {
			severity: 'WARNING',
			context: 'initialization'
		});
	}

	info('Configured admin emails:', { ADMIN_EMAILS });
}

function isAllowed(email: string | undefined): boolean {
	if (!email) {
		return false;
	}
	const allowedValues = [
		'@mechanical-orchard.com',
		'scottmuc@gmail.com',
		'wendy@castlelaing.com',
		'mrdavidlaing@gmail.com'
	];
	for (const allowed of allowedValues) {
		if (email.includes(allowed)) {
			return true;
		}
	}
	return false;
}

// Function to set admin claim when a user signs in
export const setAdminClaim = onCall({ enforceAppCheck: false }, async (request) => {
	// Ensure user is authenticated
	if (!request.auth) {
		throw new HttpsError('unauthenticated', 'User must be authenticated');
	}

	const user = await getAuth().getUser(request.auth.uid);
	const isAdmin = user.email ? ADMIN_EMAILS.includes(user.email) : false;

	// Set or remove admin claim based on email
	await getAuth().setCustomUserClaims(user.uid, { admin: isAdmin });

	return { success: true, isAdmin };
});

export const beforecreated = beforeUserCreated((event) => {
	const user = event.data;
	if (!isAllowed(user?.email)) {
		info("Blocking registration because email isn't from recognised domain", { user: user });
		throw new HttpsError(
			'invalid-argument',
			"Registration blocked because email isn't from recognised domain"
		);
	}
});
