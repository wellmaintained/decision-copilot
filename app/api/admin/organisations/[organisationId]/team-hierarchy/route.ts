import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/adminApiRoute'
import { FirestoreTeamHierarchyRepository } from '@/lib/infrastructure/firestoreTeamHierarchyRepository'
import { TeamHierarchy } from '@/lib/domain/TeamHierarchy'

const repository = new FirestoreTeamHierarchyRepository()

export const GET = withAdminAuth(async (req: NextRequest, { params }) => {
  try {
    const { organisationId } = await params
    const hierarchy = await repository.getByOrganisationId(organisationId)
    
    if (!hierarchy) {
      // Return an empty hierarchy if none exists
      return NextResponse.json(TeamHierarchy.create({ teams: {} }))
    }
    
    return NextResponse.json(hierarchy)
  } catch (error) {
    console.error('Error fetching team hierarchy:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team hierarchy' },
      { status: 500 }
    )
  }
})

export const POST = withAdminAuth(async (req: NextRequest, { params }) => {
  try {
    const { organisationId } = await params
    const team = await req.json()
    
    let hierarchy = await repository.getByOrganisationId(organisationId)
    if (!hierarchy) {
      hierarchy = TeamHierarchy.create({ teams: {} })
    }
    
    const updatedHierarchy = hierarchy.addTeam(team)
    await repository.save(organisationId, updatedHierarchy)
    
    return NextResponse.json(updatedHierarchy)
  } catch (error) {
    console.error('Error adding team:', error)
    return NextResponse.json(
      { error: 'Failed to add team' },
      { status: 500 }
    )
  }
})

export const PUT = withAdminAuth(async (req: NextRequest, { params }) => {
  try {
    const { organisationId } = await params
    const { teamId, updates } = await req.json()
    
    const hierarchy = await repository.getByOrganisationId(organisationId)
    if (!hierarchy) {
      return NextResponse.json(
        { error: 'Team hierarchy not found' },
        { status: 404 }
      )
    }
    
    const updatedHierarchy = hierarchy.updateTeam(teamId, updates)
    await repository.save(organisationId, updatedHierarchy)
    
    return NextResponse.json(updatedHierarchy)
  } catch (error) {
    console.error('Error updating team:', error)
    return NextResponse.json(
      { error: 'Failed to update team' },
      { status: 500 }
    )
  }
})

export const DELETE = withAdminAuth(async (req: NextRequest, { params }) => {
  try {
    const { organisationId } = await params
    const { teamId } = await req.json()
    
    const hierarchy = await repository.getByOrganisationId(organisationId)
    if (!hierarchy) {
      return NextResponse.json(
        { error: 'Team hierarchy not found' },
        { status: 404 }
      )
    }
    
    const updatedHierarchy = hierarchy.removeTeam(teamId)
    await repository.save(organisationId, updatedHierarchy)
    
    return NextResponse.json(updatedHierarchy)
  } catch (error) {
    console.error('Error removing team:', error)
    return NextResponse.json(
      { error: 'Failed to remove team' },
      { status: 500 }
    )
  }
}) 