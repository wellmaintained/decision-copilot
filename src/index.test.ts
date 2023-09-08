import { describe, it, expect } from 'vitest';

describe('sum test', () => {
	it('adds 1 + 2 to equal 3', () => {
		expect(1 + 2).toBe(3);
	});

	it('finds allowed email in email whitelist', () => {
		expect(isAllowed('foo@bar.com')).toBeTruthy();
		expect(isAllowed('jack@example.com')).toBeTruthy();
		expect(isAllowed('jill@example.com')).toBeFalsy();
	});
});

function isAllowed(email: string | undefined): boolean {
	if (!email) {
		return false;
	}
	const allowedValues = ['jack@example.com', '@bar.com'];
	for (const allowed of allowedValues) {
		if (email.includes(allowed)) {
			return true;
		}
	}
	return false;
}
