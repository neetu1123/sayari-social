import jwt from 'jsonwebtoken';
import { db } from './db';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'sayari_panel_secret_key_2026_xyz';

export function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;

    const decoded = await verifyToken(token);
    if (!decoded) return null;

    const user = await db.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        name: true,
        bio: true,
        profileImage: true,
        coverImage: true,
      }
    });
    return user;
  } catch (e) {
    console.error('Error getting current user:', e);
    return null;
  }
}
