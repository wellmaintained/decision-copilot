import { adminDb } from '@/lib/firebase-admin'

async function listOrganisations() {
  try {
    // Get all organisations
    const orgsSnapshot = await adminDb.collection('organisations').get()
    
    console.log(`Found ${orgsSnapshot.size} organisations:\n`)
    
    const table: {ID: string, Name: string}[] = []
    orgsSnapshot.forEach(doc => {
      const data = doc.data()
      table.push({'ID':doc.id, 'Name':data.name})
    })
    console.table(table)
    
  } catch (error) {
    console.error('Error fetching organisations:', error)
  }
}

// Run the script
listOrganisations() 