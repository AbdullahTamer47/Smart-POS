import { useState, useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  Stack,
  Divider,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  styled,
  alpha,
  useTheme,
  SelectChangeEvent,
} from '@mui/material';
import {
  Close as CloseIcon,
  Payments as CashIcon,
  CreditCard as CardIcon,
  AccountBalanceWallet as WalletIcon,
  CardGiftcard as GiftCardIcon,
  AccountBalance as CreditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Receipt,
  CallSplit,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { type CartItem, type Payment, type Customer } from '@/stores/posStore';

const PaymentMethodButton = styled(ToggleButton)(({ theme }) => ({
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  padding: theme.spacing(1.5),
  minWidth: 90,
  borderRadius: '14px !important',
  border: `2px solid ${theme.palette.divider} !important`,
  '&.Mui-selected': {
    borderColor: `${theme.palette.primary.main} !important`,
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
}));

const AmountInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 14,
    fontSize: '1.5rem',
    fontWeight: 700,
    '& input': {
      textAlign: 'center',
      padding: '16px',
    },
    '& fieldset': {
      borderWidth: '2px !important',
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

const ChangeDisplay = styled(Box)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.success.main, 0.1),
  borderRadius: 14,
  padding: theme.spacing(2),
  textAlign: 'center',
  border: `2px solid ${alpha(theme.palette.success.main, 0.3)}`,
  marginTop: theme.spacing(1),
}));

const PaymentChip = styled(Chip)(({ theme }) => ({
  height: 40,
  fontSize: '0.875rem',
  '& .MuiChip-deleteIcon': {
    fontSize: 18,
  },
}));

type PaymentMethod = 'cash' | 'card' | 'credit' | 'wallet' | 'giftCard' | 'bankTransfer';

interface PaymentMethodOption {
  value: PaymentMethod;
  label: string;
  icon: React.ReactNode;
}

interface CartTotals {
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  grandTotal: number;
  totalPaid: number;
  balance: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(amount);
}

function generatePaymentId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  totals: CartTotals;
  payments: Payment[];
  onAddPayment: (payment: Payment) => void;
  onRemovePayment: (paymentId: string) => void;
  onCompleteSale: () => void;
  isProcessing: boolean;
  cart: CartItem[];
  selectedCustomer: Customer | null;
  lastInvoiceNumber: string;
}

export function PaymentModal({
  open,
  onClose,
  totals,
  payments,
  onAddPayment,
  onRemovePayment,
  onCompleteSale,
  isProcessing,
  cart,
  selectedCustomer,
  lastInvoiceNumber,
}: PaymentModalProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const [activeMethod, setActiveMethod] = useState<PaymentMethod>('cash');
  const [amountInput, setAmountInput] = useState('');
  const [referenceInput, setReferenceInput] = useState('');
  const [splitMode, setSplitMode] = useState(false);
  const [printThermal58, setPrintThermal58] = useState(true);
  const [printThermal80, setPrintThermal80] = useState(false);
  const [printA4, setPrintA4] = useState(false);
  const [printWhatsApp, setPrintWhatsApp] = useState(false);

  const paymentMethods: PaymentMethodOption[] = useMemo(() => [
    { value: 'cash', label: t('pos.cash'), icon: <CashIcon /> },
    { value: 'card', label: t('pos.card'), icon: <CardIcon /> },
    { value: 'credit', label: t('pos.credit'), icon: <CreditIcon /> },
    { value: 'wallet', label: t('pos.wallet'), icon: <WalletIcon /> },
    { value: 'giftCard', label: t('pos.giftCard'), icon: <GiftCardIcon /> },
    { value: 'bankTransfer', label: t('pos.bankTransfer'), icon: <CashIcon /> },
  ], [t]);

  const remaining = useMemo(() => {
    return Math.max(0, totals.grandTotal - totals.totalPaid);
  }, [totals.grandTotal, totals.totalPaid]);

  const isFullyPaid = useMemo(() => {
    return totals.totalPaid >= totals.grandTotal;
  }, [totals.totalPaid, totals.grandTotal]);

  const cashAmount = useMemo(() => {
    if (activeMethod !== 'cash') return 0;
    const val = parseFloat(amountInput);
    return isNaN(val) ? 0 : val;
  }, [activeMethod, amountInput]);

  const cashChange = useMemo(() => {
    if (activeMethod !== 'cash' || cashAmount <= 0) return 0;
    return Math.max(0, cashAmount - remaining);
  }, [activeMethod, cashAmount, remaining]);

  const handleAddPayment = useCallback(() => {
    const amount = parseFloat(amountInput);
    if (isNaN(amount) || amount <= 0) return;

    const paymentAmount = Math.min(amount, remaining);
    const payment: Payment = {
      id: generatePaymentId(),
      method: activeMethod,
      amount: paymentAmount,
      reference: referenceInput || undefined,
      cardNumber: activeMethod === 'card' ? referenceInput : undefined,
      giftCardCode: activeMethod === 'giftCard' ? referenceInput : undefined,
    };

    onAddPayment(payment);
    setAmountInput('');
    setReferenceInput('');

    if (isFullyPaid) {
      setSplitMode(false);
    }
  }, [amountInput, referenceInput, activeMethod, remaining, onAddPayment, isFullyPaid]);

  const handleMethodChange = useCallback((_e: React.MouseEvent<HTMLElement>, value: PaymentMethod | null) => {
    if (value) {
      setActiveMethod(value);
      setAmountInput('');
      setReferenceInput('');
    }
  }, []);

  const quickAmount = useCallback((amount: number) => {
    setAmountInput(String(amount));
  }, []);

  const quickAmounts = useMemo(() => {
    if (remaining <= 0) return [];
    const amounts: number[] = [remaining];
    if (remaining > 5) amounts.push(5);
    if (remaining > 10) amounts.push(10);
    if (remaining > 20) amounts.push(20);
    if (remaining > 50) amounts.push(50);
    if (remaining > 100) amounts.push(100);
    if (remaining > 500) amounts.push(500);
    return [...new Set(amounts)].sort((a, b) => a - b);
  }, [remaining]);

  const handleCompleteSale = useCallback(() => {
    if (!isFullyPaid) {
      const remainingPayment: Payment = {
        id: generatePaymentId(),
        method: activeMethod,
        amount: remaining,
      };
      onAddPayment(remainingPayment);
    }
    onCompleteSale();
  }, [isFullyPaid, remaining, activeMethod, onAddPayment, onCompleteSale]);

  const handleClose = useCallback(() => {
    if (!isProcessing) {
      onClose();
    }
  }, [isProcessing, onClose]);

  const renderPaymentInput = () => {
    switch (activeMethod) {
      case 'cash':
        return (
          <Box>
            <AmountInput
              fullWidth
              type="number"
              placeholder="0.00"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              autoFocus
              slotProps={{ htmlInput: { min: 0, step: 0.01, inputMode: 'decimal' } }}
            />
            {quickAmounts.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.5, mt: 1.5, flexWrap: 'wrap' }}>
                {quickAmounts.map((amt) => (
                  <Chip
                    key={amt}
                    label={formatCurrency(amt)}
                    clickable
                    variant="outlined"
                    size="small"
                    onClick={() => quickAmount(amt)}
                    color={Math.abs(amt - remaining) < 0.01 ? 'primary' : 'default'}
                  />
                ))}
              </Box>
            )}
            {cashChange > 0 && (
              <ChangeDisplay>
                <Typography variant="body2" color="text.secondary">
                  {t('pos.change')}
                </Typography>
                <Typography variant="h5" fontWeight={700} color="success.main">
                  {formatCurrency(cashChange)}
                </Typography>
              </ChangeDisplay>
            )}
          </Box>
        );
      case 'card':
      case 'giftCard':
      case 'bankTransfer':
        return (
          <Stack spacing={2}>
            <AmountInput
              fullWidth
              type="number"
              placeholder="0.00"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              autoFocus
              slotProps={{ htmlInput: { min: 0, step: 0.01, inputMode: 'decimal' } }}
            />
            <TextField
              fullWidth
              label={activeMethod === 'card' ? t('payments.transactionId') : t('payments.paymentReference')}
              value={referenceInput}
              onChange={(e) => setReferenceInput(e.target.value)}
              placeholder={activeMethod === 'card' ? '123456' : ''}
            />
          </Stack>
        );
      case 'credit':
        return (
          <Stack spacing={2}>
            <AmountInput
              fullWidth
              type="number"
              placeholder="0.00"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              autoFocus
              slotProps={{ htmlInput: { min: 0, step: 0.01, inputMode: 'decimal' } }}
            />
            {selectedCustomer && (
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.08) }}>
                <Typography variant="body2">
                  {selectedCustomer.name} - {t('customers.balance')}: {formatCurrency(selectedCustomer.balance || 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('customers.creditLimit')}: {formatCurrency(selectedCustomer.creditLimit || 0)}
                </Typography>
              </Box>
            )}
          </Stack>
        );
      case 'wallet':
        return (
          <Stack spacing={2}>
            <AmountInput
              fullWidth
              type="number"
              placeholder="0.00"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              autoFocus
              slotProps={{ htmlInput: { min: 0, step: 0.01, inputMode: 'decimal' } }}
            />
            <TextField
              fullWidth
              label={t('payments.paymentReference')}
              value={referenceInput}
              onChange={(e) => setReferenceInput(e.target.value)}
              placeholder="Wallet reference"
            />
          </Stack>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 20,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Receipt />
          <Typography variant="h6" fontWeight={600}>
            {t('pos.completeSale')}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} disabled={isProcessing} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight={700} color="primary">
            {formatCurrency(totals.grandTotal)}
          </Typography>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary">
              {t('pos.paid')}: {formatCurrency(totals.totalPaid)}
            </Typography>
            {remaining > 0 && (
              <Typography variant="body2" color="error" fontWeight={600}>
                {t('pos.balance')}: {formatCurrency(remaining)}
              </Typography>
            )}
          </Box>
        </Box>

        {payments.length > 0 && (
          <Box sx={{ mb: 2, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {payments.map((p) => (
              <PaymentChip
                key={p.id}
                label={`${p.method} - ${formatCurrency(p.amount)}${p.reference ? ` (${p.reference})` : ''}`}
                onDelete={() => onRemovePayment(p.id)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        )}

        {!isFullyPaid && (
          <>
            <ToggleButtonGroup
              value={activeMethod}
              exclusive
              onChange={handleMethodChange}
              sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, width: '100%', mb: 2 }}
            >
              {paymentMethods.map((m) => (
                <PaymentMethodButton key={m.value} value={m.value}>
                  {m.icon}
                  <Typography variant="caption" fontWeight={600}>
                    {m.label}
                  </Typography>
                </PaymentMethodButton>
              ))}
            </ToggleButtonGroup>

            <Box sx={{ mb: 2 }}>
              {renderPaymentInput()}
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleAddPayment}
                disabled={!amountInput || parseFloat(amountInput) <= 0}
                startIcon={<AddIcon />}
                sx={{ minHeight: 48, borderRadius: 12 }}
              >
                {t('pos.addPayment')}
              </Button>
              <Button
                variant="outlined"
                onClick={() => setSplitMode(!splitMode)}
                startIcon={<CallSplit />}
                sx={{ minHeight: 48, borderRadius: 12, minWidth: 48 }}
              >
                {t('pos.splitPayment')}
              </Button>
            </Box>
          </>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          {t('pos.printReceipt')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <FormControlLabel
            control={
              <Checkbox checked={printThermal58} onChange={(e) => setPrintThermal58(e.target.checked)} />
            }
            label="Thermal 58mm"
          />
          <FormControlLabel
            control={
              <Checkbox checked={printThermal80} onChange={(e) => setPrintThermal80(e.target.checked)} />
            }
            label="Thermal 80mm"
          />
          <FormControlLabel
            control={
              <Checkbox checked={printA4} onChange={(e) => setPrintA4(e.target.checked)} />
            }
            label="A4"
          />
          <FormControlLabel
            control={
              <Checkbox checked={printWhatsApp} onChange={(e) => setPrintWhatsApp(e.target.checked)} />
            }
            label="WhatsApp"
          />
        </Box>

        {lastInvoiceNumber && (
          <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.success.main, 0.08), borderRadius: 2 }}>
            <Typography variant="body2" color="success.main" fontWeight={600}>
              {t('pos.invoiceNumber')}: {lastInvoiceNumber}
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.06) }}>
          <Typography variant="caption" color="text.secondary">
            {t('pos.items')}: {cart.length}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
            {t('pos.subtotal')}: {formatCurrency(totals.subtotal)}
          </Typography>
          {totals.totalDiscount > 0 && (
            <Typography variant="caption" color="error" sx={{ ml: 2 }}>
              {t('pos.discount')}: -{formatCurrency(totals.totalDiscount)}
            </Typography>
          )}
          {selectedCustomer && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
              {t('pos.customer')}: {selectedCustomer.name}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          onClick={handleClose}
          disabled={isProcessing}
          sx={{ minHeight: 48, borderRadius: 12 }}
        >
          {t('common.cancel')}
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleCompleteSale}
          disabled={!isFullyPaid || isProcessing}
          startIcon={isProcessing ? undefined : <Receipt />}
          sx={{ minHeight: 48, borderRadius: 12, flex: 1, fontWeight: 700, fontSize: '1rem' }}
        >
          {isProcessing ? t('pos.processing') : t('pos.completeSale')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}