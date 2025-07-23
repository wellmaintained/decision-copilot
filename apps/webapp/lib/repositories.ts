/**
 * Repository Singleton Factory
 * 
 * This module provides singleton instances of all repositories to eliminate
 * unnecessary instantiation and improve performance. Instead of creating
 * new repository instances in each hook, all hooks should use these
 * centralized singleton instances.
 * 
 * Benefits:
 * - Reduces memory usage by reusing instances
 * - Improves performance by avoiding repeated instantiation
 * - Provides centralized configuration
 * - Maintains consistent database connection across the application
 */

import { db } from '@/lib/env';
import {
  FirestoreDecisionsRepository,
  FirestoreStakeholdersRepository,
  FirestoreOrganisationsRepository,
  FirestoreStakeholderTeamsRepository,
  FirestoreTeamHierarchyRepository,
  FirestoreItemsRepository,
} from '@decision-copilot/infrastructure';

/**
 * Singleton repository instances
 * 
 * These instances are created once and reused throughout the application.
 * All hooks should import and use these instances instead of creating new ones.
 */
export const repositories = {
  /**
   * Decisions repository for managing decision data
   */
  decisions: new FirestoreDecisionsRepository(db),

  /**
   * Stakeholders repository for managing stakeholder data
   */
  stakeholders: new FirestoreStakeholdersRepository(db),

  /**
   * Organisations repository for managing organisation data
   */
  organisations: new FirestoreOrganisationsRepository(db),

  /**
   * Stakeholder teams repository for managing team relationships
   */
  stakeholderTeams: new FirestoreStakeholderTeamsRepository(db),

  /**
   * Team hierarchy repository for managing team hierarchies
   */
  teamHierarchy: new FirestoreTeamHierarchyRepository(db),

  /**
   * Items repository for managing decision items
   */
  items: new FirestoreItemsRepository(db),
} as const;

/**
 * Type helper for repository access
 * 
 * This type can be used to ensure type safety when accessing repositories
 */
export type Repositories = typeof repositories;

/**
 * Individual repository exports for backward compatibility
 * 
 * These exports allow hooks to import specific repositories directly
 * while still using the singleton instances
 */
export const {
  decisions: decisionsRepository,
  stakeholders: stakeholdersRepository,
  organisations: organisationsRepository,
  stakeholderTeams: stakeholderTeamsRepository,
  teamHierarchy: teamHierarchyRepository,
  items: itemsRepository,
} = repositories;