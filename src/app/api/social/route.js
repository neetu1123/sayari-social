import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/social -> Get comments for post or blog
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId');
    const blogId = searchParams.get('blogId');

    if (!postId && !blogId) {
      return NextResponse.json({ message: 'Missing postId or blogId' }, { status: 400 });
    }

    const comments = await db.comment.findMany({
      where: {
        OR: [
          postId ? { shayariPostId: postId } : null,
          blogId ? { blogId: blogId } : null
        ].filter(Boolean)
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
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ comments }, { status: 200 });
  } catch (e) {
    console.error('Social GET error:', e);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/social -> Handles likes, follows, comments, and saved posts
export async function POST(req) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await req.json();
    const { action, postId, blogId, text, followingId } = body;

    // 1. LIKE TOGGLE
    if (action === 'like') {
      if (!postId && !blogId) {
        return NextResponse.json({ message: 'postId or blogId required' }, { status: 400 });
      }

      const existingLike = await db.like.findFirst({
        where: {
          userId: user.id,
          shayariPostId: postId || null,
          blogId: blogId || null
        }
      });

      if (existingLike) {
        await db.like.delete({
          where: { id: existingLike.id }
        });
        return NextResponse.json({ liked: false, message: 'Unliked successfully' }, { status: 200 });
      } else {
        await db.like.create({
          data: {
            userId: user.id,
            shayariPostId: postId || null,
            blogId: blogId || null
          }
        });

        // Create notification for post owner if not self
        const ownerId = postId 
          ? (await db.shayariPost.findUnique({ where: { id: postId } }))?.userId
          : (await db.blog.findUnique({ where: { id: blogId } }))?.userId;

        if (ownerId && ownerId !== user.id) {
          await db.notification.create({
            data: {
              userId: ownerId,
              type: 'LIKE',
              content: `${user.name || user.username} liked your ${postId ? 'shayari' : 'blog'}.`
            }
          });
        }

        return NextResponse.json({ liked: true, message: 'Liked successfully' }, { status: 200 });
      }
    }

    // 2. CREATE COMMENT
    if (action === 'comment') {
      if (!text) {
        return NextResponse.json({ message: 'Comment text is required' }, { status: 400 });
      }
      if (!postId && !blogId) {
        return NextResponse.json({ message: 'postId or blogId required' }, { status: 400 });
      }

      const newComment = await db.comment.create({
        data: {
          userId: user.id,
          shayariPostId: postId || null,
          blogId: blogId || null,
          text
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

      // Notification
      const ownerId = postId 
        ? (await db.shayariPost.findUnique({ where: { id: postId } }))?.userId
        : (await db.blog.findUnique({ where: { id: blogId } }))?.userId;

      if (ownerId && ownerId !== user.id) {
        await db.notification.create({
          data: {
            userId: ownerId,
            type: 'COMMENT',
            content: `${user.name || user.username} commented on your post: "${text.substring(0, 30)}..."`
          }
        });
      }

      return NextResponse.json({ comment: newComment }, { status: 201 });
    }

    // 3. FOLLOW TOGGLE
    if (action === 'follow') {
      if (!followingId) {
        return NextResponse.json({ message: 'followingId is required' }, { status: 400 });
      }
      if (followingId === user.id) {
        return NextResponse.json({ message: 'You cannot follow yourself' }, { status: 400 });
      }

      const existingFollow = await db.follow.findFirst({
        where: {
          followerId: user.id,
          followingId
        }
      });

      if (existingFollow) {
        await db.follow.delete({
          where: { id: existingFollow.id }
        });
        return NextResponse.json({ followed: false, message: 'Unfollowed successfully' }, { status: 200 });
      } else {
        await db.follow.create({
          data: {
            followerId: user.id,
            followingId
          }
        });

        // Notification
        await db.notification.create({
          data: {
            userId: followingId,
            type: 'FOLLOW',
            content: `${user.name || user.username} started following you.`
          }
        });

        return NextResponse.json({ followed: true, message: 'Followed successfully' }, { status: 200 });
      }
    }

    // 4. SAVE TOGGLE
    if (action === 'save') {
      if (!postId && !blogId) {
        return NextResponse.json({ message: 'postId or blogId required' }, { status: 400 });
      }

      const existingSave = await db.savedPost.findFirst({
        where: {
          userId: user.id,
          shayariPostId: postId || null,
          blogId: blogId || null
        }
      });

      if (existingSave) {
        await db.savedPost.delete({
          where: { id: existingSave.id }
        });
        return NextResponse.json({ saved: false, message: 'Removed from bookmarks' }, { status: 200 });
      } else {
        await db.savedPost.create({
          data: {
            userId: user.id,
            shayariPostId: postId || null,
            blogId: blogId || null
          }
        });
        return NextResponse.json({ saved: true, message: 'Saved to bookmarks' }, { status: 200 });
      }
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  } catch (e) {
    console.error('Social POST error:', e);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
