import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/blogs -> Fetch blog posts
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status') || 'PUBLISHED'; // default only published
    const search = searchParams.get('search');
    const tag = searchParams.get('tag');

    const user = await getCurrentUser();

    const where = {};
    
    // Normal users can only see PUBLISHED blogs. 
    // Creators can see their own DRAFT blogs too.
    if (userId) {
      where.userId = userId;
      if (user && user.id === userId) {
        if (status && status !== 'ALL') {
          where.status = status;
        }
      } else {
        where.status = 'PUBLISHED';
      }
    } else {
      where.status = 'PUBLISHED';
    }

    if (tag) {
      where.tags = { contains: tag };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { summary: { contains: search } }
      ];
    }

    const blogs = await db.blog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            profileImage: true
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
            likes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ blogs }, { status: 200 });
  } catch (e) {
    console.error('Blogs GET Error:', e);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/blogs -> Create new blog
export async function POST(req) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    if (user.role !== 'CREATOR' && user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Only creators and admins can publish blogs.' }, { status: 403 });
    }

    const body = await req.json();
    const { title, content, summary, tags, thumbnail, status } = body;

    if (!title || !content) {
      return NextResponse.json({ message: 'Title and content are required.' }, { status: 400 });
    }

    const newBlog = await db.blog.create({
      data: {
        userId: user.id,
        title,
        content,
        summary: summary || content.substring(0, 150) + '...',
        tags: tags || '',
        thumbnail: thumbnail || null,
        status: status || 'PUBLISHED'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            profileImage: true
          }
        }
      }
    });

    return NextResponse.json({ blog: newBlog }, { status: 201 });
  } catch (e) {
    console.error('Blogs POST Error:', e);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
