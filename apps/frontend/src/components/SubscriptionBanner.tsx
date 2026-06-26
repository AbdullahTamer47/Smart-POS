import { useQuery } from '@tanstack/react-query';
import { Alert, AlertTitle, Button, Box, alpha } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { WarningAmber, Schedule } from '@mui/icons-material';
import api from '@/api/endpoints';
import { useAuthStore } from '@/stores/authStore';

export function SubscriptionBanner() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAr = i18n.language === 'ar';

  const { data: subscription } = useQuery({
    queryKey: ['subscription-current', user?.tenantId],
    queryFn: () => api.subscriptions.getCurrentSubscription(user!.tenantId),
    enabled: !!user?.tenantId,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });

  if (!subscription) return null;

  const endDate = new Date(subscription.endDate);
  const now = new Date();
  const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysRemaining > 7 && subscription.status !== 'TRIAL') return null;

  const isTrial = subscription.status === 'TRIAL';
  const isExpired = daysRemaining <= 0;

  let severity: 'warning' | 'error' | 'info' = 'warning';
  let icon = <WarningAmber />;
  let title = '';
  let message = '';

  if (isExpired) {
    severity = 'error';
    title = isAr ? 'انتهت الاشتراك' : 'Subscription Expired';
    message = isAr
      ? `انتهت صلاحية اشتراكك. يرجى التجديد لمواصلة استخدام النظام.`
      : `Your subscription has expired. Please renew to continue using the system.`;
  } else if (isTrial) {
    severity = daysRemaining <= 3 ? 'error' : 'info';
    icon = <Schedule />;
    title = isAr ? `فترة تجريبية - متبقي ${daysRemaining} يوم` : `Trial Period - ${daysRemaining} days left`;
    message = isAr
      ? `تنتهي فترتك التجريبية خلال ${daysRemaining} يوم. اشترك الآن لتجنب الانقطاع.`
      : `Your trial period ends in ${daysRemaining} days. Subscribe now to avoid interruption.`;
  } else {
    severity = daysRemaining <= 3 ? 'error' : 'warning';
    title = isAr ? `اشتراك ينتهي قريباً - متبقي ${daysRemaining} يوم` : `Subscription Expiring Soon - ${daysRemaining} days left`;
    message = isAr
      ? `ينتهي اشتراكك خلال ${daysRemaining} يوم. جدد الآن لتجنب الانقطاع.`
      : `Your subscription expires in ${daysRemaining} days. Renew now to avoid interruption.`;
  }

  return (
    <Alert
      severity={severity}
      icon={icon}
      sx={{
        borderRadius: 0,
        alignItems: 'center',
        '& .MuiAlert-message': { width: '100%' },
        ...(severity === 'error' && {
          bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
        }),
      }}
      action={
        <Button
          color="inherit"
          size="small"
          variant="outlined"
          onClick={() => navigate('/settings')}
          sx={{
            borderColor: 'currentColor',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          {isAr ? 'تجديد' : 'Renew'}
        </Button>
      }
    >
      <AlertTitle sx={{ fontWeight: 700 }}>{title}</AlertTitle>
      {message}
    </Alert>
  );
}
