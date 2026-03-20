import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown, Search } from 'lucide-react';
import Input from '../ui/Input';

interface HeaderProps {
    children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-lg px-4 md:px-6">
            <div className="flex items-center gap-4">
               {children}
            </div>
            
            <div className="flex-1 justify-center px-4 hidden md:flex">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        type="search"
                        placeholder="Search students, teachers, courses..."
                        className="pl-10 h-9"
                    />
                </div>
            </div>

            <div className="ml-auto flex items-center gap-4">
                <span className="text-sm text-slate-400 hidden sm:inline">{user?.role}</span>
                <div className="relative group">
                    <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900">
                        <img
                            src={user?.avatar}
                            alt="User avatar"
                            className="h-9 w-9 rounded-full border-2 border-slate-700 group-hover:border-blue-500 transition-colors"
                        />
                        <div className="hidden md:flex flex-col items-start">
                            <span className="text-sm font-medium text-slate-200">{user?.name}</span>
                            <span className="text-xs text-slate-400">{user?.email}</span>
                        </div>
                         <ChevronDown className="h-4 w-4 text-slate-400 hidden md:block" />
                    </button>
                    <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-slate-800/90 backdrop-blur-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                        <div className="py-1">
                            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 w-full text-left">
                                <LogOut className="h-4 w-4"/>
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};


export default Header;