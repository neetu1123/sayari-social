import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/chat -> Retrieve messages between user and recipient
export async function GET(req) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const recipientId = searchParams.get('recipientId');

    // If recipientId is missing, return list of recent chats (contacts)
    if (!recipientId) {
      // Find all distinct users that current user has exchanged messages with
      const sentTo = await db.message.findMany({
        where: { senderId: user.id },
        select: { receiverId: true }
      });
      const receivedFrom = await db.message.findMany({
        where: { receiverId: user.id },
        select: { senderId: true }
      });

      const contactIds = Array.from(new Set([
        ...sentTo.map(m => m.receiverId),
        ...receivedFrom.map(m => m.senderId)
      ])).filter(id => id !== user.id);

      const contacts = await db.user.findMany({
        where: { id: { in: contactIds } },
        select: { id: true, username: true, name: true, profileImage: true }
      });

      // Also append default featured users so they are easy to start chatting with!
      const featured = await db.user.findMany({
        where: { 
          id: { not: user.id }
        },
        select: { id: true, username: true, name: true, profileImage: true },
        take: 5
      });

      // Merge and unique
      const allContacts = [...contacts];
      featured.forEach(f => {
        if (!allContacts.some(c => c.id === f.id)) {
          allContacts.push(f);
        }
      });

      return NextResponse.json({ contacts: allContacts }, { status: 200 });
    }

    const messages = await db.message.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: recipientId },
          { senderId: recipientId, receiverId: user.id }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ messages }, { status: 200 });
  } catch (e) {
    console.error('Chat GET error:', e);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/chat -> Send message
export async function POST(req) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const { receiverId, content } = await req.json();

    if (!receiverId || !content) {
      return NextResponse.json({ message: 'Receiver and content are required.' }, { status: 400 });
    }

    const newMessage = await db.message.create({
      data: {
        senderId: user.id,
        receiverId,
        content
      }
    });

    // Create notification
    await db.notification.create({
      data: {
        userId: receiverId,
        type: 'MESSAGE',
        content: `New message from ${user.name || user.username}: "${content.substring(0, 30)}..."`
      }
    });

    return NextResponse.json({ message: newMessage }, { status: 201 });
  } catch (e) {
    console.error('Chat POST error:', e);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
