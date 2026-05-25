import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/admin -> Fetch dashboard statistics and moderation lists
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized. Admin access only.' }, { status: 403 });
    }

    // Run counts
    const totalUsers = await db.user.count();
    const totalPosts = await db.shayariPost.count();
    const totalBlogs = await db.blog.count();
    const totalComments = await db.comment.count();
    const totalLikes = await db.like.count();

    // Fetch lists
    const usersList = await db.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        name: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            blogs: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const postsList = await db.shayariPost.findMany({
      include: {
        user: {
          select: {
            username: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const blogsList = await db.blog.findMany({
      include: {
        user: {
          select: {
            username: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        totalPosts,
        totalBlogs,
        totalComments,
        totalLikes
      },
      users: usersList,
      posts: postsList,
      blogs: blogsList
    }, { status: 200 });

  } catch (e) {
    console.error('Admin GET error:', e);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/admin -> Process moderator action
export async function POST(req) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized. Admin access only.' }, { status: 403 });
    }

    const { action, targetId, role } = await req.json();

    if (action === 'delete_post') {
      await db.shayariPost.delete({ where: { id: targetId } });
      return NextResponse.json({ message: 'Shayari post deleted successfully.' }, { status: 200 });
    }

    if (action === 'delete_blog') {
      await db.blog.delete({ where: { id: targetId } });
      return NextResponse.json({ message: 'Blog deleted successfully.' }, { status: 200 });
    }

    if (action === 'update_role') {
      if (!role) {
        return NextResponse.json({ message: 'Role is required' }, { status: 400 });
      }
      
      const updatedUser = await db.user.update({
        where: { id: targetId },
        data: { role }
      });

      return NextResponse.json({ 
        message: `User role updated to ${role} successfully.`,
        user: { id: updatedUser.id, username: updatedUser.username, role: updatedUser.role }
      }, { status: 200 });
    }

    if (action === 'delete_user') {
      if (targetId === user.id) {
        return NextResponse.json({ message: 'You cannot delete yourself!' }, { status: 400 });
      }
      await db.user.delete({ where: { id: targetId } });
      return NextResponse.json({ message: 'User account and all data deleted.' }, { status: 200 });
    }

    return NextResponse.json({ message: 'Invalid admin action' }, { status: 400 });
  } catch (e) {
    console.error('Admin POST error:', e);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
