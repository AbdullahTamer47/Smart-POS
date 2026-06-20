import { useState, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Select,
  MenuItem,
  styled,
  alpha,
  useTheme,
  SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  LocalOffer as DiscountIcon,
} from '@mui/icons-material';
import { type CartItem as CartItemType } from '@/stores/posStore';

const ItemRow = styled(Box)<{ swiped: boolean }>(({ theme, swiped }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 1.5),
  borderRadius: 12,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  minHeight: 64,
  position: 'relative',
  overflow: 'hidden',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.standard,
    easing: theme.transitions.easing.easeInOut,
  }),
  transform: swiped ? 'translateX(-80px)' : 'translateX(0)',
  touchAction: 'pan-y',
}));

const DeleteOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: 0,
  top: 0,
  bottom: 0,
  width: 80,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.error.main,
  color: '#fff',
  cursor: 'pointer',
  borderTopRightRadius: 12,
  borderBottomRightRadius: 12,
}));

const QuantityButton = styled(IconButton)(({ theme }) => ({
  width: 36,
  height: 36,
  borderRadius: 10,
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.16),
  },
  '&.Mui-disabled': {
    backgroundColor: alpha(theme.palette.action.disabled, 0.08),
    color: theme.palette.action.disabled,
  },
}));

const QuantityDisplay = styled(TextField)(({ theme }) => ({
  width: 52,
  '& .MuiOutlinedInput-root': {
    borderRadius: 10,
    '& input': {
      textAlign: 'center',
      padding: '6px 4px',
      fontSize: '0.9rem',
      fontWeight: 700,
      MozAppearance: 'textfield',
      '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': {
        WebkitAppearance: 'none',
        margin: 0,
      },
    },
    '& fieldset': {
      borderWidth: '1.5px !important',
    },
  },
}));

const DiscountField = styled(TextField)(({ theme }) => ({
  width: 80,
  '& .MuiOutlinedInput-root': {
    borderRadius: 10,
    '& input': {
      textAlign: 'right',
      padding: '6px 8px',
      fontSize: '0.8rem',
    },
    '& fieldset': {
      borderWidth: '1.5px !important',
    },
  },
}));

const DiscountTypeSelect = styled(Select)(({ theme }) => ({
  borderRadius: 10,
  '& .MuiSelect-select': {
    padding: '6px 24px 6px 8px',
    fontSize: '0.75rem',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderWidth: '1.5px !important',
  },
  width: 70,
}));

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(amount);
}

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onUpdateDiscount: (itemId: string, discount: number, discountType: 'percentage' | 'fixed') => void;
  onRemove: (itemId: string) => void;
}

export function CartItem({ item, onUpdateQuantity, onUpdateDiscount, onRemove }: CartItemProps) {
  const [swiped, setSwiped] = useState(false);
  const [discountInput, setDiscountInput] = useState(
    item.discount > 0 ? String(item.discount) : ''
  );
  const [showDiscount, setShowDiscount] = useState(item.discount > 0);
  const touchStartRef = useRef(0);
  const touchCurrentRef = useRef(0);
  const theme = useTheme();

  const lineTotal = item.unitPrice * item.quantity;
  const discountAmount =
    item.discountType === 'percentage'
      ? (lineTotal * item.discount) / 100
      : item.discount;
  const afterDiscount = lineTotal - discountAmount;
  const taxAmount = (afterDiscount * item.taxRate) / 100;
  const total = afterDiscount + taxAmount;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0]!.clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchCurrentRef.current = e.touches[0]!.clientX;
    const diff = touchStartRef.current - touchCurrentRef.current;
    if (diff > 40) {
      setSwiped(true);
    } else if (diff < -20) {
      setSwiped(false);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartRef.current - touchCurrentRef.current;
    if (diff > 80) {
      setSwiped(true);
    }
  }, []);

  const handleSwipeDelete = useCallback(() => {
    onRemove(item.id);
    setSwiped(false);
  }, [item.id, onRemove]);

  const handleDiscountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDiscountInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      onUpdateDiscount(item.id, num, item.discountType);
    }
  }, [item.id, item.discountType, onUpdateDiscount]);

  const handleDiscountTypeChange = useCallback((e: SelectChangeEvent<unknown>) => {
    const type = e.target.value as 'percentage' | 'fixed';
    const num = parseFloat(discountInput) || 0;
    if (num > 0) {
      onUpdateDiscount(item.id, num, type);
    }
  }, [item.id, discountInput, onUpdateDiscount]);

  const handleQuantityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 0) {
      onUpdateQuantity(item.id, val);
    }
  }, [item.id, onUpdateQuantity]);

  return (
    <Box sx={{ position: 'relative' }}>
      <ItemRow
        swiped={swiped}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: 1.3,
            }}
            dir="auto"
          >
            {item.product.name}
          </Typography>
          {item.variant && (
            <Typography variant="caption" color="text.secondary">
              {item.variant.name}: {item.variant.value}
            </Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {formatCurrency(item.unitPrice)}
            </Typography>
            {item.discount > 0 && (
              <Typography variant="caption" color="error" sx={{ fontWeight: 600 }}>
                -{item.discountType === 'percentage' ? `${item.discount}%` : formatCurrency(item.discount)}
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <QuantityButton
              size="small"
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <RemoveIcon sx={{ fontSize: 18 }} />
            </QuantityButton>
            <QuantityDisplay
              size="small"
              type="number"
              value={item.quantity}
              onChange={handleQuantityChange}
              slotProps={{ htmlInput: { min: 0, inputMode: 'numeric' } }}
            />
            <QuantityButton
              size="small"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            >
              <AddIcon sx={{ fontSize: 18 }} />
            </QuantityButton>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5, minWidth: 70 }}>
          <Typography variant="body2" fontWeight={700} color="primary">
            {formatCurrency(total)}
          </Typography>
          <IconButton
            size="small"
            onClick={() => setShowDiscount(!showDiscount)}
            color={showDiscount ? 'warning' : 'default'}
            sx={{ width: 28, height: 28 }}
          >
            <DiscountIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>

        <IconButton
          size="small"
          color="error"
          onClick={() => onRemove(item.id)}
          sx={{ width: 32, height: 32 }}
        >
          <DeleteIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </ItemRow>

      {showDiscount && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1.5,
            pb: 1,
            backgroundColor: alpha(theme.palette.warning.main, 0.04),
            borderRadius: '0 0 12px 12px',
            border: `1px solid ${theme.palette.divider}`,
            borderTop: 'none',
            mt: '-4px',
          }}
        >
          <DiscountIcon sx={{ fontSize: 16, color: 'warning.main' }} />
          <DiscountField
            size="small"
            type="number"
            placeholder="0"
            value={discountInput}
            onChange={handleDiscountChange}
            slotProps={{ htmlInput: { min: 0, inputMode: 'decimal' } }}
          />
          <DiscountTypeSelect
            size="small"
            value={item.discountType}
            onChange={handleDiscountTypeChange}
          >
            <MenuItem value="percentage">%</MenuItem>
            <MenuItem value="fixed">{formatCurrency(0).charAt(0)}</MenuItem>
          </DiscountTypeSelect>
        </Box>
      )}

      {swiped && (
        <DeleteOverlay onClick={handleSwipeDelete}>
          <DeleteIcon sx={{ fontSize: 28 }} />
        </DeleteOverlay>
      )}
    </Box>
  );
}