import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Chip,
  Typography,
  Badge,
  Tooltip,
  Paper,
  Dialog,
  DialogContent,
  Alert,
  Skeleton,
  Stack,
  styled,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  QrCodeScanner as BarcodeIcon,
  Pause as HoldIcon,
  RestartAlt as NewSaleIcon,
  ShoppingCart as CartIcon,
  ReceiptLong as ReceiptIcon,
  Keyboard as KeyboardIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Save as SaveIcon,
  LocalOffer as CouponIcon,
  CardGiftcard as GiftCardIcon,
  ShoppingCartCheckout,
  Inventory2,
  PersonAdd,
  Storefront,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VirtuosoGrid } from 'react-virtuoso';
import { usePOSStore, type Product, type Customer, type Coupon, type GiftCard, type Payment } from '@/stores/posStore';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import api from '@/api/endpoints';
import { ProductCard } from './ProductCard';
import { CartItem } from './CartItem';
import { PaymentModal } from './PaymentModal';
import { CustomerSelect } from './CustomerSelect';
import { HeldInvoicesDialog } from './HeldInvoicesDialog';

const StyledContainer = styled(Box)(({ theme }) => ({
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  backgroundColor: theme.palette.background.default,
}));

const TopBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  minHeight: 56,
  flexShrink: 0,
  flexWrap: 'wrap',
}));

const SearchField = styled(TextField)(({ theme }) => ({
  minWidth: 280,
  maxWidth: 400,
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.action.hover,
    borderRadius: 28,
    '& fieldset': { border: 'none' },
    '&:hover fieldset': { border: 'none' },
    '&.Mui-focused fieldset': { border: `2px solid ${theme.palette.primary.main}` },
  },
  '& .MuiInputBase-input': {
    padding: '10px 16px',
    fontSize: '0.875rem',
  },
}));

const MainContent = styled(Box)({
  display: 'flex',
  flex: 1,
  overflow: 'hidden',
});

const LeftPanel = styled(Box)(({ theme }) => ({
  flex: '0 0 60%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  borderRight: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.down('lg')]: {
    flex: '0 0 55%',
  },
}));

const RightPanel = styled(Box)(({ theme }) => ({
  flex: '1 1 40%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.down('lg')]: {
    flex: '1 1 45%',
  },
}));

const CategoryTabs = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(0.5),
  padding: theme.spacing(1, 2),
  overflowX: 'auto',
  flexShrink: 0,
  '&::-webkit-scrollbar': { height: 4 },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.divider,
    borderRadius: 2,
  },
}));

const ProductGridContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  '& .virtuoso-grid-list': {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: theme.spacing(1),
    padding: theme.spacing(1, 2),
    [theme.breakpoints.down('xl')]: {
      gridTemplateColumns: 'repeat(3, 1fr)',
    },
    [theme.breakpoints.down('lg')]: {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
  },
}));

const QuickKeysBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 2),
  overflowX: 'auto',
  flexShrink: 0,
  borderTop: `1px solid ${theme.palette.divider}`,
  '&::-webkit-scrollbar': { height: 4 },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.divider,
    borderRadius: 2,
  },
}));

const CartHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1.5, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  flexShrink: 0,
}));

const CartItemsContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  '&::-webkit-scrollbar': { width: 6 },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.divider,
    borderRadius: 3,
  },
}));

const CartSummary = styled(Paper)(({ theme }) => ({
  flexShrink: 0,
  padding: theme.spacing(2),
  margin: theme.spacing(1, 2, 2),
  borderRadius: 16,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.action.hover,
}));

const SummaryRow = styled(Box)<{ highlight?: boolean }>(({ theme, highlight }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(0.5, 0),
  ...(highlight && {
    marginTop: theme.spacing(1),
    paddingTop: theme.spacing(1.5),
    borderTop: `2px solid ${theme.palette.divider}`,
  }),
}));

const EmptyState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  gap: theme.spacing(2),
  color: theme.palette.text.secondary,
  padding: theme.spacing(4),
  textAlign: 'center',
}));

const SkeletonCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderRadius: 12,
  border: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

const ActiveScanBadge = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 2000,
  backgroundColor: alpha(theme.palette.primary.main, 0.95),
  color: '#fff',
  textAlign: 'center',
  padding: '6px',
  fontSize: '0.875rem',
  fontWeight: 600,
  animation: 'pulse 1.5s infinite',
  '@keyframes pulse': {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.85 },
  },
}));

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(amount);
}

function getStockStatus(stock: number, minStock: number): 'green' | 'yellow' | 'red' {
  if (stock <= 0) return 'red';
  if (stock <= minStock) return 'yellow';
  return 'green';
}

export default function POSPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const queryClient = useQueryClient();

  const {
    cart,
    isScanning,
    searchQuery,
    selectedCategory,
    selectedCustomer,
    appliedCoupon,
    appliedGiftCard,
    payments,
    isProcessing,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateDiscount,
    clearCart,
    setCustomer,
    setCoupon,
    removeCoupon,
    setGiftCard,
    removeGiftCard,
    addPayment,
    removePayment,
    setScanning,
    setSearchQuery,
    setSelectedCategory,
    quickKeys,
    setQuickKeys,
    setProcessing,
    calculateTotals,
  } = usePOSStore();

  const { user } = useAuthStore();
  const { isOffline } = useAppStore();

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [heldDialogOpen, setHeldDialogOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [giftCardInput, setGiftCardInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [giftCardError, setGiftCardError] = useState('');
  const [saleSuccess, setSaleSuccess] = useState(false);
  const [lastInvoiceNumber, setLastInvoiceNumber] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const scanBufferRef = useRef('');
  const scanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [localSearch, setLocalSearch] = useState(searchQuery);

  const debouncedSearch = useCallback((value: string) => {
    setLocalSearch(value);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setSearchQuery(value);
    }, 100);
  }, [setSearchQuery]);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', 'pos', selectedCategory, searchQuery],
    queryFn: async () => {
      const params: Record<string, unknown> = {
        page: 1,
        limit: 1000,
        isActive: true,
      };
      if (searchQuery) {
        return api.products.searchProducts(searchQuery, { page: 1, limit: 1000 });
      }
      if (selectedCategory) {
        (params as Record<string, unknown>).categoryId = selectedCategory;
      }
      return api.products.getProducts({ page: 1, limit: 1000, ...params });
    },
    staleTime: 30000,
  });

  const products = useMemo(() => {
    const data = productsData as { data: Array<Record<string, unknown>> } | undefined;
    if (!data?.data) return [];
    return data.data.map((p: Record<string, unknown>) => ({
      id: p.id as string,
      name: (p.nameAr as string) || (p.name as string) || '',
      nameAr: p.nameAr as string,
      nameEn: p.nameEn as string,
      sku: p.sku as string,
      barcode: p.barcode as string,
      image: p.image as string,
      categoryId: p.categoryId as string,
      categoryName: p.categoryName as string,
      unit: p.unit as string,
      costPrice: p.costPrice as number,
      sellingPrice: p.sellingPrice as number,
      taxRate: p.taxRate as number || 0,
      isActive: (p.isActive as boolean) ?? true,
      hasExpiry: (p.hasExpiry as boolean) ?? false,
      hasVariants: (p.hasVariants as boolean) ?? false,
      stock: (p.stock as number) ?? 0,
      minStock: (p.minStock as number) ?? 0,
    })) as Product[];
  }, [productsData]);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories', 'pos'],
    queryFn: () => api.categories.getCategories({ page: 1, limit: 100 }),
    staleTime: 60000,
  });

  const categories = useMemo(() => {
    const data = categoriesData as { data: Array<Record<string, unknown>> } | undefined;
    if (!data?.data) return [];
    return data.data.map((c: Record<string, unknown>) => ({
      id: c.id as string,
      name: (c.nameAr as string) || (c.name as string) || '',
      productCount: (c.productCount as number) ?? 0,
    }));
  }, [categoriesData]);

  const { data: favoritesData } = useQuery({
    queryKey: ['products', 'favorites'],
    queryFn: () => api.products.getProducts({ page: 1, limit: 20, sortBy: 'totalSales', sortOrder: 'desc' }),
    staleTime: 300000,
  });

  useEffect(() => {
    const data = favoritesData as { data: Array<Record<string, unknown>> } | undefined;
    if (data?.data && quickKeys.length === 0) {
      setQuickKeys(data.data.slice(0, 10).map((p: Record<string, unknown>) => ({
        id: p.id as string,
        name: (p.nameAr as string) || (p.name as string) || '',
        nameAr: p.nameAr as string,
        nameEn: p.nameEn as string,
        sku: p.sku as string,
        barcode: p.barcode as string,
        image: p.image as string,
        categoryId: p.categoryId as string,
        unit: p.unit as string,
        costPrice: p.costPrice as number,
        sellingPrice: p.sellingPrice as number,
        taxRate: p.taxRate as number || 0,
        isActive: true,
        hasExpiry: false,
        hasVariants: false,
      })) as Product[]);
    }
  }, [favoritesData, quickKeys.length, setQuickKeys]);

  const createInvoiceMutation = useMutation({
    mutationFn: async () => {
      const totals = calculateTotals();
      const items = cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        discountType: item.discountType,
        taxRate: item.taxRate,
        variantId: item.variant?.id,
      }));
      const paymentDtos = payments.map((p) => ({
        method: p.method,
        amount: p.amount,
        reference: p.reference,
      }));
      return api.invoices.createInvoice({
        customerId: selectedCustomer?.id,
        items,
        discount: totals.totalDiscount,
        discountType: 'fixed',
        notes: '',
        payments: paymentDtos,
        couponCode: appliedCoupon?.code,
        giftCardCode: appliedGiftCard?.code,
      });
    },
    onSuccess: (data) => {
      const invoiceData = data as { invoiceNumber: string };
      setLastInvoiceNumber(invoiceData.invoiceNumber || '');
      setSaleSuccess(true);
      setPaymentModalOpen(false);
      setTimeout(() => {
        setSaleSuccess(false);
        clearCart();
        setLastInvoiceNumber('');
      }, 3000);
    },
    onError: () => {
      setProcessing(false);
    },
  });

  const validateCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      const totals = calculateTotals();
      return api.coupons.validateCoupon(code, totals.grandTotal);
    },
    onSuccess: (data) => {
      const couponData = data as { valid: boolean; discountType: string; discountValue: number; maxDiscount?: number; message?: string };
      if (couponData.valid) {
        setCoupon({
          id: `coupon-${Date.now()}`,
          code: couponInput,
          discountType: couponData.discountType as 'percentage' | 'fixed',
          discountValue: couponData.discountValue,
          maxDiscount: couponData.maxDiscount,
        });
        setCouponInput('');
        setCouponError('');
      } else {
        setCouponError(couponData.message || t('pos.invalidCoupon'));
      }
    },
    onError: () => {
      setCouponError(t('pos.invalidCoupon'));
    },
  });

  const validateGiftCardMutation = useMutation({
    mutationFn: async (code: string) => {
      return api.giftCards.validateGiftCard(code);
    },
    onSuccess: (data) => {
      const gcData = data as { valid: boolean; balance: number; code: string };
      if (gcData.valid) {
        setGiftCard({
          id: `gc-${Date.now()}`,
          code: gcData.code,
          balance: gcData.balance,
          isActive: true,
        });
        setGiftCardInput('');
        setGiftCardError('');
      } else {
        setGiftCardError(t('giftCards.invalidGiftCard'));
      }
    },
    onError: () => {
      setGiftCardError(t('giftCards.invalidGiftCard'));
    },
  });

  const handleApplyCoupon = useCallback(() => {
    if (!couponInput.trim()) return;
    validateCouponMutation.mutate(couponInput.trim());
  }, [couponInput, validateCouponMutation]);

  const handleApplyGiftCard = useCallback(() => {
    if (!giftCardInput.trim()) return;
    validateGiftCardMutation.mutate(giftCardInput.trim());
  }, [giftCardInput, validateGiftCardMutation]);

  const handleBarcodeScanned = useCallback((barcode: string) => {
    const found = products.find((p) => p.barcode === barcode);
    if (found) {
      addToCart(found, 1);
    } else {
      const allProducts = productsData as { data: Array<Record<string, unknown>> } | undefined;
      if (allProducts?.data) {
        const match = allProducts.data.find((p: Record<string, unknown>) => p.barcode === barcode);
        if (match) {
          addToCart({
            id: match.id as string,
            name: (match.nameAr as string) || (match.name as string) || '',
            nameAr: match.nameAr as string,
            nameEn: match.nameEn as string,
            sku: match.sku as string,
            barcode: match.barcode as string,
            image: match.image as string,
            categoryId: match.categoryId as string,
            unit: match.unit as string,
            costPrice: match.costPrice as number,
            sellingPrice: match.sellingPrice as number,
            taxRate: match.taxRate as number || 0,
            isActive: true,
            hasExpiry: false,
            hasVariants: false,
          } as Product, 1);
        }
      }
    }
  }, [products, productsData, addToCart]);

  useEffect(() => {
    if (!isScanning) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const barcode = scanBufferRef.current;
        scanBufferRef.current = '';
        if (barcode) {
          handleBarcodeScanned(barcode);
        }
        return;
      }
      if (e.key.length === 1) {
        scanBufferRef.current += e.key;
        if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
        scanTimerRef.current = setTimeout(() => {
          scanBufferRef.current = '';
        }, 50);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
    };
  }, [isScanning, handleBarcodeScanned]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case 'F1':
          e.preventDefault();
          searchInputRef.current?.focus();
          break;
        case 'F2':
          e.preventDefault();
          setScanning(!isScanning);
          break;
        case 'F3':
          e.preventDefault();
          setHeldDialogOpen(true);
          break;
        case 'F5':
          e.preventDefault();
          if (cart.length > 0) {
            const confirmed = window.confirm(t('pos.clearCart'));
            if (confirmed) clearCart();
          }
          break;
        case 'F8':
          e.preventDefault();
          if (cart.length > 0) setPaymentModalOpen(true);
          break;
        case 'Escape':
          e.preventDefault();
          setPaymentModalOpen(false);
          setHeldDialogOpen(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isScanning, setScanning, cart.length, clearCart, t]);

  const handleCompleteSale = useCallback(() => {
    setProcessing(true);
    createInvoiceMutation.mutate();
  }, [setProcessing, createInvoiceMutation]);

  const totals = useMemo(() => calculateTotals(), [calculateTotals]);

  const handleAddProduct = useCallback((product: Product) => {
    addToCart(product, 1);
  }, [addToCart]);

  const filteredProducts = useMemo(() => {
    if (!localSearch) return products;
    const q = localSearch.toLowerCase();
    return products.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      (p.nameAr || '').toLowerCase().includes(q) ||
      (p.nameEn || '').toLowerCase().includes(q) ||
      (p.sku || '').toLowerCase().includes(q) ||
      (p.barcode || '').toLowerCase().includes(q)
    );
  }, [products, localSearch]);

  const renderProductGrid = () => {
    if (productsLoading) {
      return (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, p: 2 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i}>
              <Skeleton variant="rounded" width="100%" height={100} />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="40%" />
            </SkeletonCard>
          ))}
        </Box>
      );
    }

    if (filteredProducts.length === 0) {
      return (
        <EmptyState>
          <Inventory2 sx={{ fontSize: 64, color: 'text.disabled' }} />
          <Typography variant="h6" color="text.secondary">
            {searchQuery ? t('pos.noProducts') : t('common.noResults')}
          </Typography>
          {searchQuery && (
            <Button variant="text" onClick={() => debouncedSearch('')}>
              {t('common.clearFilters')}
            </Button>
          )}
        </EmptyState>
      );
    }

    return (
      <VirtuosoGrid
        useWindowScroll={false}
        totalCount={filteredProducts.length}
        listClassName="virtuoso-grid-list"
        itemContent={(index) => (
          <ProductCard
            product={filteredProducts[index]!}
            onAddToCart={handleAddProduct}
            stockStatus={getStockStatus(
              (filteredProducts[index] as Product & { stock?: number })?.stock ?? 0,
              (filteredProducts[index] as Product & { minStock?: number })?.minStock ?? 0
            )}
          />
        )}
        overscan={20}
      />
    );
  };

  return (
    <StyledContainer>
      {isScanning && (
        <ActiveScanBadge>
          {t('pos.scanning')} - {t('pos.stopScanning')} (F2)
        </ActiveScanBadge>
      )}

      {isOffline && (
        <Alert severity="warning" sx={{ borderRadius: 0 }}>
          {t('errors.networkError')} - {t('common.cancel')}
        </Alert>
      )}

      {saleSuccess && (
        <Alert
          severity="success"
          sx={{ borderRadius: 0 }}
          onClose={() => {
            setSaleSuccess(false);
            setLastInvoiceNumber('');
          }}
        >
          {t('pos.saleComplete')}
          {lastInvoiceNumber && ` - ${t('pos.invoiceNumber')}: ${lastInvoiceNumber}`}
        </Alert>
      )}

      <TopBar>
        <Storefront sx={{ color: 'primary.main', mr: 1 }} />
        <SearchField
          placeholder={t('pos.searchProducts')}
          value={localSearch}
          onChange={(e) => debouncedSearch(e.target.value)}
          inputRef={searchInputRef}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: localSearch ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => debouncedSearch('')}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
        />

        <Tooltip title={`${t('pos.scanBarcode')} (F2)`}>
          <IconButton
            color={isScanning ? 'primary' : 'default'}
            onClick={() => setScanning(!isScanning)}
            sx={{ border: isScanning ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent' }}
          >
            <BarcodeIcon />
          </IconButton>
        </Tooltip>

        <Box sx={{ flex: 1 }} />

        <Tooltip title={t('pos.holdInvoice') + ' (F3)'}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<HoldIcon />}
            onClick={() => setHeldDialogOpen(true)}
            disabled={cart.length === 0}
            sx={{ minWidth: 44, minHeight: 44 }}
          >
            {t('pos.holdInvoice')}
          </Button>
        </Tooltip>

        <Tooltip title={t('pos.newSale') + ' (F5)'}>
          <Button
            variant="outlined"
            size="small"
            color="error"
            startIcon={<NewSaleIcon />}
            onClick={() => {
              if (cart.length > 0) {
                const confirmed = window.confirm(t('pos.clearCart'));
                if (confirmed) clearCart();
              }
            }}
            sx={{ minWidth: 44, minHeight: 44 }}
          >
            {t('pos.newSale')}
          </Button>
        </Tooltip>

        <Tooltip title={t('common.keyboard') + ' (F1-F8)'}>
          <IconButton size="small">
            <KeyboardIcon />
          </IconButton>
        </Tooltip>
      </TopBar>

      <CategoryTabs>
        <Chip
          label={t('pos.allProducts')}
          clickable
          color={!selectedCategory ? 'primary' : 'default'}
          variant={!selectedCategory ? 'filled' : 'outlined'}
          onClick={() => setSelectedCategory(null)}
          size="medium"
        />
        {categories.map((cat) => (
          <Chip
            key={cat.id}
            label={`${cat.name}${cat.productCount ? ` (${cat.productCount})` : ''}`}
            clickable
            color={selectedCategory === cat.id ? 'primary' : 'default'}
            variant={selectedCategory === cat.id ? 'filled' : 'outlined'}
            onClick={() => setSelectedCategory(cat.id)}
            size="medium"
          />
        ))}
      </CategoryTabs>

      <MainContent>
        <LeftPanel>
          {renderProductGrid()}

          {quickKeys.length > 0 && (
            <QuickKeysBar>
              {quickKeys.map((product) => (
                <Chip
                  key={product.id}
                  label={product.name}
                  avatar={
                    product.image ? (
                      <Box
                        component="img"
                        src={product.image}
                        sx={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : undefined
                  }
                  clickable
                  onClick={() => handleAddProduct(product)}
                  variant="outlined"
                  size="medium"
                  sx={{ minHeight: 44, fontWeight: 600 }}
                />
              ))}
            </QuickKeysBar>
          )}
        </LeftPanel>

        <RightPanel>
          <CartHeader>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Badge badgeContent={cart.length} color="primary">
                <CartIcon />
              </Badge>
              <Typography variant="h6" fontWeight={600}>
                {t('pos.cart')}
              </Typography>
            </Box>
            {cart.length > 0 && (
              <IconButton
                size="small"
                color="error"
                onClick={() => {
                  const confirmed = window.confirm(t('pos.clearCart'));
                  if (confirmed) clearCart();
                }}
                title={t('pos.clearCart')}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </CartHeader>

          {cart.length === 0 ? (
            <EmptyState>
              <ShoppingCartCheckout sx={{ fontSize: 80, color: 'text.disabled' }} />
              <Typography variant="h6" color="text.secondary">
                {t('pos.emptyCart')}
              </Typography>
              <Typography variant="body2" color="text.disabled">
                {t('pos.searchProducts')}
              </Typography>
            </EmptyState>
          ) : (
            <CartItemsContainer>
              <Stack spacing={0.5} sx={{ p: 1 }}>
                {cart.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onUpdateDiscount={updateDiscount}
                    onRemove={removeFromCart}
                  />
                ))}
              </Stack>
            </CartItemsContainer>
          )}

          {cart.length > 0 && (
            <>
              <Box sx={{ px: 2, pb: 1, flexShrink: 0 }}>
                <CustomerSelect
                  value={selectedCustomer ?? undefined}
                  onChange={(c) => setCustomer(c ?? null)}
                />
              </Box>

              <Box sx={{ px: 2, pb: 1, flexShrink: 0, display: 'flex', gap: 1 }}>
                {!appliedCoupon ? (
                  <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
                    <TextField
                      size="small"
                      placeholder={t('pos.couponCode')}
                      value={couponInput}
                      onChange={(e) => { setCouponInput(e.target.value); setCouponError(''); }}
                      error={!!couponError}
                      helperText={couponError}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <CouponIcon fontSize="small" color="action" />
                            </InputAdornment>
                          ),
                        },
                      }}
                      fullWidth
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleApplyCoupon}
                      disabled={!couponInput.trim() || validateCouponMutation.isPending}
                      sx={{ minWidth: 44, minHeight: 44 }}
                    >
                      {t('common.apply')}
                    </Button>
                  </Box>
                ) : (
                  <Chip
                    icon={<CouponIcon />}
                    label={`${appliedCoupon.code} (${appliedCoupon.discountValue}${appliedCoupon.discountType === 'percentage' ? '%' : ''})`}
                    onDelete={removeCoupon}
                    color="primary"
                    variant="outlined"
                    size="medium"
                  />
                )}
              </Box>

              <Box sx={{ px: 2, pb: 1, flexShrink: 0, display: 'flex', gap: 1 }}>
                {!appliedGiftCard ? (
                  <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
                    <TextField
                      size="small"
                      placeholder={t('pos.giftCard')}
                      value={giftCardInput}
                      onChange={(e) => { setGiftCardInput(e.target.value); setGiftCardError(''); }}
                      error={!!giftCardError}
                      helperText={giftCardError}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <GiftCardIcon fontSize="small" color="action" />
                            </InputAdornment>
                          ),
                        },
                      }}
                      fullWidth
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleApplyGiftCard}
                      disabled={!giftCardInput.trim() || validateGiftCardMutation.isPending}
                      sx={{ minWidth: 44, minHeight: 44 }}
                    >
                      {t('common.apply')}
                    </Button>
                  </Box>
                ) : (
                  <Chip
                    icon={<GiftCardIcon />}
                    label={`${appliedGiftCard.code} (${formatCurrency(appliedGiftCard.balance)})`}
                    onDelete={removeGiftCard}
                    color="secondary"
                    variant="outlined"
                    size="medium"
                  />
                )}
              </Box>

              <CartSummary elevation={0}>
                <SummaryRow>
                  <Typography variant="body2" color="text.secondary">
                    {t('pos.subtotal')}
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {formatCurrency(totals.subtotal)}
                  </Typography>
                </SummaryRow>
                {totals.totalDiscount > 0 && (
                  <SummaryRow>
                    <Typography variant="body2" color="error">
                      {t('pos.discount')}
                    </Typography>
                    <Typography variant="body2" color="error" fontWeight={500}>
                      -{formatCurrency(totals.totalDiscount)}
                    </Typography>
                  </SummaryRow>
                )}
                <SummaryRow>
                  <Typography variant="body2" color="text.secondary">
                    {t('pos.tax')}
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {formatCurrency(totals.totalTax)}
                  </Typography>
                </SummaryRow>
                <SummaryRow highlight>
                  <Typography variant="h6" fontWeight={700}>
                    {t('pos.grandTotal')}
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="primary">
                    {formatCurrency(totals.grandTotal)}
                  </Typography>
                </SummaryRow>
                {payments.length > 0 && (
                  <>
                    <SummaryRow>
                      <Typography variant="body2" color="text.secondary">
                        {t('pos.paid')}
                      </Typography>
                      <Typography variant="body2" color="success.main" fontWeight={500}>
                        {formatCurrency(totals.totalPaid)}
                      </Typography>
                    </SummaryRow>
                    {totals.balance !== 0 && (
                      <SummaryRow>
                        <Typography variant="body2" color={totals.balance > 0 ? 'error' : 'text.secondary'}>
                          {totals.balance > 0 ? t('pos.balance') : t('pos.change')}
                        </Typography>
                        <Typography variant="body2" color={totals.balance > 0 ? 'error' : 'success.main'} fontWeight={500}>
                          {formatCurrency(Math.abs(totals.balance))}
                        </Typography>
                      </SummaryRow>
                    )}
                  </>
                )}
              </CartSummary>

              <Box sx={{ px: 2, pb: 2, flexShrink: 0 }}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={() => setPaymentModalOpen(true)}
                  disabled={isProcessing}
                  sx={{ minHeight: 56, borderRadius: 14, fontSize: '1.1rem', fontWeight: 700 }}
                  startIcon={<ReceiptIcon />}
                >
                  {t('pos.completeSale')} (F8) - {formatCurrency(totals.grandTotal)}
                </Button>
              </Box>
            </>
          )}
        </RightPanel>
      </MainContent>

      <PaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        totals={totals}
        payments={payments}
        onAddPayment={addPayment}
        onRemovePayment={removePayment}
        onCompleteSale={handleCompleteSale}
        isProcessing={isProcessing}
        cart={cart}
        selectedCustomer={selectedCustomer}
        lastInvoiceNumber={lastInvoiceNumber}
      />

      <HeldInvoicesDialog
        open={heldDialogOpen}
        onClose={() => setHeldDialogOpen(false)}
      />
    </StyledContainer>
  );
}