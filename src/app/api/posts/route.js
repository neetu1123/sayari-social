import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/posts -> Fetch posts with optional filters (mood, userId, search)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const mood = searchParams.get('mood');
    const userId = searchParams.get('userId');
    const search = searchParams.get('search');

    const where = {};
    if (mood) where.mood = mood;
    if (userId) where.userId = userId;
    if (search) {
      where.OR = [
        { text: { contains: search } },
        { title: { contains: search } },
        { watermark: { contains: search } }
      ];
    }

    const posts = await db.shayariPost.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            profileImage: true,
          }
        },
        likes: {
          select: {
            userId: true
          }
        },
        _count: {
          select: {
            comments: true,
            likes: true,
            savedPosts: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ posts }, { status: 200 });
  } catch (e) {
    console.error('Posts GET Error:', e);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/posts -> Create new Shayari post
export async function POST(req) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await req.json();
    const { text, title, mood, watermark, audioUrl, imageUrl } = body;

    if (!text || !mood) {
      return NextResponse.json({ message: 'Poetry text and mood are required.' }, { status: 400 });
    }

    const newPost = await db.shayariPost.create({
      data: {
        userId: user.id,
        text,
        title: title || '',
        mood: mood.toLowerCase(),
        watermark: watermark || user.name || user.username,
        audioUrl: audioUrl || null,
        imageUrl: imageUrl || null
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            profileImage: true
          }
        },
        likes: true,
        _count: {
          select: {
            comments: true,
            likes: true
          }
        }
      }
    });

    return NextResponse.json({ post: newPost }, { status: 201 });
  } catch (e) {
    console.error('Posts POST Error:', e);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
