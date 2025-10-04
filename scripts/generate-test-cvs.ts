import { CohereClient } from 'cohere-ai';
import * as fs from 'fs';
import * as path from 'path';

const cohere = new CohereClient({
  token: 'urHf4BtmwVpVvNornL5HvH14WLxNS9wthWIWGj1p',
});

const mobileSkills = [
  ['iOS', 'Swift', 'SwiftUI', 'UIKit', 'Core Data', 'Xcode'],
  ['Android', 'Kotlin', 'Java', 'Jetpack Compose', 'Room', 'Android Studio'],
  ['React Native', 'JavaScript', 'TypeScript', 'Expo', 'Redux'],
  ['Flutter', 'Dart', 'Firebase', 'Provider', 'Bloc'],
];

const otherSkills = [
  ['Python', 'Django', 'Flask', 'PostgreSQL', 'REST API'],
  ['JavaScript', 'Node.js', 'Express', 'MongoDB', 'React'],
  ['Java', 'Spring Boot', 'Hibernate', 'MySQL', 'Microservices'],
];

const names = [
  'John Smith', 'Maria Garcia', 'Pierre Dubois', 'Hans Mueller',
  'Emma Wilson', 'Carlos Rodriguez', 'Sophie Martin',
];

async function generateCV(skills: string[], name: string, index: number): Promise<string> {
  const yearsExp = Math.floor(Math.random() * 8) + 3;

  const prompt = `Generate a realistic CV/resume in English for a software engineer named ${name} with ${yearsExp} years of experience. Main skills: ${skills.join(', ')}. Include: personal summary, work experience (2-3 companies), education, technical skills section, and projects. Make it realistic and professional. DO NOT use the words "mobile" or "developer" anywhere. Keep it concise, around 300-400 words.`;

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

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Starting test CV generation (10 CVs)...\n');

  // Generate 7 CVs with mobile skills
  for (let i = 0; i < 7; i++) {
    const skillSet = mobileSkills[i % mobileSkills.length];
    const name = names[i];

    console.log(`[${i + 1}/10] Generating: ${name} - ${skillSet[0]} specialist...`);

    const cvContent = await generateCV(skillSet, name, i);

    if (cvContent) {
      const filename = `cv_${String(i).padStart(3, '0')}_${name.toLowerCase().replace(' ', '_')}_${skillSet[0].toLowerCase().replace(' ', '_')}.txt`;
      fs.writeFileSync(path.join(outputDir, filename), cvContent);
      console.log(`✓ Saved: ${filename}\n`);
    }

    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  // Generate 3 CVs with other skills
  for (let i = 7; i < 10; i++) {
    const skillSet = otherSkills[(i - 7) % otherSkills.length];
    const name = names[i % names.length];

    console.log(`[${i + 1}/10] Generating: ${name} - ${skillSet[0]} specialist...`);

    const cvContent = await generateCV(skillSet, name, i);

    if (cvContent) {
      const filename = `cv_${String(i).padStart(3, '0')}_${name.toLowerCase().replace(' ', '_')}_${skillSet[0].toLowerCase()}.txt`;
      fs.writeFileSync(path.join(outputDir, filename), cvContent);
      console.log(`✓ Saved: ${filename}\n`);
    }

    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log(`\n✓ Completed! Generated 10 CVs in ${outputDir}`);
}

main().catch(console.error);