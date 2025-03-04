import { Project, ProjectProps } from '@/lib/domain/Project'
import { ProjectDecisionsRepository } from '@/lib/domain/projectDecisionsRepository'
import { getFirestore, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'

export class FirestoreProjectDecisionsRepository implements ProjectDecisionsRepository {
  private db = getFirestore()

  private getProjectPath(organisationId: string, projectId: string): string {
    return `organisations/${organisationId}/projects/${projectId}`
  }

  async create(project: Project): Promise<Project> {
    const path = this.getProjectPath(project.organisationId, project.id)
    const docRef = doc(this.db, path)
    
    await setDoc(docRef, {
      id: project.id,
      name: project.name,
      description: project.description,
      organisationId: project.organisationId,
    })

    return project
  }

  async delete(project: Project): Promise<void> {
    const path = this.getProjectPath(project.organisationId, project.id)
    const docRef = doc(this.db, path)
    await deleteDoc(docRef)
  }

  async update(project: Project): Promise<Project> {
    const path = this.getProjectPath(project.organisationId, project.id)
    const docRef = doc(this.db, path)
    
    await setDoc(docRef, {
      id: project.id,
      name: project.name,
      description: project.description,
      organisationId: project.organisationId,
    }, { merge: true })

    return project
  }

  async getById(organisationId: string, projectId: string): Promise<Project | null> {
    const path = this.getProjectPath(organisationId, projectId)
    const docRef = doc(this.db, path)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    const data = docSnap.data() as ProjectProps
    return Project.create(data)
  }
} 