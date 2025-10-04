# CV Semantic Search Assignment

This project demonstrates **semantic search** for CVs using Cohere's Text Embedding model.

## How Semantic Search Works for Indirect Information

The key question: **"How do you find mobile developers when CVs mention iOS, Android, Flutter, etc., but never use the words 'mobile' or 'developer'?"**

### The Solution: Semantic Embeddings

1. **Text Embeddings**: Convert CVs into high-dimensional vectors (embeddings) that capture semantic meaning
2. **Query Embeddings**: Convert search queries like "mobile developers" into the same vector space
3. **Similarity Matching**: Find CVs with embeddings closest to the query embedding using cosine similarity

**Key Insight**: Embeddings understand that:
- "iOS developer" ≈ "mobile developer"
- "Android engineer" ≈ "mobile developer"
- "Swift + UIKit" ≈ "mobile development"
- Even without explicit keywords, the *semantic meaning* is captured

## Project Structure

```
scripts/
├── generate-cvs.ts      # Generates 100 CVs in 4 languages
└── semantic-search.ts   # Implements semantic search with Cohere embeddings

data/
├── cvs/                 # Generated CV text files
└── embeddings.json      # Cached embeddings (created after first run)
```

## Setup & Usage

### Quick Start (10 CVs for testing)

```bash
# Install dependencies
npm install

# Generate 10 test CVs (7 mobile, 3 backend)
npm run generate-test

# Run semantic search
npm run search
```

### Full Dataset (100 CVs)

```bash
# Generate 100 CVs
npm run generate-cvs
```

This generates 100 CVs:
- **60 CVs** with mobile skills (iOS, Android, React Native, Flutter, Xamarin)
- **40 CVs** with other skills (Python, Java, PHP, etc.)
- **4 languages**: English, Spanish, French, German
- **Important**: CVs never use the words "mobile" or "developer"

### Run Semantic Search

```bash
npm run search
```

This will:
1. Load all CVs from `data/cvs/`
2. Generate embeddings using Cohere's `embed-english-v3.0` model
3. Cache embeddings for future runs (in `data/embeddings.json`)
4. Search for "mobile developers"
5. Return top 5 most relevant CVs with similarity scores

## How It Works

### CV Generation (`generate-cvs.ts`)

- Uses Cohere's `command-a-03-2025` model to generate realistic CVs
- Each CV includes: summary, work experience, education, skills, projects
- Mobile CVs use terms like: iOS, Android, Swift, Kotlin, React Native, Flutter
- Deliberately avoids "mobile" and "developer" keywords

### Semantic Search (`semantic-search.ts`)

```typescript
1. Load CVs → 100 text documents
2. Embed CVs → 100 vectors (1024 dimensions each)
3. Embed query → "mobile developers" → 1 vector
4. Calculate cosine similarity → Compare query vector to all CV vectors
5. Rank results → Sort by similarity score
6. Return top 5 → Most semantically similar CVs
```

**Cosine Similarity Formula**:
```
similarity = (A · B) / (||A|| × ||B||)
```
- Returns value between 0 and 1
- Higher = more similar

## Example Output

```
TOP 5 MOBILE DEVELOPERS
===============================================================================

1. cv_042_english_ios.txt (Similarity: 87.34%)
--------------------------------------------------------------------------------
Summary: Experienced software engineer with 6 years building iOS applications
using Swift, SwiftUI, and UIKit. Expert in Core Data and Xcode...

2. cv_018_spanish_android.txt (Similarity: 85.21%)
--------------------------------------------------------------------------------
Resumen: Ingeniero de software con 4 años creando aplicaciones Android
con Kotlin, Jetpack Compose, y Room...

3. cv_053_french_flutter.txt (Similarity: 84.67%)
--------------------------------------------------------------------------------
Résumé: Ingénieur logiciel avec 5 ans d'expérience dans Flutter,
Dart, et Firebase...
```

## Why This Works

Traditional keyword search would **fail** because:
- Query: "mobile developer"
- CV text: "iOS", "Android", "Swift", "Kotlin"
- **No exact match** → No results

Semantic search **succeeds** because:
- The embedding model understands:
  - iOS → mobile platform
  - Swift → iOS programming language → mobile development
  - Android + Kotlin → mobile development
- Vector similarity captures these relationships
- Returns relevant results even without keyword matches

## Technologies Used

- **Cohere AI**: Text generation and embeddings
- **embed-english-v3.0**: Multilingual embedding model (1024 dimensions)
- **TypeScript**: Type-safe script development
- **Node.js**: Runtime environment

## Key Learnings

1. **Semantic understanding** beats keyword matching for complex queries
2. **Embeddings** capture meaning, not just words
3. **Multilingual models** work across languages (English, Spanish, French, German)
4. **Caching embeddings** improves performance (embed once, search many times)
5. **Cosine similarity** is ideal for comparing high-dimensional vectors

## Notes

- First run takes ~2-3 minutes (generating 100 CVs + embeddings)
- Subsequent searches are instant (uses cached embeddings)
- Cohere API has rate limits (added delays in code)
- Embeddings are saved to avoid re-computation