// Test fixtures for domain models
// Note: These are type-only imports to avoid circular dependencies

export interface TestOrganisationProps {
  id: string;
  name: string;
  teams: TestTeamProps[];
}

export interface TestTeamProps {
  id: string;
  name: string;
  organisation: { id: string; name: string };
  projects: TestProjectProps[];
}

export interface TestProjectProps {
  id: string;
  name: string;
}

export interface TestStakeholderProps {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
}

export interface TestDecisionProps {
  id: string;
  title: string;
  description: string;
  cost: 'low' | 'medium' | 'high';
  reversibility: 'hat' | 'haircut' | 'tattoo';
  stakeholders: Array<{ stakeholder_id: string; role: string }>;
  driverStakeholderId: string;
  supportingMaterials: any[];
  organisationId: string;
  teamIds: string[];
  projectIds: string[];
  createdAt: Date;
}

export const createTestOrganisationProps = (overrides: Partial<TestOrganisationProps> = {}): TestOrganisationProps => {
  return {
    id: 'test-org-1',
    name: 'Test Organisation',
    teams: [],
    ...overrides
  };
};

export const createTestTeamProps = (overrides: Partial<TestTeamProps> = {}): TestTeamProps => {
  return {
    id: 'test-team-1',
    name: 'Test Team',
    organisation: { id: 'test-org-1', name: 'Test Organisation' },
    projects: [],
    ...overrides
  };
};

export const createTestStakeholderProps = (overrides: Partial<TestStakeholderProps> = {}): TestStakeholderProps => {
  return {
    id: 'test-stakeholder-1',
    displayName: 'Test Stakeholder',
    email: 'test@example.com',
    ...overrides
  };
};

export const createTestDecisionProps = (overrides: Partial<TestDecisionProps> = {}): TestDecisionProps => {
  return {
    id: 'test-decision-1',
    title: 'Test Decision',
    description: 'A test decision for unit tests',
    cost: 'low',
    reversibility: 'hat',
    stakeholders: [],
    driverStakeholderId: 'test-stakeholder-1',
    supportingMaterials: [],
    organisationId: 'test-org-1',
    teamIds: [],
    projectIds: [],
    createdAt: new Date('2024-01-01'),
    ...overrides
  };
}; 