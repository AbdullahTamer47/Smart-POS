import { useState, useCallback, useMemo } from 'react';
import {
  Autocomplete,
  TextField,
  InputAdornment,
  Box,
  Typography,
  Chip,
  styled,
  alpha,
  useTheme,
  CircularProgress,
  autocompleteClasses,
} from '@mui/material';
import {
  Person as PersonIcon,
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { type Customer } from '@/stores/posStore';
import api from '@/api/endpoints';

const StyledAutocomplete = styled(Autocomplete<Customer, false, true, false>)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 14,
    backgroundColor: theme.palette.action.hover,
    '& fieldset': {
      borderWidth: '1.5px',
    },
    '&:hover fieldset': {
      borderWidth: '1.5px',
    },
    '&.Mui-focused fieldset': {
      borderWidth: '2px',
    },
  },
  [`& .${autocompleteClasses.listbox}`]: {
    padding: theme.spacing(1),
    [`& .${autocompleteClasses.option}`]: {
      borderRadius: 10,
      margin: '2px 0',
      padding: '10px 12px',
    },
  },
}));

const TierBadge = styled(Chip)<{ tier: string }>(({ theme, tier }) => {
  const colors: Record<string, string> = {
    GOLD: theme.palette.warning.main,
    PLATINUM: theme.palette.secondary.main,
    SILVER: '#9E9E9E',
    REGULAR: theme.palette.text.secondary,
  };
  return {
    backgroundColor: alpha(colors[tier] || theme.palette.text.secondary, 0.12),
    color: colors[tier] || theme.palette.text.secondary,
    fontWeight: 600,
    fontSize: '0.75rem',
    height: 24,
    border: `1.5px solid ${alpha(colors[tier] || theme.palette.text.secondary, 0.3)}`,
  };
});

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(amount);
}

interface CustomerSelectProps {
  value: Customer | undefined;
  onChange: (customer: Customer | null) => void;
}

export function CustomerSelect({ value, onChange }: CustomerSelectProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [inputValue, setInputValue] = useState('');

  const { data: customersData, isLoading } = useQuery({
    queryKey: ['customers', 'search', inputValue],
    queryFn: () => {
      if (inputValue.length < 2) {
        return api.customers.getCustomers({ page: 1, limit: 20 });
      }
      return api.customers.getCustomers({
        page: 1,
        limit: 20,
        search: inputValue,
      });
    },
    staleTime: 30000,
    enabled: inputValue.length >= 2 || inputValue.length === 0,
  });

  const customers = useMemo(() => {
    const data = customersData as { data: Array<Record<string, unknown>> } | undefined;
    if (!data?.data) return [];
    return data.data.map((c: Record<string, unknown>) => ({
      id: c.id as string,
      name: (c.fullName as string) || (c.name as string) || '',
      phone: c.phone as string,
      email: c.email as string,
      loyaltyPoints: (c.loyaltyPoints as number) ?? 0,
      creditLimit: (c.creditLimit as number) ?? 0,
      balance: (c.balance as number) ?? 0,
      tier: (c.tier as string) || 'REGULAR',
    })) as (Customer & { tier: string })[];
  }, [customersData]);

  const handleInputChange = useCallback((_e: React.SyntheticEvent, value: string) => {
    setInputValue(value);
  }, []);

  return (
    <StyledAutocomplete
      value={value}
      onChange={(_e, newValue) => onChange(newValue ?? undefined)}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      options={customers}
      getOptionLabel={(option) => {
        if (typeof option === 'string') return option;
        return `${option.name}${option.phone ? ` - ${option.phone}` : ''}`;
      }}
      getOptionKey={(option) => option.id}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      loading={isLoading}
      noOptionsText={t('common.noResults')}
      loadingText={t('common.loading')}
      filterOptions={(x) => x}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          placeholder={t('pos.selectCustomer')}
          slotProps={{
            input: {
              ...params.InputProps,
              startAdornment: params.InputProps.startAdornment || (
                <InputAdornment position="start">
                  <PersonIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <>
                  {isLoading ? <CircularProgress size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
      renderOption={(props, option) => {
        const { key, ...rest } = props;
        return (
          <Box component="li" key={key} {...rest}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {option.name}
                </Typography>
                {(option as Customer & { tier?: string }).tier && (
                  <TierBadge
                    label={(option as Customer & { tier?: string }).tier}
                    size="small"
                    tier={(option as Customer & { tier?: string }).tier || 'REGULAR'}
                    icon={<StarIcon sx={{ fontSize: '0.75rem !important' }} />}
                  />
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, mt: 0.25 }}>
                {option.phone && (
                  <Typography variant="caption" color="text.secondary">
                    {option.phone}
                  </Typography>
                )}
                {(option.balance || option.balance === 0) && (
                  <Typography variant="caption" color={option.balance > 0 ? 'error' : 'text.secondary'}>
                    {t('customers.balance')}: {formatCurrency(option.balance)}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        );
      }}
      renderTags={() => null}
      fullWidth
      clearOnBlur
      autoComplete
      slotProps={{
        paper: {
          sx: {
            borderRadius: 14,
            boxShadow: theme.shadows[8],
          },
        },
      }}
    />
  );
}