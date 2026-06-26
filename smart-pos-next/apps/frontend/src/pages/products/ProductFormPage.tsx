import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  Autocomplete,
  IconButton,
  Chip,
  Avatar,
  Paper,
  Alert,
  Skeleton,
  InputAdornment,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ArrowBack as BackIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray, Controller, type Control, type UseFormRegister } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api, {
  type ProductResponse,
  type CategoryResponse,
  type PriceListResponse,
  type WarehouseResponse,
  type StockResponse,
} from '@/api/endpoints';

const productSchema = z.object({
  nameAr: z.string().min(1, 'Required'),
  nameEn: z.string().min(1, 'Required'),
  descriptionAr: z.string().optional().default(''),
  descriptionEn: z.string().optional().default(''),
  categoryId: z.string().optional().nullable(),
  sku: z.string().min(1, 'Required'),
  barcode: z.string().optional().default(''),
  unit: z.string().min(1, 'Required'),
  hasExpiry: z.boolean().default(false),
  expiryDays: z.number().optional().nullable(),
  isComposite: z.boolean().default(false),
  isActive: z.boolean().default(true),
  costPrice: z.coerce.number().min(0).default(0),
  sellingPrice: z.coerce.number().min(0).default(0),
  wholesalePrice: z.coerce.number().min(0).optional().nullable(),
  lowStockAlert: z.coerce.number().min(0).optional().nullable(),
  image: z.string().optional().default(''),
  variantGroups: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      options: z.array(
        z.object({
          name: z.string(),
          value: z.string(),
          sku: z.string().optional().default(''),
          barcode: z.string().optional().default(''),
          price: z.coerce.number().min(0).optional().default(0),
        })
      ),
    })
  ).optional().default([]),
  priceOverrides: z.array(
    z.object({
      priceListId: z.string(),
      priceListName: z.string(),
      price: z.coerce.number().min(0),
    })
  ).optional().default([]),
  alternativeUnits: z.array(
    z.object({
      unit: z.string(),
      barcode: z.string().optional().default(''),
      conversionRate: z.coerce.number().min(0.0001),
    })
  ).optional().default([]),
});

type ProductFormValues = z.infer<typeof productSchema>;

function generateSku(categoryName?: string): string {
  const prefix = categoryName ? categoryName.substring(0, 3).toUpperCase() : 'PRD';
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `${prefix}-${random}`;
}

function generateBarcode(): string {
  return Math.floor(Math.random() * 9000000000000 + 1000000000000).toString();
}

const unitOptions = [
  { value: 'piece', labelAr: 'قطعة', labelEn: 'Piece' },
  { value: 'kg', labelAr: 'كيلوغرام', labelEn: 'Kg' },
  { value: 'liter', labelAr: 'لتر', labelEn: 'Liter' },
  { value: 'meter', labelAr: 'متر', labelEn: 'Meter' },
  { value: 'box', labelAr: 'صندوق', labelEn: 'Box' },
  { value: 'carton', labelAr: 'كرتون', labelEn: 'Carton' },
  { value: 'pack', labelAr: 'حزمة', labelEn: 'Pack' },
  { value: 'dozen', labelAr: 'دستة', labelEn: 'Dozen' },
];

interface TabPanelProps {
  children: React.ReactNode;
  value: number;
  index: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

export default function ProductFormPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [tabValue, setTabValue] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: product, isLoading: productLoading } = useQuery<ProductResponse>({
    queryKey: ['product', id],
    queryFn: () => api.products.getProduct(id!),
    enabled: isEdit,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: () => api.categories.getCategories({ limit: 1000 }),
    staleTime: 10 * 60 * 1000,
  });

  const { data: priceLists } = useQuery({
    queryKey: ['priceLists', 'all'],
    queryFn: () => api.priceLists.getPriceLists({ limit: 1000 }),
    staleTime: 10 * 60 * 1000,
  });

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses', 'all'],
    queryFn: () => api.warehouses.getWarehouses({ limit: 1000 }),
    staleTime: 10 * 60 * 1000,
  });

  const { data: productStock } = useQuery<StockResponse[]>({
    queryKey: ['productStock', id],
    queryFn: () => api.inventory.getProductStock(id!),
    enabled: isEdit,
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nameAr: '',
      nameEn: '',
      descriptionAr: '',
      descriptionEn: '',
      categoryId: null,
      sku: generateSku(),
      barcode: generateBarcode(),
      unit: 'piece',
      hasExpiry: false,
      expiryDays: null,
      isComposite: false,
      isActive: true,
      costPrice: 0,
      sellingPrice: 0,
      wholesalePrice: null,
      lowStockAlert: null,
      image: '',
      variantGroups: [],
      priceOverrides: [],
      alternativeUnits: [],
    },
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({ control, name: 'variantGroups' });

  const {
    fields: priceOverrideFields,
    append: appendPriceOverride,
    remove: removePriceOverride,
  } = useFieldArray({ control, name: 'priceOverrides' });

  const {
    fields: alternativeUnitFields,
    append: appendAlternativeUnit,
    remove: removeAlternativeUnit,
  } = useFieldArray({ control, name: 'alternativeUnits' });

  useEffect(() => {
    if (product && isEdit) {
      reset({
        nameAr: product.nameAr || product.name || '',
        nameEn: product.nameEn || product.name || '',
        descriptionAr: product.description || '',
        descriptionEn: product.description || '',
        categoryId: product.categoryId || null,
        sku: product.sku,
        barcode: product.barcode || '',
        unit: product.unit,
        hasExpiry: product.hasExpiry,
        expiryDays: null,
        isComposite: false,
        isActive: product.isActive,
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        wholesalePrice: product.wholesalePrice || null,
        lowStockAlert: product.lowStockAlert || null,
        image: product.image || '',
        variantGroups: [],
        priceOverrides: [],
        alternativeUnits: [],
      });
      if (product.image) {
        setImagePreview(product.image);
      }
    }
  }, [product, isEdit, reset]);

  const costPrice = watch('costPrice');
  const sellingPrice = watch('sellingPrice');
  const marginPercent = useMemo(() => {
    if (sellingPrice > 0) {
      return Math.round(((sellingPrice - (costPrice || 0)) / sellingPrice) * 100 * 100) / 100;
    }
    return 0;
  }, [costPrice, sellingPrice]);

  const createMutation = useMutation({
    mutationFn: (data: ProductFormValues) =>
      api.products.createProduct({
        name: data.nameAr || data.nameEn,
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        sku: data.sku,
        barcode: data.barcode || undefined,
        categoryId: data.categoryId || undefined,
        unit: data.unit,
        costPrice: data.costPrice,
        sellingPrice: data.sellingPrice,
        wholesalePrice: data.wholesalePrice || undefined,
        lowStockAlert: data.lowStockAlert || undefined,
        hasExpiry: data.hasExpiry,
        isActive: data.isActive,
        description: data.descriptionAr || data.descriptionEn,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/products');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProductFormValues) =>
      api.products.updateProduct(id!, {
        name: data.nameAr || data.nameEn,
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        sku: data.sku,
        barcode: data.barcode || undefined,
        categoryId: data.categoryId || undefined,
        unit: data.unit,
        costPrice: data.costPrice,
        sellingPrice: data.sellingPrice,
        wholesalePrice: data.wholesalePrice || undefined,
        lowStockAlert: data.lowStockAlert || undefined,
        hasExpiry: data.hasExpiry,
        isActive: data.isActive,
        description: data.descriptionAr || data.descriptionEn,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      navigate('/products');
    },
  });

  const onSubmit = (data: ProductFormValues) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setValue('image', '');
  };

  if (productLoading && isEdit) {
    return (
      <Box sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Skeleton variant="text" width="30%" height={40} />
          <Skeleton variant="rounded" height={400} />
        </Stack>
      </Box>
    );
  }

  const isPending = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error || updateMutation.error;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <IconButton onClick={() => navigate('/products')} sx={{ border: 1, borderColor: 'divider' }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight={700}>
          {isEdit ? t('products.editProduct') : t('products.addProduct')}
        </Typography>
      </Stack>

      {mutationError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(mutationError as Error)?.message || t('common.somethingWentWrong')}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
            <Tab label={t('common.general')} />
            <Tab label={t('products.pricing')} />
            <Tab label={t('products.variants')} />
            {isEdit && <Tab label={t('products.inventory')} />}
            <Tab label={t('products.unit')} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Card>
            <CardContent>
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label={t('products.productNameAr')}
                    fullWidth
                    {...register('nameAr')}
                    error={!!errors.nameAr}
                    helperText={errors.nameAr?.message}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label={t('products.productNameEn')}
                    fullWidth
                    {...register('nameEn')}
                    error={!!errors.nameEn}
                    helperText={errors.nameEn?.message}
                    required
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    label={t('products.description')}
                    fullWidth
                    multiline
                    rows={2}
                    {...register('descriptionAr')}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    label={t('common.description') + ' (EN)'}
                    fullWidth
                    multiline
                    rows={2}
                    {...register('descriptionEn')}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="categoryId"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        value={categories?.find((c) => c.id === field.value) || null}
                        onChange={(_, val) => field.onChange(val?.id || null)}
                        options={categories || []}
                        getOptionLabel={(opt) => opt.nameAr || opt.nameEn || opt.name}
                        renderInput={(params) => (
                          <TextField {...params} label={t('common.category')} />
                        )}
                        isOptionEqualToValue={(opt, val) => opt.id === val.id}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    label={t('products.sku')}
                    fullWidth
                    {...register('sku')}
                    error={!!errors.sku}
                    helperText={errors.sku?.message}
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            size="small"
                            onClick={() => {
                              const cat = categories?.find(
                                (c) => c.id === watch('categoryId')
                              );
                              setValue('sku', generateSku(cat?.nameAr || cat?.nameEn));
                            }}
                          >
                            Auto
                          </Button>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    label={t('products.barcode')}
                    fullWidth
                    {...register('barcode')}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button size="small" onClick={() => setValue('barcode', generateBarcode())}>
                            Auto
                          </Button>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="unit"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        value={unitOptions.find((u) => u.value === field.value) || null}
                        onChange={(_, val) => field.onChange(val?.value || 'piece')}
                        options={unitOptions}
                        getOptionLabel={(opt) =>
                          document.documentElement.dir === 'rtl' ? opt.labelAr : opt.labelEn
                        }
                        renderInput={(params) => (
                          <TextField {...params} label={t('products.unit')} required />
                        )}
                      />
                    )}
                  />
                </Grid>
                <Grid size={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControlLabel
                    control={<Switch {...register('hasExpiry')} />}
                    label={t('products.hasExpiry')}
                  />
                  {watch('hasExpiry') && (
                    <TextField
                      label={t('products.expiryDate') + ' ' + t('common.days')}
                      type="number"
                      fullWidth
                      size="small"
                      {...register('expiryDays', { valueAsNumber: true })}
                      sx={{ mt: 1 }}
                    />
                  )}
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControlLabel
                    control={<Switch {...register('isComposite')} />}
                    label={t('products.isService')}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControlLabel
                    control={<Switch defaultChecked {...register('isActive')} />}
                    label={t('products.isActive')}
                  />
                </Grid>
                <Grid size={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
                    {t('products.image')}
                  </Typography>
                  <Box
                    sx={{
                      border: `2px dashed ${theme.palette.divider}`,
                      borderRadius: 3,
                      p: 3,
                      textAlign: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                      '&:hover': { borderColor: theme.palette.primary.main },
                    }}
                    component="label"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleImageUpload}
                    />
                    {imagePreview ? (
                      <Box sx={{ position: 'relative', display: 'inline-block' }}>
                        <Avatar
                          src={imagePreview}
                          variant="rounded"
                          sx={{ width: 120, height: 120, borderRadius: 2 }}
                        />
                        <IconButton
                          size="small"
                          color="error"
                          onClick={handleRemoveImage}
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            bgcolor: 'background.paper',
                            boxShadow: 2,
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ) : (
                      <Stack alignItems="center" spacing={1}>
                        <ImageIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                        <Typography variant="body2" color="text.secondary">
                          {t('upload.dragAndDrop')}
                        </Typography>
                        <Button variant="outlined" size="small" component="span" startIcon={<UploadIcon />}>
                          {t('upload.browse')}
                        </Button>
                      </Stack>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Card>
            <CardContent>
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label={t('products.costPrice')}
                    type="number"
                    fullWidth
                    {...register('costPrice', { valueAsNumber: true })}
                    error={!!errors.costPrice}
                    helperText={errors.costPrice?.message}
                    required
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label={t('products.sellingPrice')}
                    type="number"
                    fullWidth
                    {...register('sellingPrice', { valueAsNumber: true })}
                    error={!!errors.sellingPrice}
                    helperText={errors.sellingPrice?.message}
                    required
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label={t('products.wholesalePrice')}
                    type="number"
                    fullWidth
                    {...register('wholesalePrice', { valueAsNumber: true })}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                <Grid size={12}>
                  <Paper
                    variant="outlined"
                    sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.04) }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Typography variant="body2" fontWeight={600}>
                        {t('reports.marginPercent')}:
                      </Typography>
                      <Chip
                        label={`${marginPercent}%`}
                        color={marginPercent >= 0 ? 'success' : 'error'}
                        variant="outlined"
                        size="small"
                      />
                    </Stack>
                  </Paper>
                </Grid>
                <Grid size={12}>
                  <Divider sx={{ my: 1 }} />
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {t('priceLists.priceLists')}
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        const firstPl = priceLists?.[0];
                        if (firstPl) {
                          appendPriceOverride({
                            priceListId: firstPl.id,
                            priceListName: firstPl.nameAr || firstPl.nameEn || firstPl.name,
                            price: 0,
                          });
                        }
                      }}
                    >
                      {t('common.add')}
                    </Button>
                  </Stack>
                  {priceOverrideFields.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      {t('common.noData')}
                    </Typography>
                  ) : (
                    <Stack spacing={1.5}>
                      {priceOverrideFields.map((field, idx) => (
                        <Stack key={field.id} direction="row" spacing={1} alignItems="center">
                          <Controller
                            name={`priceOverrides.${idx}.priceListId`}
                            control={control}
                            render={({ field: f }) => (
                              <Autocomplete
                                size="small"
                                value={priceLists?.find((pl) => pl.id === f.value) || null}
                                onChange={(_, val) => f.onChange(val?.id || '')}
                                options={priceLists || []}
                                getOptionLabel={(opt) => opt.nameAr || opt.nameEn || opt.name}
                                renderInput={(params) => (
                                  <TextField {...params} size="small" sx={{ minWidth: 200 }} />
                                )}
                                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                                sx={{ flex: 1 }}
                              />
                            )}
                          />
                          <TextField
                            type="number"
                            size="small"
                            {...register(`priceOverrides.${idx}.price`, { valueAsNumber: true })}
                            inputProps={{ min: 0, step: 0.01 }}
                            sx={{ width: 140 }}
                          />
                          <IconButton size="small" color="error" onClick={() => removePriceOverride(idx)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      ))}
                    </Stack>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {t('products.variants')}
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={() =>
                    appendVariant({
                      name: '',
                      type: '',
                      options: [{ name: '', value: '', sku: '', barcode: '', price: 0 }],
                    })
                  }
                >
                  {t('products.addVariant')}
                </Button>
              </Stack>

              {variantFields.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">{t('common.noData')}</Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {variantFields.map((variant, vIdx) => (
                    <Paper key={variant.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
                        <Stack direction="row" spacing={1} sx={{ flex: 1 }}>
                          <TextField
                            size="small"
                            label={t('variants.variantName')}
                            {...register(`variantGroups.${vIdx}.name`)}
                            sx={{ flex: 1 }}
                          />
                          <TextField
                            size="small"
                            label={t('variants.type')}
                            {...register(`variantGroups.${vIdx}.type`)}
                            sx={{ width: 120 }}
                          />
                        </Stack>
                        <IconButton size="small" color="error" onClick={() => removeVariant(vIdx)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>

                      <VariantOptions
                        variantIndex={vIdx}
                        control={control}
                        register={register}
                        t={t}
                      />
                    </Paper>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        {isEdit && (
          <TabPanel value={tabValue} index={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={600} mb={2}>
                  {t('inventory.stockLevel')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label={t('products.lowStockAlert')}
                      type="number"
                      fullWidth
                      {...register('lowStockAlert', { valueAsNumber: true })}
                      inputProps={{ min: 0 }}
                    />
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                {productStock && productStock.length > 0 ? (
                  <Stack spacing={1.5}>
                    {productStock.map((stock) => (
                      <Paper key={stock.warehouseId} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Typography variant="body2" fontWeight={600}>
                            {stock.warehouseName}
                          </Typography>
                          <Chip
                            size="small"
                            label={`${stock.currentStock} / ${stock.maxStock}`}
                            color={
                              stock.currentStock <= stock.minStock
                                ? 'error'
                                : stock.currentStock <= (stock.reorderPoint || 0)
                                  ? 'warning'
                                  : 'success'
                            }
                            variant="outlined"
                          />
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {t('common.noData')}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </TabPanel>
        )}

        <TabPanel value={tabValue} index={isEdit ? 4 : 3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {t('products.unit')}
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={() =>
                    appendAlternativeUnit({
                      unit: '',
                      barcode: '',
                      conversionRate: 1,
                    })
                  }
                >
                  {t('common.add')}
                </Button>
              </Stack>

              {alternativeUnitFields.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {t('common.noData')}
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {alternativeUnitFields.map((field, idx) => (
                    <Stack key={field.id} direction="row" spacing={1} alignItems="center">
                      <TextField
                        size="small"
                        label={t('products.unit')}
                        {...register(`alternativeUnits.${idx}.unit`)}
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        size="small"
                        label={t('products.barcode')}
                        {...register(`alternativeUnits.${idx}.barcode`)}
                        sx={{ width: 160 }}
                      />
                      <TextField
                        size="small"
                        label={t('inventory.transferQuantity')}
                        type="number"
                        {...register(`alternativeUnits.${idx}.conversionRate`, { valueAsNumber: true })}
                        inputProps={{ min: 0.0001, step: 0.01 }}
                        sx={{ width: 120 }}
                      />
                      <IconButton size="small" color="error" onClick={() => removeAlternativeUnit(idx)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            size="large"
            startIcon={<CancelIcon />}
            onClick={() => navigate('/products')}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            size="large"
            startIcon={<SaveIcon />}
            type="submit"
            disabled={isPending}
          >
            {isPending ? t('common.processing') : t('common.save')}
          </Button>
        </Box>
      </form>
    </Box>
  );
}

function VariantOptions({
  variantIndex,
  control,
  register,
  t,
}: {
  variantIndex: number;
  control: Control<ProductFormValues>;
  register: UseFormRegister<ProductFormValues>;
  t: (key: string) => string;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `variantGroups.${variantIndex}.options`,
  });

  return (
    <Stack spacing={1}>
      {fields.map((field, oIdx) => (
        <Stack key={field.id} direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <TextField
            size="small"
            label={t('variants.optionName')}
            {...register(`variantGroups.${variantIndex}.options.${oIdx}.name`)}
            sx={{ width: 120 }}
          />
          <TextField
            size="small"
            label={t('variants.optionValue')}
            {...register(`variantGroups.${variantIndex}.options.${oIdx}.value`)}
            sx={{ width: 120 }}
          />
          <TextField
            size="small"
            label={t('variants.sku')}
            {...register(`variantGroups.${variantIndex}.options.${oIdx}.sku`)}
            sx={{ width: 100 }}
          />
          <TextField
            size="small"
            label={t('variants.price')}
            type="number"
            {...register(`variantGroups.${variantIndex}.options.${oIdx}.price`, { valueAsNumber: true })}
            inputProps={{ min: 0, step: 0.01 }}
            sx={{ width: 100 }}
          />
          <IconButton size="small" color="error" onClick={() => remove(oIdx)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ))}
      <Button size="small" startIcon={<AddIcon />} onClick={() => append({ name: '', value: '', sku: '', barcode: '', price: 0 })}>
        {t('variants.addOption')}
      </Button>
    </Stack>
  );
}