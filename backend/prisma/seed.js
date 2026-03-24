const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const hash = (pwd) => bcrypt.hash(pwd, 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@hackathon.local' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@hackathon.local',
      passwordHash: await hash('admin1234'),
      role: 'ADMIN',
    },
  })

  const judge = await prisma.user.upsert({
    where: { email: 'judge@hackathon.local' },
    update: {},
    create: {
      name: 'Judge One',
      email: 'judge@hackathon.local',
      passwordHash: await hash('judge1234'),
      role: 'JUDGE',
    },
  })

  const participant = await prisma.user.upsert({
    where: { email: 'participant@hackathon.local' },
    update: {},
    create: {
      name: 'Alice Participant',
      email: 'participant@hackathon.local',
      passwordHash: await hash('part1234'),
      role: 'PARTICIPANT',
    },
  })

  console.log('Seeded:')
  console.log('  Admin:       admin@hackathon.local / admin1234')
  console.log('  Judge:       judge@hackathon.local / judge1234')
  console.log('  Participant: participant@hackathon.local / part1234')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
