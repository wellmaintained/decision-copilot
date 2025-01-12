import { adminDb } from '@/lib/firebase-admin'

async function copyDecisions() {
  try {
    // Get all decisions from root collection
    const decisionsSnapshot = await adminDb.collection('decisions').get()
    
    console.log(`Found ${decisionsSnapshot.size} decisions to migrate`)
    
    for (const doc of decisionsSnapshot.docs) {
      const decision = doc.data()
      const organisationId = "V7OEcPmAKrOCmVu5k3Z6" // WellMaintained Ltd
      const teamId = "CeyiAfZKl2X2xcnqRWyH" // Engineering
      const projectId = "QfDXzycocWVUobZ3Q4ky" // WebApp 
      
      // New path for the decision
      const newPath = `organisations/${organisationId}/teams/${teamId}/projects/${projectId}/decisions`
      
      // Create the decision in new location with same ID
      await adminDb.doc(`${newPath}/${doc.id}`).set(decision)
      
      // Optionally delete the original after verification
      // await doc.ref.delete()
      
      console.log(`Copied decision ${doc.id} to ${newPath}`)
    }
    
    console.log('Copying decisions completed successfully')
    
  } catch (error) {
    console.error('Copying decisions failed:', error)
  }
}

copyDecisions() 