import React, { useState, useEffect } from 'react';
import { Menu, X, BookOpen, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('Home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      // Section highlighting logic
      const sectionOffsets = navItems.map(item => {
        const section = document.querySelector(item.href);
        if (section) {
          const rect = (section as HTMLElement).getBoundingClientRect();
          return { name: item.name, offset: rect.top };
        }
        return { name: item.name, offset: Infinity };
      });
      // Find the section closest to the top (but not above -60px)
      const visibleSection = sectionOffsets.reduce((prev, curr) => {
        if (curr.offset < 60 && curr.offset > -400) {
          return curr;
        }
        return prev;
      }, { name: 'Home', offset: Infinity });
      if (visibleSection.name !== activeSection && visibleSection.offset !== Infinity) {
        setActiveSection(visibleSection.name);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection]);

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'Features', href: '#features' },
    { name: 'About', href: '#about' },
    { name: 'Reviews', href: '#reviews' },
    { name: 'Contact', href: '#contact' },
  ];

  const navigate = useNavigate();
  const handleNavClick = (item: { name: string; href: string }) => {
    setActiveSection(item.name);
    const section = document.querySelector(item.href);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };
  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <BookOpen className="h-8 w-8 text-purple-600" />
              <Sparkles className="h-4 w-4 text-teal-500 absolute -top-1 -right-1" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-teal-500 bg-clip-text text-transparent">
              ExamWizards
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={e => {
                  e.preventDefault();
                  handleNavClick(item);
                }}
                className={`transition-colors duration-200 font-medium px-2 py-1 rounded-md ${
                  activeSection === item.name
                    ? 'bg-gradient-to-r from-purple-500 to-teal-500 text-white shadow'
                    : 'text-gray-700 hover:text-purple-600'
                }`}
              >
                {item.name}
              </a>
            ))}
            <button
              onClick={() => navigate('/auth')}
              className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium"
            >
              Login
            </button>
            <button 
            onClick={() => navigate('/auth')}
            className="bg-gradient-to-r from-purple-600 to-teal-500 text-white px-6 py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium">
              Sign Up
            </button>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4 space-y-4">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={e => {
                  e.preventDefault();
                  handleNavClick(item);
                }}
                className={`block transition-colors duration-200 font-medium px-2 py-1 rounded-md ${
                  activeSection === item.name
                    ? 'bg-gradient-to-r from-purple-500 to-teal-500 text-white shadow'
                    : 'text-gray-700 hover:text-purple-600'
                }`}
              >
                {item.name}
              </a>
            ))}
            <button
              onClick={() => {
                navigate('/auth');
                setIsMenuOpen(false);
              }}
              className="block text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium"
            >
              Login
            </button>
            <button 
              onClick={() => {
                navigate('/auth');
                setIsMenuOpen(false);
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-teal-500 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-200 font-medium"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;