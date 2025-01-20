import { HttpsError, beforeUserCreated } from 'firebase-functions/v2/identity';
import * as logger from 'firebase-functions/logger';

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

export const beforecreated = beforeUserCreated((event) => {
	const user = event.data;
	if (!isAllowed(user?.email)) {
		logger.info("Blocking registration because email isn't from recognised domain", { user: user });
		throw new HttpsError(
			'invalid-argument',
			"Registration blocked because email isn't from recognised domain"
		);
	}
});
