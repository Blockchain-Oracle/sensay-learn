import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Seed languages
  const languages = [
    { code: "es", name: "Spanish", nativeName: "Español", flagEmoji: "🇪🇸" },
    { code: "fr", name: "French", nativeName: "Français", flagEmoji: "🇫🇷" },
    { code: "de", name: "German", nativeName: "Deutsch", flagEmoji: "🇩🇪" },
    { code: "it", name: "Italian", nativeName: "Italiano", flagEmoji: "🇮🇹" },
    { code: "pt", name: "Portuguese", nativeName: "Português", flagEmoji: "🇵🇹" },
    { code: "ja", name: "Japanese", nativeName: "日本語", flagEmoji: "🇯🇵" },
    { code: "zh", name: "Mandarin", nativeName: "中文", flagEmoji: "🇨🇳" },
    { code: "ar", name: "Arabic", nativeName: "العربية", flagEmoji: "🇸🇦" },
  ]

  for (const lang of languages) {
    await prisma.language.upsert({
      where: { code: lang.code },
      update: {},
      create: lang,
    })
  }

  // Seed experiments
  const experiments = [
    {
      title: "Acid-Base Titration",
      category: "chemistry",
      difficulty: "intermediate",
      durationMinutes: 30,
      description: "Determine the concentration of an unknown acid using a standard base solution",
      safetyGuidelines: ["Wear safety goggles", "Use fume hood", "Handle acids carefully"],
      requiredEquipment: ["Burette", "Conical flask", "Pipette", "pH indicator"],
      procedureSteps: [
        "Set up the burette with standard NaOH solution",
        "Pipette unknown acid into conical flask",
        "Add indicator to the acid solution",
        "Titrate slowly until endpoint is reached",
        "Record the volume of NaOH used",
        "Repeat for accuracy",
      ],
      learningObjectives: [
        "Understand acid-base neutralization",
        "Learn titration technique",
        "Calculate unknown concentrations",
      ],
    },
    {
      title: "Simple Pendulum",
      category: "physics",
      difficulty: "beginner",
      durationMinutes: 20,
      description: "Study the relationship between pendulum length and period",
      safetyGuidelines: ["Secure pendulum properly", "Clear workspace"],
      requiredEquipment: ["Pendulum bob", "String", "Ruler", "Stopwatch"],
      procedureSteps: [
        "Set up pendulum with known length",
        "Displace bob by small angle",
        "Release and time 10 oscillations",
        "Calculate period",
        "Repeat with different lengths",
        "Plot length vs period squared",
      ],
      learningObjectives: [
        "Understand simple harmonic motion",
        "Learn data collection techniques",
        "Analyze relationships between variables",
      ],
    },
  ]

  for (const exp of experiments) {
    await prisma.experiment.upsert({
      where: { title: exp.title },
      update: {},
      create: exp,
    })
  }

  // Seed achievements
  const achievements = [
    {
      name: "First Steps",
      description: "Complete your first learning session",
      learningMode: null,
      criteria: { sessions_completed: 1 },
      points: 10,
    },
    {
      name: "Study Streak",
      description: "Study for 7 days in a row",
      learningMode: "study-buddy",
      criteria: { streak_days: 7 },
      points: 50,
    },
    {
      name: "Language Explorer",
      description: "Practice 3 different languages",
      learningMode: "language-coach",
      criteria: { languages_practiced: 3 },
      points: 30,
    },
    {
      name: "Science Enthusiast",
      description: "Complete 5 virtual experiments",
      learningMode: "science-lab",
      criteria: { experiments_completed: 5 },
      points: 40,
    },
  ]

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: {},
      create: achievement,
    })
  }

  console.log("Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
