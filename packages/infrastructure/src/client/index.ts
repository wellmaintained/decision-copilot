// Client-side Firebase repository implementations
export * from './firestoreDecisionsRepository';
export * from './firestoreOrganisationsRepository';
export * from './firestoreStakeholdersRepository';
export * from './firestoreStakeholderTeamsRepository';
export * from './firestoreItemsRepository';
export * from './firestoreProjectDecisionsRepository';
export * from './firestoreTeamHierarchyRepository';

// Re-export Firebase config for client usage
export { auth, db, functions } from '../firebase-client';