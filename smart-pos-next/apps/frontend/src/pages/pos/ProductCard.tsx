import { forwardRef, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  styled,
  alpha,
  useTheme,
} from '@mui/material';
import { Add as AddIcon, Inventory2 } from '@mui/icons-material';
import { type Product } from '@/stores/posStore';

const CardContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 14,
  border: `1.5px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  overflow: 'hidden',
  cursor: 'pointer',
  transition: theme.transitions.create(['transform', 'box-shadow', 'border-color'], {
    duration: theme.transitions.duration.short,
    easing: theme.transitions.easing.easeInOut,
  }),
  minHeight: 160,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
    borderColor: theme.palette.primary.main,
  },
  '&:active': {
    transform: 'scale(0.97)',
    boxShadow: theme.shadows[1],
  },
  WebkitTapHighlightColor: 'transparent',
  userSelect: 'none',
}));

const ImageContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: 100,
  backgroundColor: theme.palette.action.hover,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
}));

const ProductImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const StockDot = styled(Box)<{ status: 'green' | 'yellow' | 'red' }>(({ theme, status }) => {
  const colors = {
    green: theme.palette.success.main,
    yellow: theme.palette.warning.main,
    red: theme.palette.error.main,
  };
  return {
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: colors[status],
    border: `2px solid ${theme.palette.background.paper}`,
    position: 'absolute',
    top: 8,
    right: 8,
    boxShadow: `0 0 0 2px ${alpha(colors[status], 0.3)}`,
  };
});

const ContentArea = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 1.5),
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  flex: 1,
  justifyContent: 'space-between',
}));

const QuickAddButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  borderRadius: 10,
  width: 36,
  height: 36,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
  },
}));

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  stockStatus?: 'green' | 'yellow' | 'red';
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(amount);
}

export const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(
  function ProductCard({ product, onAddToCart, stockStatus = 'green' }, ref) {
    const theme = useTheme();

    const handleAdd = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      onAddToCart(product);
    }, [onAddToCart, product]);

    const handleCardClick = useCallback(() => {
      onAddToCart(product);
    }, [onAddToCart, product]);

    return (
      <CardContainer ref={ref} onClick={handleCardClick}>
        <ImageContainer>
          {product.image ? (
            <ProductImage src={product.image} alt={product.name} loading="lazy" />
          ) : (
            <Inventory2 sx={{ fontSize: 40, color: 'text.disabled' }} />
          )}
          <StockDot status={stockStatus} />
        </ImageContainer>
        <ContentArea>
          <Box>
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
              {product.name}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {product.sku}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography
              variant="body2"
              fontWeight={700}
              color="primary"
              sx={{ fontSize: '0.85rem' }}
            >
              {formatPrice(product.sellingPrice)}
            </Typography>
            <QuickAddButton
              size="small"
              onClick={handleAdd}
              aria-label={`Add ${product.name} to cart`}
            >
              <AddIcon fontSize="small" />
            </QuickAddButton>
          </Box>
        </ContentArea>
      </CardContainer>
    );
  }
);