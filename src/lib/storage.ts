import { CV } from './cohere';
import * as fs from 'fs';
import * as path from 'path';

const STORAGE_FILE = path.join(process.cwd(), 'data', 'cvs-db.json');

export function ensureStorageExists() {
  const dir = path.dirname(STORAGE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(STORAGE_FILE)) {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify([], null, 2));
  }
}

export function loadCVs(): CV[] {
  ensureStorageExists();
  const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
  const cvs = JSON.parse(data);
  // Convert uploadedAt strings back to Date objects
  return cvs.map((cv: CV) => ({
    ...cv,
    uploadedAt: new Date(cv.uploadedAt),
  }));
}

export function saveCVs(cvs: CV[]): void {
  ensureStorageExists();
  fs.writeFileSync(STORAGE_FILE, JSON.stringify(cvs, null, 2));
}

export function addCV(cv: CV): void {
  const cvs = loadCVs();
  cvs.push(cv);
  saveCVs(cvs);
}

export function getAllCVs(): CV[] {
  return loadCVs();
}

export function getCVById(id: string): CV | undefined {
  const cvs = loadCVs();
  return cvs.find(cv => cv.id === id);
}

export function deleteCV(id: string): boolean {
  const cvs = loadCVs();
  const filtered = cvs.filter(cv => cv.id !== id);
  if (filtered.length === cvs.length) {
    return false; // CV not found
  }
  saveCVs(filtered);
  return true;
}

export function updateCV(id: string, updates: Partial<CV>): boolean {
  const cvs = loadCVs();
  const index = cvs.findIndex(cv => cv.id === id);
  if (index === -1) {
    return false;
  }
  cvs[index] = { ...cvs[index], ...updates };
  saveCVs(cvs);
  return true;
}