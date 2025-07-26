import { Organisation, OrganisationProps , OrganisationsRepository , Team , Project , TeamHierarchy, TeamHierarchyNode } from "@decision-copilot/domain";
import type { Firestore } from "firebase/firestore";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { FirestoreStakeholdersRepository } from "./firestoreStakeholdersRepository";
import { FirestoreTeamHierarchyRepository } from "./firestoreTeamHierarchyRepository";

export class FirestoreOrganisationsRepository
  implements OrganisationsRepository
{
  private stakeholdersRepository: FirestoreStakeholdersRepository;
  private teamHierarchyRepository: FirestoreTeamHierarchyRepository;

  constructor(private db: Firestore) {
    this.stakeholdersRepository = new FirestoreStakeholdersRepository(this.db);
    this.teamHierarchyRepository = new FirestoreTeamHierarchyRepository(this.db);
  }

  async create(props: Omit<OrganisationProps, "id">): Promise<Organisation> {
    // Create the main organisation document
    const orgDoc = await addDoc(collection(this.db, "organisations"), {
      name: props.name,
      createdAt: new Date(),
    });

    const organisation = {
      id: orgDoc.id,
      name: props.name,
    };

    // Create teams using the team hierarchy repository
    const teamHierarchyNodes: Record<string, TeamHierarchyNode> = {};

    // Convert teams to team hierarchy nodes
    for (const team of props.teams) {
      // Create team node
      teamHierarchyNodes[team.id] = {
        id: team.id,
        name: team.name,
        parentId: null, // All teams are root teams by default
        children: {},
      };

      // Add projects to a subcollection within the organisation
      await Promise.all(
        team.projects.map(async (project) => {
          await addDoc(collection(this.db, "organisations", orgDoc.id, "projects"), {
            name: project.name,
            description: project.description,
            teamId: team.id,
            organisationId: orgDoc.id,
          });
        }),
      );
    }

    // Save the team hierarchy
    const teamHierarchy = TeamHierarchy.create({ teams: teamHierarchyNodes });
    await this.teamHierarchyRepository.save(orgDoc.id, teamHierarchy);

    // Return the organisation with teams
    return Organisation.create({
      id: orgDoc.id,
      name: props.name,
      teams: props.teams.map((team) =>
        Team.create({
          id: team.id,
          name: team.name,
          organisation,
          projects: team.projects,
        }),
      ),
    });
  }

  async getById(id: string): Promise<Organisation> {
    const docRef = doc(this.db, "organisations", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("Organisation not found");
    }

    const data = docSnap.data();
    const organisation = {
      id: docSnap.id,
      name: data.name,
    };

    // Get team hierarchy from the team hierarchy repository
    const teamHierarchy =
      await this.teamHierarchyRepository.getByOrganisationId(id);

    if (!teamHierarchy) {
      // Return organisation with empty teams if no team hierarchy exists
      return Organisation.create({
        id: docSnap.id,
        name: data.name,
        teams: [],
      });
    }

    // Get projects from the projects subcollection
    const projectsSnap = await getDocs(
      collection(this.db, "organisations", id, "projects"),
    );
    const projectsByTeam: Record<string, Project[]> = {};

    // Group projects by team
    await Promise.all(
      projectsSnap.docs.map(async (projectDoc) => {
        const projectData = projectDoc.data();
        const teamId = projectData.teamId;

        if (!projectsByTeam[teamId]) {
          projectsByTeam[teamId] = [];
        }

        projectsByTeam[teamId].push(
          Project.create({
            id: projectDoc.id,
            name: projectData.name,
            description: projectData.description,
            organisationId: id,
          }),
        );
      }),
    );

    // Create teams from the team hierarchy
    const teams = Object.values(teamHierarchy.teams).map((teamNode) => {
      return Team.create({
        id: teamNode.id,
        name: teamNode.name,
        organisation,
        projects: projectsByTeam[teamNode.id] || [],
      });
    });

    // Return the organisation with teams
    return Organisation.create({
      id: docSnap.id,
      name: data.name,
      teams,
    });
  }

  async getForStakeholder(stakeholderEmail: string): Promise<Organisation[]> {
    // First lookup the stakeholder by email
    const stakeholder =
      await this.stakeholdersRepository.getByEmail(stakeholderEmail);

    if (!stakeholder) {
      throw new Error(
        "Stakeholder with email <<" + stakeholderEmail + ">> not found",
      );
    }

    // Then get all stakeholderTeams for this stakeholder
    const stakeholderTeamsQuery = query(
      collection(this.db, "stakeholderTeams"),
      where("stakeholderId", "==", stakeholder.id),
    );
    const stakeholderTeamsSnap = await getDocs(stakeholderTeamsQuery);

    // Get unique organisation IDs
    const organisationIds = new Set(
      stakeholderTeamsSnap.docs.map((doc) => doc.data().organisationId),
    );

    // Fetch each organisation
    const organisations = await Promise.all(
      Array.from(organisationIds).map((orgId) => this.getById(orgId)),
    );

    return organisations.filter((org): org is Organisation => org !== null);
  }

  async update(organisation: Organisation): Promise<void> {
    const docRef = doc(this.db, "organisations", organisation.id);
    await updateDoc(docRef, {
      name: organisation.name,
    });

    // Get the current team hierarchy
    const currentTeamHierarchy =
      await this.teamHierarchyRepository.getByOrganisationId(organisation.id);
    const teamHierarchyNodes: Record<string, TeamHierarchyNode> =
      currentTeamHierarchy?.teams || {};

    // Update team hierarchy nodes with the updated team information
    for (const team of organisation.teams) {
      if (teamHierarchyNodes[team.id]) {
        // Update existing team
        teamHierarchyNodes[team.id].name = team.name;
      } else {
        // Add new team
        teamHierarchyNodes[team.id] = {
          id: team.id,
          name: team.name,
          parentId: null, // New teams are added as root teams by default
          children: {},
        };
      }

      // Update projects
      for (const project of team.projects) {
        // Check if project exists
        const projectRef = doc(
          this.db,
          "organisations",
          organisation.id,
          "projects",
          project.id,
        );
        const projectSnap = await getDoc(projectRef);

        if (projectSnap.exists()) {
          // Update existing project
          await updateDoc(projectRef, {
            name: project.name,
            description: project.description,
            teamId: team.id,
          });
        } else {
          // Add new project
          await addDoc(
            collection(this.db, "organisations", organisation.id, "projects"),
            {
              name: project.name,
              description: project.description,
              teamId: team.id,
              organisationId: organisation.id,
            },
          );
        }
      }
    }

    // Save the updated team hierarchy
    const teamHierarchy = TeamHierarchy.create({ teams: teamHierarchyNodes });
    await this.teamHierarchyRepository.save(organisation.id, teamHierarchy);
  }

  async delete(id: string): Promise<void> {
    // Delete all projects in the organisation
    const projectsSnap = await getDocs(
      collection(this.db, "organisations", id, "projects"),
    );
    for (const projectDoc of projectsSnap.docs) {
      // Delete decisions for this project if they exist
      try {
        const decisionsSnap = await getDocs(
          collection(
            this.db,
            "organisations",
            id,
            "projects",
            projectDoc.id,
            "decisions",
          ),
        );
        for (const decisionDoc of decisionsSnap.docs) {
          await deleteDoc(decisionDoc.ref);
        }
      } catch (error) {
        console.error(
          `Error deleting decisions for project ${projectDoc.id}:`,
          error,
        );
      }

      // Delete the project
      await deleteDoc(projectDoc.ref);
    }

    // Delete the team hierarchy document
    try {
      const teamHierarchy =
        await this.teamHierarchyRepository.getByOrganisationId(id);
      if (teamHierarchy) {
        await deleteDoc(
          doc(this.db, "organisations", id, "teamHierarchies", "hierarchy"),
        );
      }
    } catch (error) {
      console.error(
        `Error deleting team hierarchy for organisation ${id}:`,
        error,
      );
    }

    // Delete the organisation document
    const docRef = doc(this.db, "organisations", id);
    await deleteDoc(docRef);
  }

  async getAll(): Promise<Organisation[]> {
    const orgsSnap = await getDocs(collection(this.db, "organisations"));
    const organisations = await Promise.all(
      orgsSnap.docs.map(async (doc) => {
        try {
          return await this.getById(doc.id);
        } catch (error) {
          console.error(`Error fetching organisation ${doc.id}:`, error);
          return null;
        }
      }),
    );
    return organisations.filter((org): org is Organisation => org !== null);
  }
}
