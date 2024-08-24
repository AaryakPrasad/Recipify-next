import Image from 'next/image'
import recipify_logo from '@/public/icons/Logo.png'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function Header() {
    const { user, logout } = useAuth()
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await logout()
            router.push('/login')
        } catch (error) {
            console.error('Failed to log out', error)
        }
    }

    return (
        <header className="flex justify-between items-center p-4 bg-brown-900">
            <div className="flex items-center">
                <Image src={recipify_logo} alt="Recipify Logo" width={24} height={24} />
                <h1 className="ml-2 text-xl font-bold">Recipify</h1>
            </div>
            <div className="flex items-center space-x-4">
                <button className="p-2 rounded-full bg-brown-700">
                    {/* Moon icon */}
                </button>
                <button className="p-2 rounded-full bg-brown-700">
                    {/* Info icon */}
                </button>
                <button className="p-2 rounded-full bg-brown-700">
                    {/* Settings icon */}
                </button>
                {user && (
                    <button
                        onClick={handleLogout}
                        className="p-2 rounded-full bg-brown-700 hover:bg-brown-600"
                    >
                        Logout
                    </button>
                )}
            </div>
        </header>
    )
}