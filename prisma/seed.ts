import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create default admin user
  const adminPassword = await bcrypt.hash('password123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ananka.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@ananka.com',
      passwordHash: adminPassword,
      role: 'ADMIN'
    }
  });

  // Create default sales user
  const salesPassword = await bcrypt.hash('password123', 10);
  
  const sales = await prisma.user.upsert({
    where: { email: 'sales@ananka.com' },
    update: {},
    create: {
      name: 'Sales User',
      email: 'sales@ananka.com',
      passwordHash: salesPassword,
      role: 'SALES'
    }
  });

  // Create company record
  const company = await prisma.company.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      name: 'Ananka Fasteners',
      primaryColor: '#4682B4',
      accentColor: '#FFD700'
    }
  });

  // Create sample leads
  const sampleLeads = [
    {
      messageId: 'msg_001',
      threadId: 'thread_001',
      marketingUser: 'John Doe',
      email: 'contact@techcorp.com',
      contactNo: '+1-555-0123',
      companyName: 'TechCorp Solutions',
      body: 'We are interested in your fastener products for our manufacturing needs. Please send us your catalog and pricing information.',
      subject: 'Fastener Products Inquiry',
      website: 'https://techcorp.com',
      date: new Date('2024-01-15'),
      country: 'United States',
      status: 'NEW' as const,
      quotationStatus: 'PENDING' as const
    },
    {
      messageId: 'msg_002',
      threadId: 'thread_002',
      marketingUser: 'Jane Smith',
      email: 'procurement@manufacturing.co.uk',
      contactNo: '+44-20-7946-0958',
      companyName: 'UK Manufacturing Ltd',
      body: 'Looking for high-quality stainless steel fasteners for automotive applications. Need bulk quantities.',
      subject: 'Automotive Fasteners - Bulk Order',
      website: 'https://ukmanufacturing.co.uk',
      date: new Date('2024-01-20'),
      country: 'United Kingdom',
      status: 'IN_PROGRESS' as const,
      quotationStatus: 'SENT' as const,
      followup: 'Quote sent, awaiting response',
      callFollowup: new Date('2024-02-01T10:00:00Z')
    },
    {
      messageId: 'msg_003',
      threadId: 'thread_003',
      marketingUser: 'Mike Johnson',
      email: 'buyer@construction.de',
      contactNo: '+49-30-12345678',
      companyName: 'German Construction GmbH',
      body: 'We need fasteners for construction projects. Please provide technical specifications and certifications.',
      subject: 'Construction Fasteners Inquiry',
      date: new Date('2024-01-25'),
      country: 'Germany',
      status: 'CLOSED' as const,
      quotationStatus: 'ACCEPTED' as const,
      dealWon: true,
      probableCustomer: true,
      remark: 'Successful deal closed. Customer satisfied with quality and pricing.'
    }
  ];

  for (const leadData of sampleLeads) {
    await prisma.lead.create({
      data: leadData
    });
  }

  console.log('Database seeded successfully!');
  console.log('Admin user: admin@ananka.com / password123');
  console.log('Sales user: sales@ananka.com / password123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });