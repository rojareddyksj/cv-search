import * as fs from 'fs';
import * as path from 'path';
import { CV } from '../src/lib/cohere';

const SOURCE_DIR = path.join(process.cwd(), 'data', 'cvs');
const TARGET_FILE = path.join(process.cwd(), 'data', 'cvs-db.json');
const EMBEDDINGS_FILE = path.join(process.cwd(), 'data', 'embeddings.json');

async function importCVs() {
  console.log('Importing existing CVs into web app database...\n');

  // Check if embeddings file exists
  if (!fs.existsSync(EMBEDDINGS_FILE)) {
    console.error('❌ Embeddings file not found!');
    console.log('Please run: npm run search');
    console.log('This will generate the embeddings file.');
    process.exit(1);
  }

  // Load embeddings
  console.log('📊 Loading embeddings...');
  const embeddingsData = JSON.parse(fs.readFileSync(EMBEDDINGS_FILE, 'utf-8'));
  console.log(`✓ Loaded ${embeddingsData.length} embeddings\n`);

  // Create CV database
  const cvDatabase: CV[] = embeddingsData.map((item: any, index: number) => ({
    id: `cv_imported_${index}_${Date.now()}`,
    filename: item.filename,
    content: item.content,
    embedding: item.embedding,
    uploadedAt: new Date(),
  }));

  // Ensure target directory exists
  const targetDir = path.dirname(TARGET_FILE);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Save to database
  fs.writeFileSync(TARGET_FILE, JSON.stringify(cvDatabase, null, 2));

  console.log('✅ Import complete!');
  console.log(`   Imported: ${cvDatabase.length} CVs`);
  console.log(`   Saved to: ${TARGET_FILE}`);
  console.log('\n🚀 You can now run: npm run dev');
  console.log('   Then open: http://localhost:3000\n');
}

importCVs().catch(console.error);