import { Box, Card, CardContent, Typography, Stack, Grid, alpha, useTheme } from '@mui/material';
import {
  Settings as GeneralIcon, Palette as BrandingIcon, ReceiptLong as TaxIcon,
  Print as PrintIcon, People as UsersIcon, VpnKey as ApiKeyIcon,
  Webhook as WebhookIcon, Backup as BackupIcon, CardMembership as SubscriptionIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface SettingsCard {
  path: string;
  key: string;
  icon: React.ReactNode;
  descriptionKey: string;
  color: string;
}

const settingsCards: SettingsCard[] = [
  { path: '/settings', key: 'settings.general', icon: <GeneralIcon />, descriptionKey: 'settings.generalDesc', color: '#1976d2' },
  { path: '/settings/branding', key: 'settings.branding', icon: <BrandingIcon />, descriptionKey: 'settings.brandingDesc', color: '#7b1fa2' },
  { path: '/settings/tax', key: 'settings.taxConfig', icon: <TaxIcon />, descriptionKey: 'settings.taxDesc', color: '#388e3c' },
  { path: '/settings/print', key: 'settings.printSettings', icon: <PrintIcon />, descriptionKey: 'settings.printDesc', color: '#f57c00' },
  { path: '/settings/users', key: 'settings.userManagement', icon: <UsersIcon />, descriptionKey: 'settings.userManagementDesc', color: '#d32f2f' },
  { path: '/settings/api-keys', key: 'settings.apiKeys', icon: <ApiKeyIcon />, descriptionKey: 'settings.apiKeysDesc', color: '#00796b' },
  { path: '/settings/webhooks', key: 'settings.webhooks', icon: <WebhookIcon />, descriptionKey: 'settings.webhooksDesc', color: '#455a64' },
  { path: '/settings/backup', key: 'settings.backup', icon: <BackupIcon />, descriptionKey: 'settings.backupDesc', color: '#c2185b' },
  { path: '/settings/subscription', key: 'settings.subscription', icon: <SubscriptionIcon />, descriptionKey: 'settings.subscriptionDesc', color: '#e64a19' },
];

export default function SettingsPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={1}>
        {t('settings.settings', 'Settings')}
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        {t('settings.manageSettings', 'Manage your account settings and preferences')}
      </Typography>

      <Grid container spacing={2.5}>
        {settingsCards.map((card) => (
          <Grid key={card.path} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              sx={{
                cursor: 'pointer',
                borderRadius: 3,
                transition: 'all 0.2s ease',
                border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: theme.shadows[6],
                  borderColor: card.color,
                },
              }}
              onClick={() => navigate(card.path)}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(card.color, 0.12),
                      color: card.color,
                      flexShrink: 0,
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" fontWeight={600} noWrap>
                      {t(card.key)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {t(card.descriptionKey, '')}
                    </Typography>
                  </Box>
                  <ArrowIcon sx={{ color: 'text.disabled', flexShrink: 0 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}