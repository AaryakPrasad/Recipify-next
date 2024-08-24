import { NextRequest } from "next/server";
import { getAuth } from 'firebase-admin/auth';

export async function verifyToken(request: NextRequest): Promise<string> {
    const token = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
        throw new Error('No token provided');
    }
    try {
        const decodedToken = await getAuth().verifyIdToken(token);
        return decodedToken.uid;
    } catch (error) {
        console.error('Error verifying token:', error);
        throw new Error('Invalid token');
    }
}