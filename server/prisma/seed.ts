import 'dotenv/config';
import prisma from '../src/prisma';

interface SeedCategory {
  name: string;
  description: string;
  skills: string[];
}

const skillCatalog: SeedCategory[] = [
  {
    name: 'Programming Languages',
    description: 'Core software development and scripting languages',
    skills: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'PHP'],
  },
  {
    name: 'Frontend Development',
    description: 'Client-side web development libraries and technologies',
    skills: ['HTML', 'CSS', 'React', 'Next.js', 'Vue.js'],
  },
  {
    name: 'Backend Development',
    description: 'Server-side runtimes, frameworks, and web architectures',
    skills: ['Node.js', 'Express.js', 'Spring Boot', '.NET', 'Django'],
  },
  {
    name: 'Databases',
    description: 'Relational, NoSQL, and document database engines',
    skills: ['PostgreSQL', 'MySQL', 'MongoDB', 'Firebase'],
  },
  {
    name: 'Cloud & DevOps',
    description: 'Version control, containers, cloud infrastructure, and CI/CD',
    skills: ['Git', 'GitHub', 'Docker', 'AWS'],
  },
  {
    name: 'Design',
    description: 'UI, UX, and digital product design tools',
    skills: ['Figma', 'UI/UX Design'],
  },
  {
    name: 'Data & AI',
    description: 'Data analysis, numerical computing, and machine learning',
    skills: ['Pandas', 'NumPy', 'Machine Learning'],
  },
  {
    name: 'Testing',
    description: 'Automated test frameworks and API testing tools',
    skills: ['Jest', 'Postman'],
  },
  {
    name: 'Soft Skills',
    description: 'Professional collaboration, problem solving, and workplace competencies',
    skills: ['Communication', 'Teamwork', 'Problem Solving', 'Time Management'],
  },
];

async function main() {
  console.log('🌱 Starting idempotent database seed for skill catalog...');

  for (const categoryData of skillCatalog) {
    // 1. Upsert Category
    const category = await prisma.skillCategory.upsert({
      where: { name: categoryData.name },
      update: { description: categoryData.description },
      create: {
        name: categoryData.name,
        description: categoryData.description,
      },
    });

    console.log(`📁 Category ready: ${category.name}`);

    // 2. Upsert Skills under this category
    for (const skillName of categoryData.skills) {
      await prisma.skill.upsert({
        where: { name: skillName },
        update: { categoryId: category.id },
        create: {
          name: skillName,
          categoryId: category.id,
        },
      });
    }
  }

  const categoryCount = await prisma.skillCategory.count();
  const skillCount = await prisma.skill.count();

  console.log(`✅ Seed completed successfully!`);
  console.log(`📊 Total Categories: ${categoryCount}`);
  console.log(`📊 Total Skills: ${skillCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Error executing database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
