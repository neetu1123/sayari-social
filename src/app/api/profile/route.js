import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/profile -> Fetch profile details by username
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ message: 'Username is required' }, { status: 400 });
    }

    const viewer = await getCurrentUser();

    // Fetch user
    const profileUser = await db.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        role: true,
        profileImage: true,
        coverImage: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
            blogs: true
          }
        }
      }
    });

    if (!profileUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Fetch user's Shayari
    const posts = await db.shayariPost.findMany({
      where: { userId: profileUser.id },
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

    // Fetch user's blogs
    const blogs = await db.blog.findMany({
      where: { 
        userId: profileUser.id,
        status: 'PUBLISHED' // only published
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

    // If viewer is viewing their own profile, fetch saved posts
    let savedPosts = [];
    if (viewer && viewer.id === profileUser.id) {
      const saved = await db.savedPost.findMany({
        where: { userId: viewer.id },
        include: {
          shayariPost: {
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
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      // Flatten saved posts
      savedPosts = saved.map(s => s.shayariPost).filter(Boolean);
    }

    // Check if viewer follows this profile
    let isFollowing = false;
    if (viewer) {
      const followRecord = await db.follow.findFirst({
        where: {
          followerId: viewer.id,
          followingId: profileUser.id
        }
      });
      isFollowing = !!followRecord;
    }

    return NextResponse.json({
      user: profileUser,
      posts,
      blogs,
      savedPosts,
      isFollowing
    }, { status: 200 });

  } catch (e) {
    console.error('Profile GET error:', e);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
