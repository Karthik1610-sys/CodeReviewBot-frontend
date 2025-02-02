import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/app/auth.config';

export async function GET(
  request: NextRequest,
  { params }: { params: { repoName: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const awaitedParams = await params; // Await the params object
    const repoName = awaitedParams.repoName; // Now access the property

    const response = await fetch(`http://localhost:3000/api/repositories/${repoName}`,
      {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 