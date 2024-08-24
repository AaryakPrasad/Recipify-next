"use client";

import { useState } from 'react'

export default function Sidebar() {
    const [chats] = useState(['Previous Chat 1', 'Previous Chat 2', 'Previous Chat 2', 'Previous Chat 1', 'Previous Chat 2', 'Previous Chat 2'])

    return (
        <aside className="w-64 bg-brown-900 p-4">
            <button className="w-full py-2 px-4 bg-brown-700 rounded-md mb-4">
                🖊 New chat
            </button>
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search"
                    className="w-full py-2 px-4 bg-brown-700 rounded-md"
                />
                {/* Search icon */}
            </div>
            <nav className="mt-4">
                <ul>
                    {chats.map((chat, index) => (
                        <li key={index} className="py-2 px-4 hover:bg-brown-700 rounded-md cursor-pointer">
                            {chat}
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    )
}