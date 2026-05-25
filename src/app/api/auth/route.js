import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { signToken, getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

// GET /api/auth -> Get current user
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  return NextResponse.json({ user }, { status: 200 });
}

// POST /api/auth -> Login or Register
export async function POST(req) {
  try {
    const body = await req.json();
    const { action, username, email, password, role } = body;
    const cookieStore = await cookies();

    if (action === 'login') {
      if (!username || !password) {
        return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
      }

      const user = await db.user.findUnique({
        where: { username }
      });

      if (!user) {
        return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 });
      }

      const token = signToken(user);
      cookieStore.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
      });

      // Exclude password
      const { password: _, ...userWithoutPassword } = user;
      return NextResponse.json({ user: userWithoutPassword }, { status: 200 });

    } else if (action === 'register') {
      if (!username || !email || !password) {
        return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
      }

      // Check if user exists
      const existingUser = await db.user.findFirst({
        where: {
          OR: [
            { username },
            { email }
          ]
        }
      });

      if (existingUser) {
        return NextResponse.json({ message: 'Username or email already exists' }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Default avatars based on username length or random
      const avatarNum = Math.floor(Math.random() * 5) + 1;
      const profileImage = `/avatars/avatar_${avatarNum}.png`;

      const newUser = await db.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          role: role || 'USER',
          profileImage,
          name: username
        }
      });

      const token = signToken(newUser);
      cookieStore.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
      });

      const { password: _, ...userWithoutPassword } = newUser;
      return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  } catch (e) {
    console.error('Auth API Error:', e);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/auth -> Logout
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
    return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
  } catch (e) {
    console.error('Logout error:', e);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
