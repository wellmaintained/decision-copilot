#!/usr/bin/env tsx

import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import chalk from 'chalk';

// Connect to emulator
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
const app = initializeApp({ projectId: 'decision-copilot' });
const auth = getAuth(app);

const TEST_ADMIN_EMAIL = 'mrdavidlaing@gmail.com';
const TEST_ADMIN_PASSWORD = 'password123';

async function main() {
    try {
        // Create test admin user
        const userRecord = await auth.createUser({
            email: TEST_ADMIN_EMAIL,
            password: TEST_ADMIN_PASSWORD,
            emailVerified: true,
        });

        // Set admin claim
        await auth.setCustomUserClaims(userRecord.uid, { admin: true });

        console.log(chalk.green('Test admin user created successfully!'));
        console.log(chalk.blue('Email:', TEST_ADMIN_EMAIL));
        console.log(chalk.blue('Password:', TEST_ADMIN_PASSWORD));
    } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'auth/email-already-exists') {
            console.log(chalk.yellow('Test admin user already exists'));
        } else {
            console.error(chalk.red('Error creating test admin user:'), error);
            process.exit(1);
        }
    }
}

main(); 