import { useState, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  Stack,
  Paper,
  Chip,
  styled,
  alpha,
  useTheme,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  PlayArrow as ResumeIcon,
  Delete as DeleteIcon,
  ReceiptLong as ReceiptIcon,
  AccessTime as TimeIcon,
  ShoppingCart as CartIcon,
  Receipt,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/endpoints';
import { usePOSStore } from '@/stores/posStore';

const InvoiceCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 14,
  border: `1.5px solid ${theme.palette.divider}`,
  cursor: 'pointer',
  transition: theme.transitions.create(['transform', 'box-shadow', 'border-color'], {
    duration: theme.transitions.duration.short,
    easing: theme.transitions.easing.easeInOut,
  }),
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
    borderColor: theme.palette.primary.main,
  },
}));

const EmptyState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(6),
  gap: theme.spacing(2),
  color: theme.palette.text.secondary,
  textAlign: 'center',
}));

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(amount);
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

interface HeldInvoice {
  id: string;
  invoiceNumber: string;
  items: Array<{ productId: string; productName: string; quantity: number }>;
  total: number;
  createdAt: string;
  heldAt: string;
  customerName?: string;
}

interface HeldInvoicesDialogProps {
  open: boolean;
  onClose: () => void;
}

export function HeldInvoicesDialog({ open, onClose }: HeldInvoicesDialogProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { clearCart, addToCart, setCustomer } = usePOSStore();

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [resumingId, setResumingId] = useState<string | null>(null);

  const { data: heldData, isLoading } = useQuery({
    queryKey: ['invoices', 'held'],
    queryFn: () => api.invoices.getHeldInvoices({ page: 1, limit: 50 }),
    enabled: open,
    staleTime: 10000,
  });

  const heldInvoices = useMemo(() => {
    const data = heldData as { data: Array<Record<string, unknown>> } | undefined;
    if (!data?.data) return [];
    return data.data.map((inv: Record<string, unknown>) => ({
      id: inv.id as string,
      invoiceNumber: inv.invoiceNumber as string,
      items: (inv.items as Array<Record<string, unknown>> || []).map((item: Record<string, unknown>) => ({
        productId: item.productId as string,
        productName: item.productName as string,
        quantity: item.quantity as number,
      })),
      total: (inv.total as number) || (inv.grandTotal as number) || 0,
      createdAt: (inv.createdAt as string) || '',
      heldAt: (inv.heldAt as string) || (inv.createdAt as string) || '',
      customerName: (inv.customerName as string) || undefined,
    })) as HeldInvoice[];
  }, [heldData]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.invoices.deleteHeldInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', 'held'] });
      setDeletingId(null);
    },
    onError: () => {
      setDeletingId(null);
    },
  });

  const resumeMutation = useMutation({
    mutationFn: (id: string) => api.invoices.resumeInvoice(id),
    onSuccess: (data) => {
      const invoiceData = data as unknown as Record<string, unknown>;
      clearCart();
      const items = (invoiceData.items as Array<Record<string, unknown>>) || [];
      items.forEach((item: Record<string, unknown>) => {
        const product = {
          id: (item.productId as string) || '',
          name: (item.productName as string) || '',
          sku: (item.sku as string) || '',
          unit: (item.unit as string) || 'PIECE',
          costPrice: (item.costPrice as number) || 0,
          sellingPrice: (item.unitPrice as number) || 0,
          taxRate: (item.taxRate as number) || 0,
          isActive: true,
          hasExpiry: false,
          hasVariants: false,
        };
        addToCart(product, (item.quantity as number) || 1);
      });
      if (invoiceData.customer) {
        const cust = invoiceData.customer as Record<string, unknown>;
        setCustomer({
          id: cust.id as string,
          name: (cust.fullName as string) || (cust.name as string) || '',
          phone: cust.phone as string,
          email: cust.email as string,
          loyaltyPoints: (cust.loyaltyPoints as number) || 0,
          creditLimit: (cust.creditLimit as number) || 0,
          balance: (cust.balance as number) || 0,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['invoices', 'held'] });
      setResumingId(null);
      onClose();
    },
    onError: () => {
      setResumingId(null);
    },
  });

  const handleResume = useCallback((id: string) => {
    setResumingId(id);
    resumeMutation.mutate(id);
  }, [resumeMutation]);

  const handleDelete = useCallback((id: string) => {
    setDeletingId(id);
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 20,
          maxHeight: '80vh',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Receipt />
          <Typography variant="h6" fontWeight={600}>
            {t('pos.holdInvoices')}
          </Typography>
          {!isLoading && heldInvoices.length > 0 && (
            <Chip label={heldInvoices.length} size="small" color="primary" />
          )}
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : heldInvoices.length === 0 ? (
          <EmptyState>
            <ReceiptIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
            <Typography variant="h6">{t('pos.noHeldInvoices')}</Typography>
            <Typography variant="body2" color="text.disabled">
              {t('pos.holdInvoice')}
            </Typography>
          </EmptyState>
        ) : (
          <Stack spacing={1.5}>
            {heldInvoices.map((invoice) => (
              <InvoiceCard key={invoice.id} onClick={() => handleResume(invoice.id)}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {invoice.invoiceNumber}
                    </Typography>
                    {invoice.customerName && (
                      <Typography variant="caption" color="text.secondary">
                        {invoice.customerName}
                      </Typography>
                    )}
                  </Box>
                  <Typography variant="h6" fontWeight={700} color="primary">
                    {formatCurrency(invoice.total)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CartIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {invoice.items.length} {t('pos.items')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {formatTimeAgo(invoice.heldAt || invoice.createdAt)}
                    </Typography>
                  </Box>
                </Box>

                {invoice.items.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                    {invoice.items.slice(0, 3).map((item, idx) => (
                      <Chip
                        key={idx}
                        label={`${item.productName} x${item.quantity}`}
                        size="small"
                        variant="outlined"
                        sx={{ height: 24, fontSize: '0.7rem' }}
                      />
                    ))}
                    {invoice.items.length > 3 && (
                      <Chip
                        label={`+${invoice.items.length - 3}`}
                        size="small"
                        variant="outlined"
                        sx={{ height: 24, fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                )}

                <Divider sx={{ my: 1 }} />

                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button
                    size="small"
                    color="error"
                    startIcon={deletingId === invoice.id ? <CircularProgress size={16} /> : <DeleteIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(invoice.id);
                    }}
                    disabled={deletingId === invoice.id}
                    sx={{ minHeight: 36, borderRadius: 10 }}
                  >
                    {t('common.delete')}
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={resumingId === invoice.id ? <CircularProgress size={16} color="inherit" /> : <ResumeIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResume(invoice.id);
                    }}
                    disabled={resumingId === invoice.id}
                    sx={{ minHeight: 36, borderRadius: 10 }}
                  >
                    {t('pos.resume')}
                  </Button>
                </Box>
              </InvoiceCard>
            ))}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ minHeight: 44, borderRadius: 12 }}>
          {t('common.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}