import { CohereClient } from 'cohere-ai';
import * as fs from 'fs';
import * as path from 'path';

const cohere = new CohereClient({
  token: 'urHf4BtmwVpVvNornL5HvH14WLxNS9wthWIWGj1p',
});

const languages = ['english', 'spanish', 'french', 'german'];
const mobileSkills = [
  ['iOS', 'Swift', 'SwiftUI', 'UIKit', 'Core Data', 'Xcode'],
  ['Android', 'Kotlin', 'Java', 'Jetpack Compose', 'Room', 'Android Studio'],
  ['React Native', 'JavaScript', 'TypeScript', 'Expo', 'Redux'],
  ['Flutter', 'Dart', 'Firebase', 'Provider', 'Bloc'],
  ['Xamarin', 'C#', '.NET MAUI', 'XAML'],
];

const otherSkills = [
  ['Python', 'Django', 'Flask', 'PostgreSQL', 'REST API'],
  ['JavaScript', 'Node.js', 'Express', 'MongoDB', 'React'],
  ['Java', 'Spring Boot', 'Hibernate', 'MySQL', 'Microservices'],
  ['C#', '.NET Core', 'Entity Framework', 'SQL Server', 'Azure'],
  ['PHP', 'Laravel', 'Symfony', 'MySQL', 'Docker'],
  ['Ruby', 'Rails', 'Sidekiq', 'Redis', 'Heroku'],
  ['Go', 'Gin', 'GORM', 'Kubernetes', 'gRPC'],
];

const prompts = {
  english: (skills: string[], yearsExp: number, name: string) =>
    `Generate a realistic CV/resume in English for a software engineer named ${name} with ${yearsExp} years of experience. Main skills: ${skills.join(', ')}. Include: personal summary, work experience (2-3 companies), education, skills section, and projects. Make it realistic and professional. DO NOT use the words "mobile" or "developer" anywhere. Keep it concise, around 300-400 words.`,

  spanish: (skills: string[], yearsExp: number, name: string) =>
    `Genera un CV/currículum realista en español para un ingeniero de software llamado ${name} con ${yearsExp} años de experiencia. Habilidades principales: ${skills.join(', ')}. Incluye: resumen personal, experiencia laboral (2-3 empresas), educación, sección de habilidades y proyectos. Hazlo realista y profesional. NO uses las palabras "móvil" o "desarrollador". Manténlo conciso, alrededor de 300-400 palabras.`,

  french: (skills: string[], yearsExp: number, name: string) =>
    `Générez un CV réaliste en français pour un ingénieur logiciel nommé ${name} avec ${yearsExp} ans d'expérience. Compétences principales: ${skills.join(', ')}. Inclure: résumé personnel, expérience professionnelle (2-3 entreprises), éducation, section compétences et projets. Rendez-le réaliste et professionnel. N'utilisez PAS les mots "mobile" ou "développeur". Gardez-le concis, environ 300-400 mots.`,

  german: (skills: string[], yearsExp: number, name: string) =>
    `Erstellen Sie einen realistischen Lebenslauf auf Deutsch für einen Software-Ingenieur namens ${name} mit ${yearsExp} Jahren Erfahrung. Hauptfähigkeiten: ${skills.join(', ')}. Einschließlich: persönliche Zusammenfassung, Berufserfahrung (2-3 Unternehmen), Ausbildung, Fähigkeiten und Projekte. Machen Sie es realistisch und professionell. Verwenden Sie NICHT die Wörter "mobil" oder "Entwickler". Halten Sie es prägnant, etwa 300-400 Wörter.`,
};

const names = [
  'John Smith', 'Maria Garcia', 'Pierre Dubois', 'Hans Mueller', 'Emma Wilson',
  'Carlos Rodriguez', 'Sophie Martin', 'Klaus Schmidt', 'Sarah Johnson', 'Luis Martinez',
  'Claire Bernard', 'Wolfgang Becker', 'Jennifer Brown', 'Pablo Hernandez', 'Isabelle Petit',
  'Michael Weber', 'Lisa Davis', 'Antonio Lopez', 'Marie Durand', 'Thomas Fischer',
];

async function generateCV(
  language: keyof typeof prompts,
  skills: string[],
  index: number
): Promise<string> {
  const name = names[index % names.length];
  const yearsExp = Math.floor(Math.random() * 10) + 2; // 2-11 years

  const prompt = prompts[language](skills, yearsExp, name);

  try {
    const response = await cohere.chat({
      model: 'command-a-03-2025',
      message: prompt,
    });

    return response.text;
  } catch (error) {
    console.error(`Error generating CV ${index}:`, error);
    return '';
  }
}

async function main() {
  const outputDir = path.join(process.cwd(), 'data', 'cvs');

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Starting CV generation...');

  let cvIndex = 0;

  // Generate 60 CVs with mobile skills (distributed across mobile technologies)
  for (let i = 0; i < 60; i++) {
    const language = languages[i % languages.length] as keyof typeof prompts;
    const skillSet = mobileSkills[i % mobileSkills.length];

    console.log(`Generating CV ${cvIndex + 1}/100 - ${language} - Mobile (${skillSet[0]})...`);

    const cvContent = await generateCV(language, skillSet, cvIndex);

    if (cvContent) {
      const filename = `cv_${String(cvIndex).padStart(3, '0')}_${language}_${skillSet[0].toLowerCase()}.txt`;
      fs.writeFileSync(path.join(outputDir, filename), cvContent);
    }

    cvIndex++;

    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Generate 40 CVs with other skills (not mobile)
  for (let i = 0; i < 40; i++) {
    const language = languages[i % languages.length] as keyof typeof prompts;
    const skillSet = otherSkills[i % otherSkills.length];

    console.log(`Generating CV ${cvIndex + 1}/100 - ${language} - Backend (${skillSet[0]})...`);

    const cvContent = await generateCV(language, skillSet, cvIndex);

    if (cvContent) {
      const filename = `cv_${String(cvIndex).padStart(3, '0')}_${language}_${skillSet[0].toLowerCase()}.txt`;
      fs.writeFileSync(path.join(outputDir, filename), cvContent);
    }

    cvIndex++;

    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\nCompleted! Generated ${cvIndex} CVs in ${outputDir}`);
}

main().catch(console.error);