import { Project } from '@/lib/domain/Project'

export interface ProjectDecisionsRepository {
  /**
   * Creates a new project
   * @param project The project to create
   * @returns The created project
   */
  create(project: Project): Promise<Project>

  /**
   * Deletes a project
   * @param project The project to delete
   * @returns Promise that resolves when the project is deleted
   */
  delete(project: Project): Promise<void>

  /**
   * Updates an existing project
   * @param project The project with updated values
   * @returns The updated project
   */
  update(project: Project): Promise<Project>

  /**
   * Retrieves a project by its ID within the scope of an organisation and team
   * @param organisationId The ID of the organisation the project belongs to
   * @param teamId The ID of the team the project belongs to
   * @param projectId The ID of the project to retrieve
   * @returns The project if found, null otherwise
   */
  getById(organisationId: string, teamId: string, projectId: string): Promise<Project | null>
} 