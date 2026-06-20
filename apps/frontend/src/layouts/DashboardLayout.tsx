import React, { useState, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
  useMediaQuery,
  alpha,
  IconButton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  PointOfSale as POSIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  ShoppingCart as ProductsIcon,
  People as CustomersIcon,
  LocalShipping as SuppliersIcon,
  Receipt as InvoicesIcon,
  Assessment as ReportsIcon,
  AccountBalance as AccountingIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Support as SupportIcon,
  ChevronLeft,
  Menu as MenuIcon,
  AdminPanelSettings,
  Business,
  CardMembership,
  ConfirmationNumber,
} from '@mui/icons-material';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@smartpos/types';
import { Header } from './Header';

const DRAWER_WIDTH = 260;
const DRAWER_COLLAPSED = 72;

interface NavItem {
  label: string;
  icon: React.ReactElement;
  path: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { label: 'nav.dashboard', icon: <DashboardIcon />, path: '/', roles: [UserRole.SUPER_ADMIN, UserRole.TRADER, UserRole.MANAGER] },
  { label: 'nav.pos', icon: <POSIcon />, path: '/pos', roles: [UserRole.TRADER, UserRole.MANAGER, UserRole.CASHIER] },
  { label: 'nav.products', icon: <ProductsIcon />, path: '/products', roles: [UserRole.TRADER, UserRole.MANAGER] },
  { label: 'nav.categories', icon: <CategoryIcon />, path: '/categories', roles: [UserRole.TRADER] },
  { label: 'nav.inventory', icon: <InventoryIcon />, path: '/inventory', roles: [UserRole.TRADER, UserRole.MANAGER] },
  { label: 'nav.customers', icon: <CustomersIcon />, path: '/customers', roles: [UserRole.TRADER, UserRole.MANAGER] },
  { label: 'nav.suppliers', icon: <SuppliersIcon />, path: '/suppliers', roles: [UserRole.TRADER] },
  { label: 'nav.invoices', icon: <InvoicesIcon />, path: '/invoices', roles: [UserRole.TRADER, UserRole.MANAGER, UserRole.CASHIER] },
  { label: 'nav.reports', icon: <ReportsIcon />, path: '/reports', roles: [UserRole.TRADER, UserRole.MANAGER] },
  { label: 'nav.accounting', icon: <AccountingIcon />, path: '/accounting', roles: [UserRole.TRADER] },
  { label: 'nav.settings', icon: <SettingsIcon />, path: '/settings', roles: [UserRole.TRADER] },
  { label: 'nav.notifications', icon: <NotificationsIcon />, path: '/notifications', roles: [UserRole.TRADER, UserRole.MANAGER, UserRole.CASHIER] },
  { label: 'nav.support', icon: <SupportIcon />, path: '/support', roles: [UserRole.TRADER, UserRole.MANAGER, UserRole.CASHIER] },
  { label: 'nav.admin', icon: <AdminPanelSettings />, path: '/admin', roles: [UserRole.SUPER_ADMIN] },
  { label: 'nav.traders', icon: <Business />, path: '/admin/tenants', roles: [UserRole.SUPER_ADMIN] },
  { label: 'nav.plans', icon: <CardMembership />, path: '/admin/plans', roles: [UserRole.SUPER_ADMIN] },
  { label: 'nav.tickets', icon: <ConfirmationNumber />, path: '/admin/tickets', roles: [UserRole.SUPER_ADMIN] },
];

export default function DashboardLayout() {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const userRole = user?.role as UserRole;
  const filteredNav = navItems.filter((item) => item.roles.includes(userRole));
  const isDark = theme.palette.mode === 'dark';

  const handleNavigate = useCallback(
    (path: string) => {
      navigate(path);
      if (isMobile) setMobileOpen(false);
    },
    [navigate, isMobile],
  );

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: isDark
          ? 'rgba(29,27,32,0.85)'
          : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        borderRight: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          px: collapsed ? 1 : 2.5,
          py: 2,
          minHeight: 64,
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            minWidth: 40,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #6750A4, #7C5CBF)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1.1rem',
          }}
        >
          SP
        </Box>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Box sx={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, lineHeight: 1.2 }}
                >
                  Smart POS
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ lineHeight: 1 }}
                >
                  {t('common.appName') || 'POS System'}
                </Typography>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* Nav items */}
      <List sx={{ flex: 1, px: 1, overflow: 'auto', py: 0 }}>
        {filteredNav.map((item, idx) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <ListItemButton
                onClick={() => handleNavigate(item.path)}
                sx={{
                  borderRadius: 3,
                  mb: 0.5,
                  minHeight: 48,
                  justifyContent: collapsed ? 'center' : 'initial',
                  px: collapsed ? 1.5 : 2,
                  backgroundColor: isActive
                    ? alpha(theme.palette.primary.main, 0.12)
                    : 'transparent',
                  color: isActive
                    ? theme.palette.primary.main
                    : theme.palette.text.secondary,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  },
                  '&::before': isActive
                    ? {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 3,
                        height: 24,
                        borderRadius: '0 3px 3px 0',
                        backgroundColor: theme.palette.primary.main,
                      }
                    : undefined,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: collapsed ? 0 : 40,
                    color: 'inherit',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={t(item.label)}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 500,
                    }}
                  />
                )}
              </ListItemButton>
            </motion.div>
          );
        })}
      </List>

      {/* Collapse button */}
      {!isMobile && (
        <Box sx={{ p: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
          <IconButton
            onClick={() => setCollapsed(!collapsed)}
            sx={{
              width: '100%',
              borderRadius: 3,
              transition: 'all 0.3s ease',
              transform: collapsed ? 'rotate(180deg)' : 'none',
            }}
          >
            <ChevronLeft />
          </IconButton>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              border: 'none',
              background: 'transparent',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Desktop drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: collapsed ? DRAWER_COLLAPSED : DRAWER_WIDTH,
            flexShrink: 0,
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '& .MuiDrawer-paper': {
              width: collapsed ? DRAWER_COLLAPSED : DRAWER_WIDTH,
              transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          background: isDark
            ? 'linear-gradient(180deg, #1D1B20 0%, #151318 100%)'
            : 'linear-gradient(180deg, #FEF7FF 0%, #F8F5FF 100%)',
        }}
      >
        <Header
          onMenuClick={() => setMobileOpen(true)}
          isMobile={isMobile}
        />
        <Box
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3 },
            overflow: 'auto',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
}

import { Typography as MuiTypography } from '@mui/material';