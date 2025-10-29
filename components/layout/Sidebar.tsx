
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { NAV_LINKS } from '../../lib/constants';
import { BookA, LogOut, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = user ? NAV_LINKS[user.role] : [];

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' },
  };
  
  const linkStyles = "flex items-center gap-3 rounded-lg px-3 py-2 text-slate-300 transition-all hover:text-white hover:bg-slate-700/50";
  const activeLinkStyles = "bg-blue-600/30 text-white border-l-4 border-blue-500";

  return (
    <>
        {/* Overlay for mobile */}
        {isOpen && (
            <div 
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black/60 z-30 lg:hidden"
            ></div>
        )}

        <motion.nav 
            variants={sidebarVariants}
            initial="closed"
            animate={isOpen ? "open" : "closed"}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed lg:relative z-40 flex h-full w-64 flex-col gap-2 border-r border-slate-800 bg-slate-900/80 backdrop-blur-lg p-4 transition-transform lg:translate-x-0`}>
            
            <div className="flex items-center justify-between lg:justify-center h-16 shrink-0">
                <a href="#" className="flex items-center gap-2 text-lg font-semibold text-white">
                    <BookA className="h-6 w-6 text-blue-500" />
                    <span>UniPortal</span>
                </a>
                <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
                    <X className="h-6 w-6" />
                </button>
            </div>
            
            <div className="flex-1 overflow-auto">
                <nav className="grid items-start gap-1 text-sm font-medium">
                    {navLinks.map((link) => (
                    <NavLink
                        key={link.name}
                        to={link.href}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) => `${linkStyles} ${isActive ? activeLinkStyles : ''}`}
                    >
                        <link.icon className="h-4 w-4" />
                        {link.name}
                    </NavLink>
                    ))}
                </nav>
            </div>
            
            <div className="mt-auto">
                 <button onClick={handleLogout} className={`${linkStyles} w-full`}>
                    <LogOut className="h-4 w-4" />
                    Logout
                </button>
            </div>
        </motion.nav>
    </>
  );
};

export default Sidebar;
