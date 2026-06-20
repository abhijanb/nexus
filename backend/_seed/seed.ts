import { prisma } from "../src/lib/prisma";

const USER_IDS = {
  alice: "00000000-0000-0000-0000-000000000001",
  bob: "00000000-0000-0000-0000-000000000002",
  charlie: "00000000-0000-0000-0000-000000000003",
} as const;

async function seed() {
  const alice = await prisma.user.upsert({
    where: { email: "alice@nexus.dev" },
    update: {},
    create: {
      id: USER_IDS.alice,
      name: "Alice Johnson",
      email: "alice@nexus.dev",
      emailVerified: true,
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@nexus.dev" },
    update: {},
    create: {
      id: USER_IDS.bob,
      name: "Bob Smith",
      email: "bob@nexus.dev",
      emailVerified: true,
    },
  });

  const charlie = await prisma.user.upsert({
    where: { email: "charlie@nexus.dev" },
    update: {},
    create: {
      id: USER_IDS.charlie,
      name: "Charlie Brown",
      email: "charlie@nexus.dev",
      emailVerified: true,
    },
  });

  const general = await prisma.channel.upsert({
    where: { name: "general" },
    update: {},
    create: {
      name: "general",
      description: "General discussion for the team",
      type: "PUBLIC",
      createdById: alice.id,
    },
  });

  await prisma.channelMember.upsert({
    where: { channelId_userId: { channelId: general.id, userId: alice.id } },
    update: {},
    create: { channelId: general.id, userId: alice.id, role: "OWNER" },
  });

  const random = await prisma.channel.upsert({
    where: { name: "random" },
    update: {},
    create: {
      name: "random",
      description: "Random stuff and watercooler chat",
      type: "PUBLIC",
      createdById: bob.id,
    },
  });

  await prisma.channelMember.upsert({
    where: { channelId_userId: { channelId: random.id, userId: bob.id } },
    update: {},
    create: { channelId: random.id, userId: bob.id, role: "OWNER" },
  });

  await prisma.channelMember.upsert({
    where: { channelId_userId: { channelId: random.id, userId: alice.id } },
    update: {},
    create: { channelId: random.id, userId: alice.id, role: "MEMBER" },
  });

  const dev = await prisma.channel.upsert({
    where: { name: "dev" },
    update: {},
    create: {
      name: "dev",
      description: "Dev team discussion",
      type: "PRIVATE",
      createdById: bob.id,
    },
  });

  await prisma.channelMember.upsert({
    where: { channelId_userId: { channelId: dev.id, userId: bob.id } },
    update: {},
    create: { channelId: dev.id, userId: bob.id, role: "OWNER" },
  });

  await prisma.channelMember.upsert({
    where: { channelId_userId: { channelId: dev.id, userId: alice.id } },
    update: {},
    create: { channelId: dev.id, userId: alice.id, role: "MEMBER" },
  });

  // Friend connection between Alice and Bob
  await prisma.friend.upsert({
    where: { userId_friendId: { userId: alice.id, friendId: bob.id } },
    update: {},
    create: { userId: alice.id, friendId: bob.id, status: "ACCEPTED" },
  });

  // Bob friend request to Charlie (PENDING)
  await prisma.friend.upsert({
    where: { userId_friendId: { userId: bob.id, friendId: charlie.id } },
    update: {},
    create: { userId: bob.id, friendId: charlie.id, status: "PENDING" },
  });

  // Charlie friend request to Alice (PENDING)
  await prisma.friend.upsert({
    where: { userId_friendId: { userId: charlie.id, friendId: alice.id } },
    update: {},
    create: { userId: charlie.id, friendId: alice.id, status: "PENDING" },
  });

  // DM conversation between Alice and Bob
  const existingDm = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: alice.id } } },
        { participants: { some: { userId: bob.id } } },
      ],
    },
  });

  if (!existingDm) {
    await prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId: alice.id },
            { userId: bob.id },
          ],
        },
        messages: {
          create: [
            { content: "Hey Bob, how's it going?", senderId: alice.id },
            { content: "Doing great! Ready for the sprint.", senderId: bob.id },
          ],
        },
      },
    });
  }

  // Channel messages (only if none exist)
  const messageCount = await prisma.message.count({ where: { channelId: general.id } });
  if (messageCount === 0) {
    await prisma.message.createMany({
      data: [
        { content: "Welcome to #general everyone!", channelId: general.id, senderId: alice.id },
        { content: "Thanks Alice! Excited to be here.", channelId: general.id, senderId: bob.id },
        { content: "Hey everyone! 👋", channelId: random.id, senderId: alice.id },
        { content: "What's up?", channelId: random.id, senderId: charlie.id },
        { content: "Working on the new feature", channelId: dev.id, senderId: bob.id },
      ],
    });
  }

  // Invite Carol to #dev
  const existingInvite = await prisma.channelInvite.findFirst({
    where: { channelId: dev.id, invitedUserId: charlie.id },
  });
  if (!existingInvite) {
    await prisma.channelInvite.create({
      data: { channelId: dev.id, invitedUserId: charlie.id, invitedByUserId: bob.id, status: "PENDING" },
    });
  }

  // Notifications (only if none exist)
  const notificationCount = await prisma.notification.count();
  if (notificationCount === 0) {
    await prisma.notification.createMany({
      data: [
        { userId: charlie.id, type: "CHANNEL_INVITE", title: "You've been invited to #dev", body: "Bob invited you to join #dev", link: "/channels/invites/pending" },
        { userId: alice.id, type: "SYSTEM", title: "Welcome to Nexus!", body: "Your workspace is ready to go." },
        { userId: bob.id, type: "SYSTEM", title: "Welcome to Nexus!", body: "Your workspace is ready to go." },
        { userId: charlie.id, type: "SYSTEM", title: "Welcome to Nexus!", body: "Your workspace is ready to go." },
      ],
    });
  }

  console.log("Seed complete");
  console.log(`  Users: ${alice.name}, ${bob.name}, ${charlie.name}`);
  console.log(`  Channels: #${general.name}, #${random.name}, #${dev.name}`);
  console.log(`  DM conversation: Alice <-> Bob`);
  console.log(`  Friends: Alice <-> Bob (accepted), Bob -> Charlie (pending), Charlie -> Alice (pending)`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
