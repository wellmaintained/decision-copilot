#!/usr/bin/env ts-node

import { initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore, FieldValue, DocumentData } from 'firebase-admin/firestore';
import { Command } from 'commander';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import chalk from 'chalk';

// Load environment variables
dotenv.config();

interface MigrationOptions {
  environment: string;
  dryRun: boolean;
  serviceAccountPath?: string;
  emulatorHost?: string;
  emulatorPort?: string;
  verbose: boolean;
}

// Initialize Firebase app based on environment
function initializeFirebase(options: MigrationOptions): { app: App; db: Firestore } {
  let app: App;
  
  if (options.environment === 'emulator') {
    // Connect to emulator
    process.env.FIRESTORE_EMULATOR_HOST = `${options.emulatorHost || 'localhost'}:${options.emulatorPort || '8080'}`;
    app = initializeApp({ projectId: 'decision-copilot' });
    console.log(chalk.yellow(`Connected to Firestore emulator at ${process.env.FIRESTORE_EMULATOR_HOST}`));
  } else {
    // Connect to production or other environment
    if (!options.serviceAccountPath) {
      throw new Error('Service account path is required for non-emulator environments');
    }
    
    const serviceAccountPath = path.resolve(process.cwd(), options.serviceAccountPath);
    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error(`Service account file not found at ${serviceAccountPath}`);
    }
    
    // Use dynamic import instead of require
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    app = initializeApp({
      credential: cert(serviceAccount),
    });
    console.log(chalk.green(`Connected to Firestore in ${options.environment} environment`));
  }
  
  const db = getFirestore(app);
  return { app, db };
}

// Migrate projects from old hierarchical structure to new flat structure
async function extractProjects(db: Firestore, options: MigrationOptions): Promise<void> {
  console.log(chalk.blue('Starting extraction of projects from hierarchical structure...'));
  
  try {
    // Get all organisations
    const orgsSnapshot = await db.collection('organisations').get();
    console.log(chalk.blue(`Found ${orgsSnapshot.docs.length} organisations`));
    
    for (const orgDoc of orgsSnapshot.docs) {
      const orgId = orgDoc.id;
      console.log(chalk.blue(`Processing organisation: ${orgId}`));
      
      // Get all teams for this organisation
      const teamsSnapshot = await db.collection(`organisations/${orgId}/teams`).get();
      console.log(chalk.blue(`Found ${teamsSnapshot.docs.length} teams in organisation ${orgId}`));
      
      for (const teamDoc of teamsSnapshot.docs) {
        const teamId = teamDoc.id;
        const teamName = teamDoc.data().name || 'Unknown Team';
        console.log(chalk.blue(`Processing team: ${teamName} (${teamId})`));
        
        // Get all projects for this team
        const projectsSnapshot = await db.collection(`organisations/${orgId}/teams/${teamId}/projects`).get();
        console.log(chalk.blue(`Found ${projectsSnapshot.docs.length} projects in team ${teamId}`));
        
        for (const projectDoc of projectsSnapshot.docs) {
          const projectData = projectDoc.data();
          const projectId = projectDoc.id;
          const projectName = projectData.name || 'Unknown Project';
          
          // Check if this project already exists in the new location
          const existingProjectDoc = await db.doc(`organisations/${orgId}/projects/${projectId}`).get();
          
          if (existingProjectDoc.exists) {
            console.log(chalk.yellow(`Project ${projectId} (${projectName}) already exists in the new location, skipping`));
            continue;
          }
          
          // Prepare the project data for the new location
          const newProjectData: DocumentData = {
            ...projectData,
            organisationId: orgId,
          };
          
          // Remove teamId if it exists
          if (newProjectData.teamId !== undefined) {
            delete newProjectData.teamId;
          }
          
          // Log the migration
          console.log(chalk.cyan(`Extracting project ${projectId} (${projectName}) from hierarchical structure:`));
          console.log(chalk.cyan(`  - Old path: organisations/${orgId}/teams/${teamId}/projects/${projectId}`));
          console.log(chalk.cyan(`  - New path: organisations/${orgId}/projects/${projectId}`));
          
          // Create the document in the new location if not in dry run mode
          if (!options.dryRun) {
            await db.doc(`organisations/${orgId}/projects/${projectId}`).set(newProjectData);
            console.log(chalk.green(`  ✓ Created project ${projectId} (${projectName}) in new location`));
          } else {
            console.log(chalk.yellow(`  ⚠ Dry run - no changes made to project ${projectId} (${projectName})`));
          }
        }
      }
    }
    
    console.log(chalk.green('Project migration completed successfully!'));
    if (options.dryRun) {
      console.log(chalk.yellow('This was a dry run. No actual changes were made to the database.'));
      console.log(chalk.yellow('Run without --dry-run to apply the changes.'));
    }
  } catch (error) {
    console.error(chalk.red('Error during project migration:'), error);
    throw error;
  }
}
// Migrate teams from old hierarchical structure to new flat structure
async function extractTeams(db: Firestore, options: MigrationOptions): Promise<void> {
  console.log(chalk.blue('Starting extraction of teams from hierarchical structure...'));
  
  try {
    // Get all organisations
    const orgsSnapshot = await db.collection('organisations').get();
    console.log(chalk.blue(`Found ${orgsSnapshot.docs.length} organisations`));
    
    for (const orgDoc of orgsSnapshot.docs) {
      const orgId = orgDoc.id;
      console.log(chalk.blue(`Processing organisation: ${orgId}`));
      
      // Get all teams for this organisation
      const teamsSnapshot = await db.collection(`organisations/${orgId}/teams`).get();
      console.log(chalk.blue(`Found ${teamsSnapshot.docs.length} teams in organisation ${orgId}`));
      
      for (const teamDoc of teamsSnapshot.docs) {
        const teamId = teamDoc.id;
        const teamName = teamDoc.data().name || 'Unknown Team';
        console.log(chalk.blue(`Processing team: ${teamName} (${teamId})`));

        // Check if this team already exists in the new location
        const existingTeamDoc = await db.doc(`organisations/${orgId}/teams/${teamId}`).get();
        
        if (existingTeamDoc.exists) {
          console.log(chalk.yellow(`Team ${teamId} (${teamName}) already exists in the new location, skipping`));
          continue;
        }
          
        // Prepare the project data for the new location
        const newTeamData: DocumentData = {
        ...existingTeamDoc.data(),
        organisationId: orgId,
        };
          
        // Remove projectId if it exists
        if (newTeamData.projectId !== undefined) {
        delete newTeamData.projectId;
        }
        
        // Log the migration
        console.log(chalk.cyan(`Extracting team ${teamId} (${teamName}) from hierarchical structure:`));
        console.log(chalk.cyan(`  - Old path: organisations/${orgId}/teams/${teamId}`));
        console.log(chalk.cyan(`  - New path: organisations/${orgId}/teams/${teamId}`));
        
        // Create the document in the new location if not in dry run mode
        if (!options.dryRun) {
            await db.doc(`organisations/${orgId}/teams/${teamId}`).set(newTeamData);
            console.log(chalk.green(`  ✓ created team ${teamId} (${teamName}) in new location`));
        } else {
            console.log(chalk.yellow(`  ⚠ Dry run - no changes made to team ${teamId} (${teamName})`));
        }
      }
    }
    
    console.log(chalk.green('Team migration completed successfully!'));
    if (options.dryRun) {
      console.log(chalk.yellow('This was a dry run. No actual changes were made to the database.'));
      console.log(chalk.yellow('Run without --dry-run to apply the changes.'));
    }
  } catch (error) {
    console.error(chalk.red('Error during team migration:'), error);
    throw error;
  }
}

// Migrate decisions from old hierarchical structure to new flat structure
async function extractDecisions(db: Firestore, options: MigrationOptions): Promise<void> {
  console.log(chalk.blue('Starting extraction of decisions from hierarchical structure...'));
  
  try {
    // Get all organisations
    const orgsSnapshot = await db.collection('organisations').get();
    console.log(chalk.blue(`Found ${orgsSnapshot.docs.length} organisations`));
    
    for (const orgDoc of orgsSnapshot.docs) {
      const orgId = orgDoc.id;
      console.log(chalk.blue(`Processing organisation: ${orgId}`));
      
      // Get all teams for this organisation
      const teamsSnapshot = await db.collection(`organisations/${orgId}/teams`).get();
      console.log(chalk.blue(`Found ${teamsSnapshot.docs.length} teams in organisation ${orgId}`));
      
      for (const teamDoc of teamsSnapshot.docs) {
        const teamId = teamDoc.id;
        const teamName = teamDoc.data().name || 'Unknown Team';
        console.log(chalk.blue(`Processing team: ${teamName} (${teamId})`));
        
        // Get all projects for this team
        const projectsSnapshot = await db.collection(`organisations/${orgId}/teams/${teamId}/projects`).get();
        console.log(chalk.blue(`Found ${projectsSnapshot.docs.length} projects in team ${teamId}`));
        
        for (const projectDoc of projectsSnapshot.docs) {
          const projectId = projectDoc.id;
          const projectName = projectDoc.data().name || 'Unknown Project';
          console.log(chalk.blue(`Processing project: ${projectName} (${projectId})`));
          
          // Get all decisions for this project
          const decisionsSnapshot = await db
            .collection(`organisations/${orgId}/teams/${teamId}/projects/${projectId}/decisions`)
            .get();
          
          console.log(chalk.blue(`Found ${decisionsSnapshot.docs.length} decisions in project ${projectId} (${projectName})`));
          
          // Process each decision
          for (const decisionDoc of decisionsSnapshot.docs) {
            const decisionData = decisionDoc.data();
            const decisionId = decisionDoc.id;
            const decisionTitle = decisionData.title || 'Unknown Decision';

            // Check if this decision already exists in the new location
            const existingDecisionDoc = await db.doc(`organisations/${orgId}/decisions/${decisionId}`).get();
            
            if (existingDecisionDoc.exists) {
              console.log(chalk.yellow(`Decision ${decisionId} (${decisionTitle}) already exists in the new location, skipping`));
              continue;
            }
            
            // Prepare the decision data for the new location
            const newDecisionData: DocumentData = {
              ...decisionData,
              teamIds: [teamId],
              projectIds: [projectId],
              organisationId: orgId,
            };
            
            // Remove old fields if they exist
            if (newDecisionData.teamId !== undefined) {
              delete newDecisionData.teamId;
            }
            
            if (newDecisionData.projectId !== undefined) {
              delete newDecisionData.projectId;
            }
            
            // Log the migration
            console.log(chalk.cyan(`Migrating decision ${decisionId} (${decisionTitle}) from hierarchical structure:`));
            console.log(chalk.cyan(`  - Old path: organisations/${orgId}/teams/${teamId}/projects/${projectId}/decisions/${decisionId}`));
            console.log(chalk.cyan(`  - New path: organisations/${orgId}/decisions/${decisionId}`));
            
            // Create the document in the new location if not in dry run mode
            if (!options.dryRun) {
              await db.doc(`organisations/${orgId}/decisions/${decisionId}`).set(newDecisionData);
              console.log(chalk.green(`  ✓ created decision ${decisionId} (${decisionTitle}) in new location`));
            } else {
              console.log(chalk.yellow(`  ⚠ Dry run - no changes made to decision ${decisionId} (${decisionTitle})`));
            }
          }
        }
      }
    }
  } catch (error) {
    console.error(chalk.red('Error during hierarchical migration:'), error);
    throw error;
  }
}

// Migrate decisions to new structure (for decisions already in the flat structure)
async function migrateDecisionFields(db: Firestore, options: MigrationOptions): Promise<void> {
  console.log(chalk.blue('Starting migration of decision fields in flat structure...'));
  
  try {
    // Get all organisations
    const orgsSnapshot = await db.collection('organisations').get();
    
    for (const orgDoc of orgsSnapshot.docs) {
      const orgId = orgDoc.id;
      console.log(chalk.blue(`Processing organisation: ${orgId}`));
      
      // Get all decisions for this organisation
      const decisionsSnapshot = await db
        .collection(`organisations/${orgId}/decisions`)
        .get();
      
      console.log(chalk.blue(`Found ${decisionsSnapshot.docs.length} decisions in organisation ${orgId}`));
      
      // Process each decision
      for (const decisionDoc of decisionsSnapshot.docs) {
        const decisionData = decisionDoc.data();
        const decisionId = decisionDoc.id;
        const decisionTitle = decisionData.title || 'Unknown Decision';
        
        // Check if decision already has teamIds and projectIds
        if (decisionData.teamIds && decisionData.projectIds) {
          if (options.verbose) {
            console.log(chalk.gray(`Decision ${decisionId} already has teamIds and projectIds, skipping`));
          }
          continue;
        }
        
        // Extract current team and project if they exist
        const teamId = decisionData.teamId || null;
        const projectId = decisionData.projectId || null;
        
        // Create new arrays for teamIds and projectIds
        const teamIds = teamId ? [teamId] : [];
        const projectIds = projectId ? [projectId] : [];
        
        // Log the changes
        console.log(chalk.cyan(`Migrating decision ${decisionId}/${decisionTitle} fields:`));
        console.log(chalk.cyan(`  - Old: teamId=${teamId || 'null'}, projectId=${projectId || 'null'}`));
        console.log(chalk.cyan(`  - New: teamIds=[${teamIds.join(', ')}], projectIds=[${projectIds.join(', ')}]`));
        
        // Update the document if not in dry run mode
        if (!options.dryRun) {
          const updateData: Record<string, unknown> = {
            teamIds,
            projectIds,
          };
          
          // Remove old fields if they exist
          if (decisionData.teamId !== undefined) {
            updateData.teamId = FieldValue.delete();
          }
          
          if (decisionData.projectId !== undefined) {
            updateData.projectId = FieldValue.delete();
          }
          
          await db.doc(`organisations/${orgId}/decisions/${decisionId}`).update(updateData);
          console.log(chalk.green(`  ✓ Updated decision ${decisionId}`));
        } else {
          console.log(chalk.yellow(`  ⚠ Dry run - no changes made to decision ${decisionId}`));
        }
      }
    }
  } catch (error) {
    console.error(chalk.red('Error during field migration:'), error);
    throw error;
  }
}

// Remove old data
async function removeOldHierarchicalData(db: Firestore, options: MigrationOptions): Promise<void> {
  console.log(chalk.blue('Starting removal of old hierarchical data...'));
  
  try {
    // Get all organisations
    const orgsSnapshot = await db.collection('organisations').get();
    
    for (const orgDoc of orgsSnapshot.docs) {
      const orgId = orgDoc.id;
      console.log(chalk.blue(`Processing organisation: ${orgId}`));

      // Get all teams for this organisation
      const teamsSnapshot = await db.collection(`organisations/${orgId}/teams`).get();
      console.log(chalk.blue(`Found ${teamsSnapshot.docs.length} teams in organisation ${orgId}`));
      
      for (const teamDoc of teamsSnapshot.docs) {
        const teamId = teamDoc.id;
        console.log(chalk.blue(`Processing team: ${teamId}`));

        // Get all projects for this team
        const projectsSnapshot = await db.collection(`organisations/${orgId}/teams/${teamId}/projects`).get();
        console.log(chalk.blue(`Found ${projectsSnapshot.docs.length} projects in team ${teamId}`));
        
        for (const projectDoc of projectsSnapshot.docs) {
          const projectId = projectDoc.id;
          console.log(chalk.blue(`Processing project: ${projectId}`));

          // Get all decisions for this project
          const decisionsSnapshot = await db
            .collection(`organisations/${orgId}/teams/${teamId}/projects/${projectId}/decisions`)
            .get();
          
          console.log(chalk.blue(`Found ${decisionsSnapshot.docs.length} decisions in project ${projectId}`));
          
          // Delete each decision
          for (const decisionDoc of decisionsSnapshot.docs) {
            const decisionId = decisionDoc.id;
            console.log(chalk.blue(`Deleting decision: ${decisionId}`));

            // Delete the decision document if not in dry run mode
            if (!options.dryRun) {
              await db.doc(`organisations/${orgId}/teams/${teamId}/projects/${projectId}/decisions/${decisionId}`).delete();
              console.log(chalk.green(`  ✓ Deleted decision ${decisionId}`));
            } 
          }

          // Delete the project document if not in dry run mode
          if (!options.dryRun) {
            await db.doc(`organisations/${orgId}/teams/${teamId}/projects/${projectId}`).delete();
            console.log(chalk.green(`  ✓ Deleted project ${projectId}`));
          }
        }
      }
    }
  } catch (error) {
    console.error(chalk.red('Error during removal of old hierarchical data:'), error);
    throw error;
  }
}

// Main function
async function main() {
  const program = new Command();
  
  program
    .name('migrate')
    .description('Migrate projects and decisions to the new flat structure')
    .version('1.0.0')
    .option('-e, --environment <env>', 'Target environment (emulator, production, etc.)', 'emulator')
    .option('-d, --dry-run', 'Run without making actual changes', false)
    .option('-s, --service-account <path>', 'Path to service account JSON file (required for non-emulator environments)')
    .option('--emulator-host <host>', 'Firestore emulator host', 'localhost')
    .option('--emulator-port <port>', 'Firestore emulator port', '8080')
    .option('-v, --verbose', 'Enable verbose logging', false)
    .parse(process.argv);
  
  const options = program.opts() as MigrationOptions;
  
  try {
    // Validate options
    if (options.environment !== 'emulator' && !options.serviceAccountPath) {
      console.error(chalk.red('Error: Service account path is required for non-emulator environments'));
      program.help();
      process.exit(1);
    }
    
    console.log(chalk.blue('Migration options:'));
    console.log(chalk.blue(`  Environment: ${options.environment}`));
    console.log(chalk.blue(`  Dry run: ${options.dryRun}`));
    if (options.environment === 'emulator') {
      console.log(chalk.blue(`  Emulator host: ${options.emulatorHost}`));
      console.log(chalk.blue(`  Emulator port: ${options.emulatorPort}`));
    } else {
      console.log(chalk.blue(`  Service account: ${options.serviceAccountPath}`));
    }
    
    // Initialize Firebase
    const { db } = initializeFirebase(options);
    
    // Step 1: Extract data from old hierarchical structure
    await extractProjects(db, options);
    await extractDecisions(db, options);

    // Step 2: Migrate decision fields in the flat structure
    await migrateDecisionFields(db, options);

    // Step 3: Remove old data
    await removeOldHierarchicalData(db, options);
    
    console.log(chalk.green('All migrations completed successfully!'));
    process.exit(0);
  } catch (error) {
    console.error(chalk.red('Migration failed:'), error);
    process.exit(1);
  }
}

// Run the script
main(); 