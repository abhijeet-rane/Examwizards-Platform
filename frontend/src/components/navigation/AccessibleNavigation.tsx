import React, { useState, useRef, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Box,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Accessibility as AccessibilityIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { colors } from '../../theme/theme';
import { AccessibilityHelper, createNavProps, handleKeyboardNavigation, trapFocus } from '../../utils/accessibility';
import { useMuiBreakpoints, prefersReducedMotion } from '../../utils/responsive';

interface NavigationItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: string[];
}

interface AccessibleNavigationProps {
  user?: {
    username: string;
    role: string;
    fullName?: string;
  };
  onLogout: () => void;
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
}

export const AccessibleNavigation: React.FC<AccessibleNavigationProps> = ({
  user,
  onLogout,
  onThemeToggle,
  isDarkMode = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const breakpoints = useMuiBreakpoints();
  const shouldReduceMotion = prefersReducedMotion();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [skipLinkFocused, setSkipLinkFocused] = useState(false);
  
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLButtonElement>(null);

  // Navigation items based on user role
  const getNavigationItems = (): NavigationItem[] => {
    const baseItems: NavigationItem[] = [
      {
        label: 'Dashboard',
        path: user?.role === 'instructor' ? '/instructor' : '/student',
        icon: <DashboardIcon />,
      },
    ];

    if (user?.role === 'instructor') {
      baseItems.push(
        {
          label: 'My Courses',
          path: '/instructor/courses',
          icon: <SchoolIcon />,
          roles: ['instructor'],
        },
        {
          label: 'Create Course',
          path: '/instructor/create-course',
          icon: <SchoolIcon />,
          roles: ['instructor'],
        },
        {
          label: 'Reviews',
          path: '/instructor/reviews',
          icon: <StarIcon />,
          roles: ['instructor'],
        }
      );
    } else if (user?.role === 'student') {
      baseItems.push(
        {
          label: 'Course Catalog',
          path: '/student/courses',
          icon: <SchoolIcon />,
          roles: ['student'],
        },
        {
          label: 'My Enrollments',
          path: '/student/enrollments',
          icon: <PersonIcon />,
          roles: ['student'],
        },
        {
          label: 'Reviews',
          path: '/student/reviews',
          icon: <StarIcon />,
          roles: ['student'],
        }
      );
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  // Handle mobile menu toggle
  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Handle user menu
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  // Handle navigation
  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    handleUserMenuClose();
  };

  // Handle logout
  const handleLogoutClick = () => {
    onLogout();
    handleUserMenuClose();
  };

  // Skip to main content
  const handleSkipToMain = () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      setSkipLinkFocused(false);
    }
  };

  // Trap focus in mobile menu
  useEffect(() => {
    if (mobileMenuOpen && mobileMenuRef.current) {
      const cleanup = trapFocus(mobileMenuRef.current);
      return cleanup;
    }
  }, [mobileMenuOpen]);

  // Check if current path is active
  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  // Animation variants
  const slideVariants = {
    hidden: { x: '-100%' },
    visible: { x: 0 },
    exit: { x: '-100%' },
  };

  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  // Skip link component
  const SkipLink = () => (
    <Button
      onClick={handleSkipToMain}
      onFocus={() => setSkipLinkFocused(true)}
      onBlur={() => setSkipLinkFocused(false)}
      sx={{
        position: 'absolute',
        top: skipLinkFocused ? '8px' : '-100px',
        left: '8px',
        zIndex: 9999,
        backgroundColor: colors.primary[600],
        color: 'white',
        '&:hover': {
          backgroundColor: colors.primary[700],
        },
        transition: 'top 0.3s ease',
      }}
      {...createNavProps('Skip to main content')}
    >
      Skip to main content
    </Button>
  );

  // Desktop navigation
  const DesktopNavigation = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {navigationItems.map((item) => (
        <Button
          key={item.path}
          onClick={() => handleNavigation(item.path)}
          startIcon={item.icon}
          sx={{
            color: isActivePath(item.path) ? colors.primary[600] : 'inherit',
            fontWeight: isActivePath(item.path) ? 600 : 400,
            '&:hover': {
              backgroundColor: `${colors.primary[100]}`,
            },
            '&:focus': {
              outline: `2px solid ${colors.primary[500]}`,
              outlineOffset: '2px',
            },
          }}
          {...createNavProps(item.label, isActivePath(item.path))}
        >
          {item.label}
        </Button>
      ))}
    </Box>
  );

  // Mobile navigation drawer
  const MobileNavigation = () => (
    <Drawer
      anchor="left"
      open={mobileMenuOpen}
      onClose={handleMobileMenuToggle}
      PaperProps={{
        ref: mobileMenuRef,
        sx: {
          width: 280,
          backgroundColor: theme.palette.background.paper,
        },
      }}
      {...createNavProps('Mobile navigation menu')}
    >
      <motion.div
        variants={shouldReduceMotion ? fadeVariants : slideVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: shouldReduceMotion ? 0.1 : 0.3 }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Menu
          </Typography>
          <IconButton
            onClick={handleMobileMenuToggle}
            aria-label="Close navigation menu"
            sx={{
              '&:focus': {
                outline: `2px solid ${colors.primary[500]}`,
                outlineOffset: '2px',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Divider />
        
        <List>
          {navigationItems.map((item) => (
            <ListItem
              key={item.path}
              button
              onClick={() => handleNavigation(item.path)}
              selected={isActivePath(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: `${colors.primary[100]}`,
                  '& .MuiListItemIcon-root': {
                    color: colors.primary[600],
                  },
                  '& .MuiListItemText-primary': {
                    color: colors.primary[600],
                    fontWeight: 600,
                  },
                },
                '&:focus': {
                  outline: `2px solid ${colors.primary[500]}`,
                  outlineOffset: '-2px',
                },
              }}
              {...createNavProps(item.label, isActivePath(item.path))}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>
      </motion.div>
    </Drawer>
  );

  // User menu
  const UserMenu = () => (
    <Menu
      anchorEl={userMenuAnchor}
      open={Boolean(userMenuAnchor)}
      onClose={handleUserMenuClose}
      PaperProps={{
        sx: {
          mt: 1,
          minWidth: 200,
        },
      }}
      {...createNavProps('User account menu')}
    >
      <MenuItem disabled>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {user?.fullName || user?.username}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.role}
          </Typography>
        </Box>
      </MenuItem>
      
      <Divider />
      
      <MenuItem
        onClick={() => handleNavigation('/profile')}
        sx={{
          '&:focus': {
            outline: `2px solid ${colors.primary[500]}`,
            outlineOffset: '-2px',
          },
        }}
      >
        <ListItemIcon>
          <PersonIcon />
        </ListItemIcon>
        Profile
      </MenuItem>
      
      {onThemeToggle && (
        <MenuItem
          onClick={onThemeToggle}
          sx={{
            '&:focus': {
              outline: `2px solid ${colors.primary[500]}`,
              outlineOffset: '-2px',
            },
          }}
        >
          <ListItemIcon>
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </ListItemIcon>
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </MenuItem>
      )}
      
      <Divider />
      
      <MenuItem
        onClick={handleLogoutClick}
        sx={{
          color: theme.palette.error.main,
          '&:focus': {
            outline: `2px solid ${colors.primary[500]}`,
            outlineOffset: '-2px',
          },
        }}
      >
        <ListItemIcon sx={{ color: 'inherit' }}>
          <LogoutIcon />
        </ListItemIcon>
        Logout
      </MenuItem>
    </Menu>
  );

  return (
    <>
      <SkipLink />
      
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.primary,
        }}
        {...createNavProps('Main navigation')}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo and Mobile Menu Button */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {breakpoints.isMdDown && (
              <IconButton
                onClick={handleMobileMenuToggle}
                aria-label="Open navigation menu"
                aria-expanded={mobileMenuOpen}
                sx={{
                  '&:focus': {
                    outline: `2px solid ${colors.primary[500]}`,
                    outlineOffset: '2px',
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <Typography
              variant="h6"
              component="h1"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.secondary[600]} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                cursor: 'pointer',
              }}
              onClick={() => handleNavigation('/')}
            >
              ExamPort
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {breakpoints.isMdUp && <DesktopNavigation />}

          {/* User Menu */}
          {user && (
            <Button
              ref={userMenuRef}
              onClick={handleUserMenuOpen}
              startIcon={<PersonIcon />}
              aria-label={`User menu for ${user.fullName || user.username}`}
              aria-expanded={Boolean(userMenuAnchor)}
              aria-haspopup="true"
              sx={{
                '&:focus': {
                  outline: `2px solid ${colors.primary[500]}`,
                  outlineOffset: '2px',
                },
              }}
            >
              {breakpoints.isMdUp && (user.fullName || user.username)}
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && <MobileNavigation />}
      </AnimatePresence>

      {/* User Menu */}
      <UserMenu />
    </>
  );
};

export default AccessibleNavigation;