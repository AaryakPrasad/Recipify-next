import { NextRequest, NextResponse } from 'next/server';
import { getChatById } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { chatId: string } }) {
    try {
        const uid = await verifyToken(request);
        const chatId = params.chatId;

        const chat = await getChatById(chatId);
        if (!chat || chat.userId !== uid) {
            return new NextResponse('Unauthorized or chat not found', { status: 404 });
        }

        return NextResponse.json(chat);
    } catch (error) {
        console.error('Error fetching chat:', error);
        return new NextResponse('Unauthorized', { status: 401 });
    }
}