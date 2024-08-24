import { useState, useEffect } from 'react';
import { fetchWithToken, useAuth } from '../contexts/AuthContext';

export default function InputArea({ onNewMessage }: { onNewMessage: (message: string, isUser: boolean) => void }) {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        // Reset currentChatId when component mounts or user changes
        setCurrentChatId(null);
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !input.trim() || isLoading) return;

        setIsLoading(true);
        onNewMessage(input, true); // Add user message to chat
        setInput('');

        try {
            // Try streaming first
            const streamResponse = await fetchWithToken('/api/chat/stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: input, chatId: currentChatId }),
            });

            if (streamResponse.ok && streamResponse.body) {
                // Update currentChatId if it's a new chat
                const newChatId = streamResponse.headers.get('X-Chat-ID');
                if (newChatId) {
                    setCurrentChatId(newChatId);
                }

                // Handle streaming response
                const reader = streamResponse.body.getReader();
                const decoder = new TextDecoder();
                let aiResponse = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value);
                    aiResponse += chunk;
                    onNewMessage(aiResponse, false); // Update AI response in chat
                }
            } else {
                // Fallback to non-streaming version
                const response = await fetchWithToken('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: input, chatId: currentChatId }),
                });

                if (response.ok) {
                    const { aiResponse } = await response.json();
                    onNewMessage(aiResponse, false);

                    // Update currentChatId if it's a new chat
                    const newChatId = response.headers.get('X-Chat-ID');
                    if (newChatId) {
                        setCurrentChatId(newChatId);
                    }
                } else {
                    throw new Error('Failed to get response from AI');
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
            // Handle error (e.g., show error message to user)
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-brown-900">
            <div className="flex items-center bg-brown-900 rounded-md">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Send a message"
                    className="flex-grow px-4 py-2 bg-transparent outline-none"
                />
                <button type="submit" className="p-2 bg-brown-700 rounded-md mr-2">
                    Send
                </button>
                <button type="button" className="p-2 bg-brown-700 rounded-md mr-2">
                    Upload images of ingredients
                </button>
            </div>
            <p className="text-center text-sm mt-2 text-gray-400">
                Recipify may produce inaccurate information about food, recipes or ingredients.
            </p>
        </form>
    );
}