import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/session';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const sessionToken = await createSession();

    const cookieStore = await cookies();
    cookieStore.set('session', sessionToken, {
      httpOnly: true,
      secure: false, // Changed to false for local development
      sameSite: 'lax', // Changed from strict to lax for better compatibility
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Session created successfully',
        sessionId: sessionToken,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create session',
        error: String(error),
      },
      { status: 500 }
    );
  }
}