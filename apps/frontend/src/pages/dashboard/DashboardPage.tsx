import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Skeleton,
  Button,
  IconButton,
  useTheme,
  alpha,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Receipt,
  People,
  Inventory as InventoryIcon,
  AttachMoney,
  Add,
  Assessment,
  Refresh,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuthStore } from '@/stores/authStore';
import api from '@/api/endpoints';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 200, damping: 20 } },
};

function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: 'spring' }}
    >
      {prefix}{value.toLocaleString()}{suffix}
    </motion.span>
  );
}

function StatCard({
  icon,
  label,
  value,
  trend,
  trendLabel,
  loading,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  loading?: boolean;
  color: string;
}) {
  const theme = useTheme();

  return (
    <motion.div variants={cardVariants}>
      <Card
        sx={{
          borderRadius: 6,
          background: theme.palette.mode === 'dark'
            ? 'rgba(29,27,32,0.65)'
            : 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${theme.palette.divider}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[8],
          },
        }}
      >
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${color}22, ${color}44)`,
                color: color,
              }}
            >
              {icon}
            </Box>
            {trend !== undefined && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1,
                  py: 0.5,
                  borderRadius: 2,
                  bgcolor: trend >= 0
                    ? alpha(theme.palette.success.main, 0.12)
                    : alpha(theme.palette.error.main, 0.12),
                  color: trend >= 0 ? theme.palette.success.main : theme.palette.error.main,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {trend >= 0 ? <TrendingUp sx={{ fontSize: 16 }} /> : <TrendingDown sx={{ fontSize: 16 }} />}
                {Math.abs(trend)}%
              </Box>
            )}
          </Box>
          {loading ? (
            <>
              <Skeleton variant="text" width="60%" height={40} />
              <Skeleton variant="text" width="40%" height={20} sx={{ mt: 0.5 }} />
            </>
          ) : (
            <>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                <AnimatedNumber value={typeof value === 'number' ? value : 0} />
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {label}
              </Typography>
              {trendLabel && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {trendLabel}
                </Typography>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function DashboardPage() {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.reports.salesReport({
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    }).then((d: any) => ({
      todaySales: d?.totalSales || 0,
      salesTrend: d?.trend || 0,
      todayProfit: d?.totalProfit || 0,
      profitTrend: d?.profitTrend || 0,
      activeCustomers: d?.customerCount || 0,
      customersTrend: d?.customerTrend || 0,
      lowStockItems: d?.lowStockCount || 0,
    })),
    staleTime: 30000,
  });

  const { data: salesData } = useQuery({
    queryKey: ['dashboard-sales-chart'],
    queryFn: () => api.reports.salesReport().then((d: any) => d?.dailyBreakdown || []),
    staleTime: 60000,
  });

  const { data: topProducts } = useQuery({
    queryKey: ['dashboard-top-products'],
    queryFn: () => api.reports.topProductsReport().then((d: any) => d?.data || []),
    staleTime: 60000,
  });

  const { data: recentInvoices } = useQuery({
    queryKey: ['dashboard-recent-invoices'],
    queryFn: () => api.invoices.getInvoices({ page: 1, limit: 5 }).then((d: any) => d?.data || []),
    staleTime: 30000,
  });

  const chartData = useMemo(() => {
    if (!salesData) return [];
    return (salesData as any[]).map((d: any) => ({
      name: d.date || d.label || '',
      sales: d.total || d.sales || 0,
      orders: d.count || d.orders || 0,
    }));
  }, [salesData]);

  const productData = useMemo(() => {
    if (!topProducts) return [];
    return (topProducts as any[]).slice(0, 5).map((p: any) => ({
      name: p.name || p.productName || '',
      sales: p.total || p.sales || 0,
      quantity: p.quantity || 0,
    }));
  }, [topProducts]);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {t('dashboard.welcome') || 'Welcome back'}, {user?.fullName?.split(' ')[0] || 'User'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
            </motion.div>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/pos')}
              sx={{ borderRadius: 3, fontWeight: 600 }}
            >
              {t('dashboard.newSale') || 'New Sale'}
            </Button>
            <Tooltip title={t('common.refresh') || 'Refresh'}>
              <IconButton sx={{ borderRadius: 3 }}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            icon={<Receipt />}
            label={t('dashboard.todaySales') || "Today's Sales"}
            value={stats?.todaySales ?? 0}
            trend={stats?.salesTrend}
            trendLabel={t('dashboard.vsYesterday') || 'vs yesterday'}
            loading={isLoading}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            icon={<AttachMoney />}
            label={t('dashboard.todayProfit') || "Today's Profit"}
            value={stats?.todayProfit ?? 0}
            trend={stats?.profitTrend}
            loading={isLoading}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            icon={<People />}
            label={t('dashboard.activeCustomers') || 'Active Customers'}
            value={stats?.activeCustomers ?? 0}
            trend={stats?.customersTrend}
            loading={isLoading}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            icon={<InventoryIcon />}
            label={t('dashboard.lowStock') || 'Low Stock Items'}
            value={stats?.lowStockItems ?? 0}
            loading={isLoading}
            color={theme.palette.warning.main}
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <motion.div variants={cardVariants}>
            <Card
              sx={{
                borderRadius: 6,
                background: theme.palette.mode === 'dark'
                  ? 'rgba(29,27,32,0.65)'
                  : 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  {t('dashboard.salesTrend') || 'Sales Trend'}
                </Typography>
                <Box sx={{ height: 300 }}>
                  {!chartData.length ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <Skeleton variant="rounded" width="100%" height={280} />
                    </Box>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                        <XAxis dataKey="name" stroke={theme.palette.text.secondary} fontSize={12} />
                        <YAxis stroke={theme.palette.text.secondary} fontSize={12} />
                        <RechartsTooltip
                          contentStyle={{
                            borderRadius: 16,
                            border: `1px solid ${theme.palette.divider}`,
                            background: theme.palette.background.paper,
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="sales"
                          stroke={theme.palette.primary.main}
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: theme.palette.primary.main }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <motion.div variants={cardVariants}>
            <Card
              sx={{
                borderRadius: 6,
                height: '100%',
                background: theme.palette.mode === 'dark'
                  ? 'rgba(29,27,32,0.65)'
                  : 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  {t('dashboard.topProducts') || 'Top Products'}
                </Typography>
                <Box sx={{ height: 300 }}>
                  {!productData.length ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <Skeleton variant="rounded" width="100%" height={280} />
                    </Box>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={productData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                        <XAxis type="number" stroke={theme.palette.text.secondary} fontSize={12} />
                        <YAxis type="category" dataKey="name" stroke={theme.palette.text.secondary} fontSize={12} width={80} />
                        <RechartsTooltip
                          contentStyle={{
                            borderRadius: 16,
                            border: `1px solid ${theme.palette.divider}`,
                            background: theme.palette.background.paper,
                          }}
                        />
                        <Bar dataKey="sales" fill={theme.palette.primary.main} radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <motion.div variants={cardVariants}>
        <Card
          sx={{
            borderRadius: 6,
            background: theme.palette.mode === 'dark'
              ? 'rgba(29,27,32,0.65)'
              : 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {t('dashboard.recentActivity') || 'Recent Activity'}
              </Typography>
              <Button
                size="small"
                onClick={() => navigate('/invoices')}
                sx={{ borderRadius: 3 }}
              >
                {t('common.viewAll') || 'View All'}
              </Button>
            </Box>
            <Box sx={{ overflow: 'auto' }}>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} variant="rounded" height={56} sx={{ mb: 1 }} />
                ))
              ) : !recentInvoices?.length ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Receipt sx={{ fontSize: 48, color: theme.palette.text.disabled, mb: 2 }} />
                  <Typography color="text.secondary">
                    {t('common.noData') || 'No recent activity'}
                  </Typography>
                </Box>
              ) : (
                (recentInvoices as any[]).map((inv: any, idx: number) => (
                  <motion.div
                    key={inv.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 1.5,
                        px: 2,
                        borderRadius: 3,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          backgroundColor: theme.palette.action.hover,
                        },
                      }}
                      onClick={() => navigate(`/invoices/${inv.id}`)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: alpha(theme.palette.primary.main, 0.12),
                            color: theme.palette.primary.main,
                          }}
                        >
                          <Receipt sx={{ fontSize: 20 }} />
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {inv.customerName || inv.invoiceNumber || 'Invoice'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {inv.date || inv.createdAt}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {inv.total || inv.grandTotal}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: inv.status === 'completed' ? 'success.main' : 'warning.main',
                            fontWeight: 500,
                          }}
                        >
                          {inv.status}
                        </Typography>
                      </Box>
                    </Box>
                  </motion.div>
                ))
              )}
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}