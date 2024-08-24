import Image from 'next/image'
import chef_img from '@/public/icons/chef.png'
import { useEffect, useState, useRef } from 'react';
import { fetchWithToken, useAuth } from '../contexts/AuthContext';
import { Chat, Message } from '../lib/db';

export default function ChatArea({ streamingMessage, currentChatId }: { streamingMessage: Message | null, currentChatId: string | null }) {
    const { user } = useAuth();
    const [chat, setChat] = useState<Chat | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user && currentChatId) {
            fetchChat(currentChatId);
        }
    }, [user, currentChatId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat, streamingMessage]);

    const fetchChat = async (chatId: string) => {
        try {
            const response = await fetchWithToken(`/api/chats/${chatId}`);
            if (response.ok) {
                const chatData = await response.json();
                setChat(chatData);
            } else {
                console.error('Failed to fetch chat');
            }
        } catch (error) {
            console.error('Error fetching chat:', error);
        }
    };

    const renderMessages = () => {
        const messages = chat ? [...chat.messages] : [];
        if (streamingMessage) {
            messages.push(streamingMessage);
        }
        return messages.map((message, index) => (
            <MessageItem key={index} message={message} isStreaming={message === streamingMessage} />
        ));
    };

    return (
        <div className="flex-grow overflow-y-auto p-4">
            {!chat && !streamingMessage ? (
                <div className="flex flex-col items-center justify-center h-full">
                    <Image src={chef_img} alt="Chef Icon" width={200} height={200} />
                    <p className="text-center mt-4">
                        Your mindful AI companion for recipe ideas,<br />
                        when you can&apos;t think of any!
                    </p>
                </div>
            ) : (
                <>
                    {renderMessages()}
                    <div ref={chatEndRef} />
                </>
            )}
        </div>
    );
}

function MessageItem({ message, isStreaming = false }: { message: Message, isStreaming?: boolean }) {
    return (
        <div className={`mb-4 ${message.isUser ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-2 rounded-lg ${message.isUser ? 'bg-blue-500' : 'bg-gray-500'}`}>
                <p>{message.content}</p>
                {isStreaming && <span className="animate-pulse">▋</span>}
            </div>
            <small className="block mt-1 text-gray-400">
                {message.isUser ? 'You' : 'AI'}
            </small>
        </div>
    );
}