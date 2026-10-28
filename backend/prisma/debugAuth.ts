import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Check if admin user exists
  const user = await prisma.user.findUnique({ where: { email: 'admin@campcompass.edu' } });
  if (!user) {
    console.log('❌ USER NOT FOUND - re-running seed...');
    // Create admin directly
    const hash = bcrypt.hashSync('password123', 10);
    const institution = await prisma.institution.findFirst();
    if (institution) {
      const newUser = await prisma.user.create({
        data: {
          name: 'System Admin',
          email: 'admin@campcompass.edu',
          password: hash,
          role: 'admin',
          institutionId: institution.id,
        }
      });
      console.log('✅ Admin created:', newUser.email);
    }
    return;
  }

  console.log('User found:', user.email, '| role:', user.role);
  console.log('Hash length:', user.password?.length);

  const ok = await bcrypt.compare('password123', user.password);
  console.log('Password "password123" matches:', ok);

  if (!ok) {
    // Re-hash and update
    console.log('🔧 Updating password hash...');
    const newHash = bcrypt.hashSync('password123', 10);
    await prisma.user.update({
      where: { email: 'admin@campcompass.edu' },
      data: { password: newHash }
    });
    // Update ALL seeded users
    const emails = [
      'dr.sarah.mensah@campcompass.edu',
      'dr..sarah..mensah.@campcompass.edu',
      'kofi.acheampong@student.campcompass.edu',
      'registrar@campcompass.edu',
    ];
    for (const e of emails) {
      await prisma.user.updateMany({ where: { email: e }, data: { password: newHash } }).catch(() => {});
    }
    // Update ALL users with same hash
    await prisma.user.updateMany({ data: { password: newHash } });
    console.log('✅ All passwords reset to "password123"');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
