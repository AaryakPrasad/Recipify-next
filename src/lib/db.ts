import { db } from '../firebase/clientApp';
import { collection, addDoc, updateDoc, getDoc, doc, query, where, orderBy, getDocs, Timestamp, DocumentReference } from 'firebase/firestore';

export type Message = {
    content: string;
    timestamp: string;
    isUser: boolean; // true for user messages, false for AI responses
};

export type Chat = {
    userId: string;
    messages: Message[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
};

export const createNewChat = async (userId: string): Promise<Chat & { id: string }> => {
    try {
        const newChat: Chat = {
            userId,
            messages: [],
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };
        const docRef = await addDoc(collection(db, 'chats'), newChat);
        return { id: docRef.id, ...newChat };
    } catch (error) {
        console.error('Error creating new chat:', error);
        throw error;
    }
};
export const addChatMessage = async (chatId: string, content: string, isUser: boolean) => {
    try {
        const chatRef = doc(db, 'chats', chatId);
        const chatDoc = await getDoc(chatRef);

        if (chatDoc.exists()) {
            const chatData = chatDoc.data() as Chat;
            const newMessage: Message = {
                content,
                timestamp: Timestamp.now().toDate().toDateString(),
                isUser,
            };

            await updateDoc(chatRef, {
                messages: [...chatData.messages, newMessage],
                updatedAt: Timestamp.now(),
            });
        } else {
            throw new Error('Chat does not exist');
        }
    } catch (error) {
        console.error('Error adding message to chat:', error);
        throw error;
    }
};

export const getChatHistory = async (userId: string): Promise<Chat[]> => {
    try {
        const q = query(
            collection(db, 'chats'),
            where('userId', '==', userId),
            orderBy('updatedAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Chat & { id: string }));
    } catch (error) {
        console.error('Error getting chat history:', error);
        throw error;
    }
};

export const getChatById = async (chatId: string): Promise<Chat | null> => {
    try {
        const chatRef = doc(db, 'chats', chatId);
        const chatDoc = await getDoc(chatRef);

        if (chatDoc.exists()) {
            return { id: chatDoc.id, ...chatDoc.data() } as Chat & { id: string };
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error getting chat by ID:', error);
        throw error;
    }
};