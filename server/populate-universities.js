import { db } from './config/firebase.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Read the universities data from the frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the universities.ts file from the frontend
const universitiesFile = join(__dirname, '..', 'src', 'data', 'universities.ts');
const fileContent = readFileSync(universitiesFile, 'utf-8');

// Extract the universities array from the TypeScript file
const universitiesMatch = fileContent.match(/const universities: University\[\] = \[([\s\S]*?)\];/);
if (!universitiesMatch) {
  console.error('❌ Could not find universities array in the file');
  process.exit(1);
}

const universitiesData = universitiesMatch[1];

// Parse the universities data (this is a simplified parser)
const universities = [];
const universityRegex = /\{\s*id:\s*"([^"]+)",\s*schoolName:\s*"([^"]+)",\s*city:\s*"([^"]+)",\s*country:\s*"([^"]+)",\s*region:\s*"([^"]+)",[\s\S]*?\}/g;

let match;
while ((match = universityRegex.exec(universitiesData)) !== null) {
  universities.push({
    id: match[1],
    schoolName: match[2],
    city: match[3],
    country: match[4],
    region: match[5]
  });
}

async function populateUniversities() {
  try {
    console.log(`🔄 Starting to populate ${universities.length} universities...`);

    const batch = db.batch();
    let count = 0;

    for (const university of universities) {
      const docRef = db.collection('universities').doc(university.id);
      batch.set(docRef, university);
      count++;

      // Firestore batch limit is 500 operations
      if (count % 500 === 0) {
        await batch.commit();
        console.log(`✅ Committed batch of ${count} universities`);
        // Start new batch
        batch = db.batch();
      }
    }

    // Commit remaining batch
    if (count % 500 !== 0) {
      await batch.commit();
    }

    console.log(`✅ Successfully populated ${universities.length} universities in Firestore!`);

    // Verify the data
    const snapshot = await db.collection('universities').limit(5).get();
    console.log('\n📋 Sample universities added:');
    snapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ${data.schoolName} (${data.city}, ${data.country})`);
    });

  } catch (error) {
    console.error('❌ Error populating universities:', error);
  }
}

populateUniversities();




