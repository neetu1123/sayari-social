const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // Clear DB
  await prisma.comment.deleteMany({});
  await prisma.like.deleteMany({});
  await prisma.savedPost.deleteMany({});
  await prisma.follow.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.shayariPost.deleteMany({});
  await prisma.blog.deleteMany({});
  await prisma.user.deleteMany({});

  // Hashes
  const adminPassword = await bcrypt.hash('admin123', 10);
  const creatorPassword = await bcrypt.hash('creator123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  // Users
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@shayari.com',
      password: adminPassword,
      role: 'ADMIN',
      name: 'Super Admin',
      bio: 'Administrator and moderator of the Shayari Social platform.',
      profileImage: '/avatars/admin.png',
      coverImage: '/covers/admin_cover.png'
    }
  });

  const creator1 = await prisma.user.create({
    data: {
      username: 'mirza_ghalib',
      email: 'ghalib@shayari.com',
      password: creatorPassword,
      role: 'CREATOR',
      name: 'Mirza Ghalib',
      bio: 'Classical Urdu and Persian poet. Writing about love, pain, and philosophy.',
      profileImage: '/avatars/ghalib.png',
      coverImage: '/covers/ghalib_cover.png'
    }
  });

  const creator2 = await prisma.user.create({
    data: {
      username: 'kavita_sharma',
      email: 'kavita@shayari.com',
      password: creatorPassword,
      role: 'CREATOR',
      name: 'Kavita Sharma',
      bio: 'Modern Hindi poetess. Capturing human emotions, relationships, and motivation.',
      profileImage: '/avatars/kavita.png',
      coverImage: '/covers/kavita_cover.png'
    }
  });

  const normalUser = await prisma.user.create({
    data: {
      username: 'rahul_kumar',
      email: 'rahul@gmail.com',
      password: userPassword,
      role: 'USER',
      name: 'Rahul Kumar',
      bio: 'Just a shayari lover who loves to read and save poetry.',
      profileImage: '/avatars/rahul.png'
    }
  });

  // Shayari Posts
  const post1 = await prisma.shayariPost.create({
    data: {
      userId: creator1.id,
      title: 'Mohabbat aur Maut',
      text: 'Ishq par zor nahi hai ye woh aatish Ghalib,\nJo lagaye na lage aur bujhai na bane.',
      mood: 'love',
      watermark: 'Mirza Ghalib'
    }
  });

  const post2 = await prisma.shayariPost.create({
    data: {
      userId: creator1.id,
      title: 'Zindagi ka Dukh',
      text: 'Dil-e-nadaan tujhe hua kya hai,\nAakhir is dard ki dava kya hai?',
      mood: 'sad',
      watermark: 'Mirza Ghalib'
    }
  });

  const post3 = await prisma.shayariPost.create({
    data: {
      userId: creator2.id,
      title: 'Hausla aur Koshish',
      text: 'Khudi ko kar बुलंद itna ki har taqdeer se pehle,\nKhuda bande se khud pooche bata teri raza kya hai.',
      mood: 'motivation',
      watermark: 'Kavita Sharma'
    }
  });

  const post4 = await prisma.shayariPost.create({
    data: {
      userId: creator2.id,
      title: 'Dosti ka Nazaara',
      text: 'Milna na milna toh kismat ki baat hai,\nPar dost kehkar yaad karna toh dil ki baat hai.',
      mood: 'friendship',
      watermark: 'Kavita Sharma'
    }
  });

  const post5 = await prisma.shayariPost.create({
    data: {
      userId: creator1.id,
      title: 'Tanhayi',
      text: 'Rahiye ab aisi jagah chalkar jahan koi na ho,\nHamsukhan koi na ho aur hamzabaan koi na ho.',
      mood: 'alone',
      watermark: 'Mirza Ghalib'
    }
  });

  // Blogs
  const blog1 = await prisma.blog.create({
    data: {
      userId: creator1.id,
      title: 'The Golden Era of Urdu Poetry',
      summary: 'An exploration into the depth and richness of classical Urdu Ghazals during the Mughal era.',
      content: 'Urdu poetry, especially the ghazal, has a rich history that dates back several centuries. In this post, we look at the evolution of metaphors, from traditional love to philosophical questions about existence, fate, and the human condition. Famous poets like Mirza Ghalib, Mir Taqi Mir, and Bahadur Shah Zafar paved the way for generations to come...',
      tags: 'poetry,urdu,history,ghalib',
      status: 'PUBLISHED'
    }
  });

  const blog2 = await prisma.blog.create({
    data: {
      userId: creator2.id,
      title: 'How Poetry Helps Heal Emotional Trauma',
      summary: 'Understanding the therapeutic value of writing thoughts down in rhythmic form.',
      content: 'Writing is cathartic. When words are structured into poetry, it provides a safe container for overwhelming emotions. Psychologists have long recognized poetry therapy as a tool for self-discovery and healing. Whether you are dealing with grief, heartbreak, or anxiety, putting pen to paper (or typing it out) can bring immense clarity and relief...',
      tags: 'mentalhealth,poetry,writing,healing',
      status: 'PUBLISHED'
    }
  });

  // Comments
  await prisma.comment.create({
    data: {
      userId: normalUser.id,
      shayariPostId: post1.id,
      text: 'Subhanallah! What a classic piece.'
    }
  });

  await prisma.comment.create({
    data: {
      userId: normalUser.id,
      blogId: blog2.id,
      text: 'This is so true. Writing poetry has helped me get through tough times.'
    }
  });

  // Likes
  await prisma.like.create({
    data: {
      userId: normalUser.id,
      shayariPostId: post1.id
    }
  });

  await prisma.like.create({
    data: {
      userId: normalUser.id,
      blogId: blog2.id
    }
  });

  // Follows
  await prisma.follow.create({
    data: {
      followerId: normalUser.id,
      followingId: creator1.id
    }
  });

  // Chat message simulator seed
  await prisma.message.create({
    data: {
      senderId: normalUser.id,
      receiverId: creator1.id,
      content: 'Greetings, Mirza Ghalib! Your poetry is an absolute masterpiece.'
    }
  });

  await prisma.message.create({
    data: {
      senderId: creator1.id,
      receiverId: normalUser.id,
      content: 'Shukriya, Rahul. Your appreciation keeps the ink flowing.'
    }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
