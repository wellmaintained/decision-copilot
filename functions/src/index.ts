import { HttpsError, beforeUserCreated } from 'firebase-functions/v2/identity';
import * as logger from 'firebase-functions/logger';

export const beforecreated = beforeUserCreated((event) => {
	const user = event.data;
	if (!user?.email?.includes('@mechanical-orchard.com')) {
		logger.info("Blocking registration because email isn't from recognised domain", { user: user });
		throw new HttpsError('invalid-argument', 'Unauthorized email');
	}
});
