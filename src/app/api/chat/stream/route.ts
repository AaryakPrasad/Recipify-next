import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { addChatMessage, getChatById, createNewChat } from '@/lib/db';
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
        const { content, chatId } = await request.json();

        let currentChatId = chatId;

        // If no chatId is provided or the chat doesn't exist, create a new one
        if (!currentChatId) {
            const newChat = await createNewChat(uid);
            currentChatId = newChat.id;
        } else {
            // Check if the chat exists and belongs to the user
            const existingChat = await getChatById(currentChatId);
            if (!existingChat || existingChat.userId !== uid) {
                return new Response('Unauthorized or chat not found', { status: 404 });
            }
        }

        // Save user message
        await addChatMessage(currentChatId, content, true);

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Create a new ReadableStream
        const stream = new ReadableStream({
            async start(controller) {
                const generateContent = async () => {
                    const result = await model.generateContentStream(content);
                    let fullResponse = '';

                    for await (const chunk of result.stream) {
                        const chunkText = chunk.text();
                        fullResponse += chunkText;
                        controller.enqueue(chunkText);
                    }

                    // Save the full AI response
                    await addChatMessage(currentChatId, fullResponse, false);
                    controller.close();
                };

                generateContent().catch((error) => {
                    console.error('Error generating content:', error);
                    controller.error(error);
                });
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'X-Chat-ID': currentChatId, // Include the chat ID in the response headers
            },
        });
    } catch (error) {
        console.error('Error in chat processing:', error);
        return new Response('Unauthorized', { status: 401 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const uid = await verifyToken(request);
        const chatId = request.nextUrl.searchParams.get('chatId');

        if (!chatId) {
            return new Response('Chat ID is required', { status: 400 });
        }

        const chat = await getChatById(chatId);
        if (!chat || chat.userId !== uid) {
            return new Response('Unauthorized or chat not found', { status: 404 });
        }

        return new Response(JSON.stringify(chat), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching chat:', error);
        return new Response('Unauthorized', { status: 401 });
    }
}