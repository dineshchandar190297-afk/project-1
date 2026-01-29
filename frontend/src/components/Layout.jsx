import Link from 'next/link';
import { useRouter } from 'next/router';
import {
    LayoutDashboard,
    Upload,
    BarChart3,
    Search,
    User as UserIcon,
    LogOut,
    History
} from 'lucide-react';

const SidebarLink = ({ href, icon: Icon, label, active }) => (
    <Link href={href}>
        <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${active ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'hover:bg-white/5 text-slate-400'
            }`}>
            <Icon size={20} />
            <span className="font-medium">{label}</span>
        </div>
    </Link>
);

export default function Layout({ children, user }) {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    const menuItems = [
        { href: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['analyst'] },
        { href: '/upload', icon: Upload, label: 'Datasets', roles: ['analyst'] },
        { href: '/train', icon: BarChart3, label: 'ML Training', roles: ['analyst'] },
        { href: '/predict', icon: Search, label: 'Influence Prediction', roles: ['analyst', 'viewer'] },
        { href: '/history', icon: History, label: 'History', roles: ['analyst', 'viewer'] },
        { href: '/profile', icon: UserIcon, label: 'My Profile', roles: ['analyst', 'viewer'] },
    ];


    return (
        <div className="flex min-h-screen bg-[#0f172a]">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 p-6 space-y-8 fixed h-full bg-[#0f172a]">
                <div className="flex items-center space-x-3 px-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg" />
                    <h1 className="text-lg font-bold tracking-tight">INFLUENCE.AI</h1>
                </div>

                <nav className="space-y-2">
                    {menuItems.map((item) => (
                        (item.roles.includes(user?.role)) && (
                            <SidebarLink
                                key={item.href}
                                href={item.href}
                                icon={item.icon}
                                label={item.label}
                                active={router.pathname === item.href}
                            />
                        )
                    ))}
                </nav>

                <div className="absolute bottom-8 left-6 right-6">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-accent/10 hover:text-accent transition-all text-slate-400"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-2xl font-bold">{
                            menuItems.find(m => m.href === router.pathname)?.label || 'Social Network Influence Prediction System'
                        }</h2>
                        <p className="text-slate-400">Welcome back, {user?.username}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <p className="font-semibold">{user?.username}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
                            <UserIcon size={20} />
                        </div>
                    </div>
                </header>
                {children}
            </main>
        </div>
    );
}
