'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import ChatArea from '@/components/ChatArea';
import InputArea from '@/components/InputArea';
import { Message } from '@/lib/db';
import { fetchWithToken } from '@/contexts/AuthContext';

export default function Home() {
    const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);

    useEffect(() => {
        createNewChat();
    }, []);

    const createNewChat = async () => {
        const response = await fetchWithToken('/api/chats', {
            method: 'POST',
        });
        if (response.ok) {
            const { chatId } = await response.json();
            setCurrentChatId(chatId);
        }
    };

    const handleNewMessage = (content: string, isUser: boolean) => {
        if (isUser) {
            setStreamingMessage(null);
        } else {
            setStreamingMessage({
                content,
                timestamp: new Date().toDateString(),
                isUser: false,
            });
        }
    };

    return (
        <main className="flex h-screen bg-brown-900 text-white">
            <Sidebar />
            <div className="flex flex-col flex-grow">
                <Header />
                <ChatArea streamingMessage={streamingMessage} currentChatId={currentChatId} />
                <InputArea onNewMessage={handleNewMessage} />
            </div>
        </main>
    );
}