import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  useTheme,
  alpha,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  LightMode,
  DarkMode,
  Translate,
  Logout,
  Settings,
  Person,
  WifiOff,
  Search,
} from '@mui/icons-material';
import { useAuthStore } from '@/stores/authStore';
import { useThemeContext } from '@/theme/ThemeProvider';
import { useAppStore } from '@/stores/appStore';

interface HeaderProps {
  onMenuClick: () => void;
  isMobile: boolean;
}

export function Header({ onMenuClick, isMobile }: HeaderProps) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { mode, toggleMode, toggleDirection } = useThemeContext();
  const { isOffline } = useAppStore();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [notifAnchor, setNotifAnchor] = useState<HTMLElement | null>(null);

  const isDark = mode === 'dark';

  const handleLogout = useCallback(() => {
    setAnchorEl(null);
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const roleLabel = user?.role
    ? t(`roles.${user.role.toLowerCase()}`) || user.role
    : '';

  return (
    <AppBar
      position="sticky"
      sx={{
        background: isDark
          ? 'rgba(29,27,32,0.75)'
          : 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      {isOffline && (
        <Box
          component={motion.div}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          sx={{
            bgcolor: theme.palette.warning.main,
            color: '#fff',
            textAlign: 'center',
            py: 0.5,
            px: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <WifiOff sx={{ fontSize: 16 }} />
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {t('common.offline') || 'You are offline'}
          </Typography>
        </Box>
      )}
      <Toolbar sx={{ minHeight: 64, gap: 1 }}>
        {isMobile && (
          <IconButton edge="start" onClick={onMenuClick}>
            <MenuIcon />
          </IconButton>
        )}

        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, flex: 1, display: { xs: 'none', sm: 'block' } }}
        >
          Smart POS
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title={t('common.search') || 'Search'}>
            <IconButton size="small">
              <Search fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title={i18n.language === 'ar' ? 'English' : 'العربية'}>
            <IconButton size="small" onClick={toggleDirection}>
              <Translate fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title={isDark ? (t('common.lightMode') || 'Light mode') : (t('common.darkMode') || 'Dark mode')}>
            <IconButton size="small" onClick={toggleMode}>
              {isDark ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
            </IconButton>
          </Tooltip>

          <Tooltip title={t('common.notifications') || 'Notifications'}>
            <IconButton
              size="small"
              onClick={(e) => setNotifAnchor(e.currentTarget)}
            >
              <Badge badgeContent={3} color="error">
                <Notifications fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title={user?.fullName || ''}>
            <IconButton
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ ml: 0.5 }}
            >
              <Avatar
                src={user?.avatar}
                sx={{
                  width: 34,
                  height: 34,
                  bgcolor: theme.palette.primary.main,
                  fontSize: '0.875rem',
                  fontWeight: 700,
                }}
              >
                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        {/* User menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 220,
              borderRadius: 4,
              border: `1px solid ${theme.palette.divider}`,
              background: isDark
                ? 'rgba(29,27,32,0.95)'
                : 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {user?.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
            <Box
              sx={{
                mt: 0.5,
                display: 'inline-block',
                px: 1.5,
                py: 0.25,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
                fontSize: '0.6875rem',
                fontWeight: 600,
              }}
            >
              {roleLabel}
            </Box>
          </Box>
          <Divider />
          <MenuItem onClick={() => { setAnchorEl(null); navigate('/settings'); }}>
            <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
            <ListItemText>{t('nav.settings') || 'Settings'}</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => { setAnchorEl(null); navigate('/settings/users'); }}>
            <ListItemIcon><Person fontSize="small" /></ListItemIcon>
            <ListItemText>{t('nav.profile') || 'Profile'}</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
            <ListItemText>{t('auth.logout') || 'Logout'}</ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}