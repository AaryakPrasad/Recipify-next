import { NextRequest, NextResponse } from 'next/server';
import { addChatMessage, getChatHistory } from '@/lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { verifyToken } from '@/lib/auth';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_APIKEY!);

// Initialize Firebase Admin SDK
if (!getApps().length) {
    initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        }),
    });
}

export async function POST(request: NextRequest) {
    try {
        const uid = await verifyToken(request);
        const { content } = await request.json();

        // Save user message
        await addChatMessage(uid, content, true);

        // Generate AI response
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(content);
        const aiResponse = result.response.text();

        // Save AI response
        await addChatMessage(uid, aiResponse, false);

        return NextResponse.json({ success: true, aiResponse });
    } catch (error) {
        console.error('Error in chat processing:', error);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const uid = await verifyToken(request);
        const chatHistory = await getChatHistory(uid);
        return NextResponse.json(chatHistory);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
}

