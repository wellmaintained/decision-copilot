// STUB: Admin repositories temporarily disabled for build bypass
// These will be re-enabled after Firebase SDK conflicts are resolved

// export * from './firestoreDecisionsRepository';
// export * from './firestoreOrganisationsRepository';
// export * from './firestoreStakeholdersRepository';
// export * from './firestoreStakeholderTeamsRepository';
// export * from './firestoreItemsRepository';
// export * from './firestoreProjectDecisionsRepository';
// export * from './firestoreTeamHierarchyRepository';

// Re-export Firebase config for admin usage  
export { adminDb as db } from '../firebase-admin';