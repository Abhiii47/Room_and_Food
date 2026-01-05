import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, LogOut, User } from 'lucide-react';
import AuthContext from '../context/AuthContext';

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
    const [theme, setTheme] = useState('light');
    const { user, logout } = useContext(AuthContext);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    useEffect(() => {
        // Init theme from localStorage or system pref
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    if (isAuthPage) return null;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Link className="flex items-center gap-2 font-bold text-xl tracking-tight" to="/">
                        <span>Room&Food</span>
                    </Link>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link to="/explore" className="transition-colors hover:text-foreground/80 text-foreground/60">Explore</Link>
                    <Link to="/about" className="transition-colors hover:text-foreground/80 text-foreground/60">About</Link>
                    {user && user.role === 'admin' && (
                        <Link to="/dashboard/admin" className="transition-colors hover:text-foreground/80 text-foreground/60 text-primary font-semibold">Admin Panel</Link>
                    )}
                    {user && user.role === 'provider' && (
                        <>
                            <Link to="/dashboard/provider" className="transition-colors hover:text-foreground/80 text-foreground/60">My Listings</Link>
                            <Link to="/dashboard/booking-requests" className="transition-colors hover:text-foreground/80 text-foreground/60">Booking Requests</Link>
                        </>
                    )}
                    {user && user.role === 'user' && (
                        <Link to="/bookings" className="transition-colors hover:text-foreground/80 text-foreground/60">My Bookings</Link>
                    )}
                    <Link to="/explore" className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-1">
                        Listings
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    {/* Theme Toggle */}
                    <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-accent transition-colors">
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>

                    {user ? (
                        <nav className="hidden md:flex items-center gap-3">
                            <span className="text-sm text-muted-foreground flex items-center gap-2">
                                <User size={16} />
                                {user.name || user.email}
                            </span>
                            <button onClick={handleLogout} className="btn btn-sm btn-outline flex items-center gap-2">
                                <LogOut size={16} />
                                Logout
                            </button>
                        </nav>
                    ) : (
                        <nav className="hidden md:flex items-center gap-2">
                            <Link to="/login" className="btn btn-sm btn-outline">Sign In</Link>
                            <Link to="/register" className="btn btn-sm btn-primary">Get Started</Link>
                        </nav>
                    )}
                    <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden border-t p-4 bg-background">
                    <nav className="flex flex-col gap-4">
                        <Link to="/" className="text-sm font-medium" onClick={() => setIsOpen(false)}>Explore</Link>
                        <Link to="/about" className="text-sm font-medium" onClick={() => setIsOpen(false)}>About</Link>
                        {user && user.role === 'admin' && (
                            <Link to="/dashboard/admin" className="text-sm font-medium text-primary font-semibold" onClick={() => setIsOpen(false)}>Admin Panel</Link>
                        )}
                        {user && user.role === 'provider' && (
                            <>
                                <Link to="/dashboard/provider" className="text-sm font-medium" onClick={() => setIsOpen(false)}>My Listings</Link>
                                <Link to="/dashboard/booking-requests" className="text-sm font-medium" onClick={() => setIsOpen(false)}>Booking Requests</Link>
                            </>
                        )}
                        {user && user.role === 'user' && (
                            <Link to="/bookings" className="text-sm font-medium" onClick={() => setIsOpen(false)}>My Bookings</Link>
                        )}
                        <div className="flex gap-2 mt-2">
                            {user ? (
                                <>
                                    <span className="text-sm text-muted-foreground flex-1 flex items-center gap-2">
                                        <User size={16} />
                                        {user.name || user.email}
                                    </span>
                                    <button onClick={() => { handleLogout(); setIsOpen(false); }} className="flex-1 btn btn-sm btn-outline flex items-center justify-center gap-2">
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="flex-1 btn btn-sm btn-outline" onClick={() => setIsOpen(false)}>Sign In</Link>
                                    <Link to="/register" className="flex-1 btn btn-sm btn-primary" onClick={() => setIsOpen(false)}>Get Started</Link>
                                </>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;
