#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { Command } from 'commander';
import * as dotenv from 'dotenv';
import { initializeApp, cert, App, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { testStakeholders } from './test-data/stakeholders';

// Load environment variables
dotenv.config();

interface StakeholderOptions {
  environment: string;
  serviceAccountPath?: string;
  emulatorHost?: string;
  emulatorPort?: string;
  verbose: boolean;
}

// Initialize Firebase app based on environment
function initializeFirebase(options: StakeholderOptions): { app: App; db: Firestore } {
  let app: App;
  
  if (options.environment === 'emulator') {
    // Connect to emulator
    process.env.FIRESTORE_EMULATOR_HOST = `${options.emulatorHost || 'localhost'}:${options.emulatorPort || '8080'}`;
    app = initializeApp({ projectId: 'decision-copilot' });
    console.log(chalk.yellow(`Connected to Firestore emulator at ${process.env.FIRESTORE_EMULATOR_HOST}`));
  } else {
    // Connect to production or other environment
    // Make sure we're not using the emulator for production
    delete process.env.FIRESTORE_EMULATOR_HOST;
    
    let serviceAccount: ServiceAccount;
    
    // Check if we have the environment variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON) as ServiceAccount;
        console.log(chalk.green('Using service account from FIREBASE_SERVICE_ACCOUNT_JSON environment variable'));
      } catch (error) {
        console.error(chalk.red('Error parsing FIREBASE_SERVICE_ACCOUNT_JSON environment variable:'), error);
        throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_JSON environment variable');
      }
    } 
    // Fall back to service account file if specified
    else if (options.serviceAccountPath) {
      const serviceAccountPath = path.resolve(process.cwd(), options.serviceAccountPath);
      if (!fs.existsSync(serviceAccountPath)) {
        throw new Error(`Service account file not found at ${serviceAccountPath}`);
      }
      
      serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8')) as ServiceAccount;
      console.log(chalk.green(`Using service account from file: ${serviceAccountPath}`));
    } else {
      throw new Error('No service account provided. Set FIREBASE_SERVICE_ACCOUNT_JSON environment variable or provide --service-account-path');
    }
    
    app = initializeApp({
      credential: cert(serviceAccount),
    });
    console.log(chalk.green(`Connected to Firestore in ${options.environment} environment`));
  }
  
  // Use the named database for production environment
  let db: Firestore;
  if (options.environment === 'production') {
    const databaseId = 'decision-copilot-prod';
    console.log(chalk.blue(`Using database: ${databaseId}`));
    db = getFirestore(app, databaseId);
  } else {
    console.log(chalk.blue(`Using database: (default)`));
    db = getFirestore(app);
  }
  
  return { app, db };
}

// Team structure constants
const ORGANISATION_ID = '9HY1YTkOdqxOTFOMZe8r';
const DEPARTMENT_1_ID = 'department-1';
const TEAM_1_1_ID = 'team-1-1';
const TEAM_1_2_ID = 'team-1-2';
const TEAM_2_ID = 'team-2';

// Create team hierarchy structure
async function createTeamHierarchy(db: Firestore) {
  console.log(chalk.blue('Creating team hierarchy...'));
  
  const hierarchyDoc = {
    rootTeams: {
      [DEPARTMENT_1_ID]: {
        id: DEPARTMENT_1_ID,
        name: "Department 1",
        parentId: null,
        children: {
          [TEAM_1_1_ID]: {
            id: TEAM_1_1_ID,
            name: "Team 1.1",
            parentId: DEPARTMENT_1_ID,
            children: {}
          },
          [TEAM_1_2_ID]: {
            id: TEAM_1_2_ID,
            name: "Team 1.2",
            parentId: DEPARTMENT_1_ID,
            children: {}
          }
        }
      },
      [TEAM_2_ID]: {
        id: TEAM_2_ID,
        name: "Team 2",
        parentId: null,
        children: {}
      }
    }
  };

  await db.doc(`organisations/${ORGANISATION_ID}/teamHierarchies/hierarchy`).set(hierarchyDoc);
  console.log(chalk.green('Team hierarchy created successfully'));
}

async function createTestStakeholders(db: Firestore) {
  try {
    console.log(chalk.blue('Starting creation of test stakeholders...'));
    
    // First create the team hierarchy
    await createTeamHierarchy(db);
    
    // Create stakeholders and assign them to teams
    for (let i = 0; i < testStakeholders.length; i++) {
      const stakeholder = testStakeholders[i];
      if (!stakeholder) continue;
      
      // Create stakeholder as a root collection
      const stakeholderRef = db.collection('stakeholders').doc();
      await stakeholderRef.set({
        ...stakeholder,
        id: stakeholderRef.id,
        organisationId: ORGANISATION_ID
      });
      console.log(chalk.green(`Created stakeholder: ${stakeholder.displayName}`));

      // Create stakeholder team assignment as a root collection
      const stakeholderTeamRef = db.collection('stakeholderTeams').doc();
      const teamAssignment = {
        id: stakeholderTeamRef.id,
        stakeholderId: stakeholderRef.id,
        organisationId: ORGANISATION_ID,
        teamId: ''
      };

      if (i < 4) {
        // First 4 stakeholders go to Department 1
        teamAssignment.teamId = DEPARTMENT_1_ID;
        await stakeholderTeamRef.set(teamAssignment);
        console.log(chalk.green(`Assigned ${stakeholder.displayName} to Department 1`));
      } else if (i < 7) {
        // Next 3 stakeholders go to Team 1.1
        teamAssignment.teamId = TEAM_1_1_ID;
        await stakeholderTeamRef.set(teamAssignment);
        console.log(chalk.green(`Assigned ${stakeholder.displayName} to Team 1.1`));
      } else if (i < 10) {
        // Next 3 stakeholders go to Team 1.2
        teamAssignment.teamId = TEAM_1_2_ID;
        await stakeholderTeamRef.set(teamAssignment);
        console.log(chalk.green(`Assigned ${stakeholder.displayName} to Team 1.2`));
      } else {
        // Remaining stakeholders go to Team 2
        teamAssignment.teamId = TEAM_2_ID;
        await stakeholderTeamRef.set(teamAssignment);
        console.log(chalk.green(`Assigned ${stakeholder.displayName} to Team 2`));
      }
    }

    console.log(chalk.green('Successfully created all test stakeholders and assigned them to teams!'));
  } catch (error) {
    console.error(chalk.red('Error creating test stakeholders:'), error);
    throw error;
  }
}

// Main function
async function main() {
  const program = new Command();
  
  program
    .name('create-test-stakeholders')
    .description('Create test stakeholders and assign them to teams')
    .version('1.0.0')
    .option('-e, --environment <env>', 'Target environment (emulator, production, etc.)', 'emulator')
    .option('-s, --service-account-path <path>', 'Path to service account JSON file (optional if FIREBASE_SERVICE_ACCOUNT_JSON env var is set)')
    .option('--emulator-host <host>', 'Firestore emulator host', 'localhost')
    .option('--emulator-port <port>', 'Firestore emulator port', '8080')
    .option('-v, --verbose', 'Enable verbose logging', false)
    .parse(process.argv);
  
  const options = program.opts() as StakeholderOptions;

  try {
    // Validate options
    if (options.environment !== 'emulator' && !options.serviceAccountPath && !process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      console.error(chalk.red('Error: Service account must be provided either via --service-account-path or FIREBASE_SERVICE_ACCOUNT_JSON environment variable'));
      program.help();
      process.exit(1);
    }
    
    console.log(chalk.blue('Options:'));
    console.log(chalk.blue(`  Environment: ${options.environment}`));
    if (options.environment === 'emulator') {
      console.log(chalk.blue(`  Emulator host: ${options.emulatorHost}`));
      console.log(chalk.blue(`  Emulator port: ${options.emulatorPort}`));
    } else if (options.serviceAccountPath) {
      console.log(chalk.blue(`  Service account: ${options.serviceAccountPath}`));
    } else {
      console.log(chalk.blue('  Service account: Using FIREBASE_SERVICE_ACCOUNT_JSON environment variable'));
    }
    
    // Initialize Firebase
    const { db } = initializeFirebase(options);
    
    // Create test stakeholders
    await createTestStakeholders(db);
    
    console.log(chalk.green('All stakeholders created successfully!'));
    process.exit(0);
  } catch (error) {
    console.error(chalk.red('Failed to create test stakeholders:'), error);
    process.exit(1);
  }
}

// Run the script
main(); 