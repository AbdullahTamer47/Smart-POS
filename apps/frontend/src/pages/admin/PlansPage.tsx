import { useState } from 'react';
import {
  Box, Button, Typography, Stack, Card, CardContent, CardActions, Chip,
  Grid, Skeleton, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Switch, FormControlLabel, Divider, alpha, useTheme, IconButton, Fab,
} from '@mui/material';
import {
  Add, Edit, Delete, CheckCircle, Cancel, Star, Close, Refresh,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api, { type PlanResponse, type PaginatedResponse } from '@/api/endpoints';

const planSchema = z.object({
  name: z.string().min(1),
  nameAr: z.string().optional().default(''),
  nameEn: z.string().optional().default(''),
  description: z.string().optional().default(''),
  price: z.coerce.number().min(0),
  currency: z.string().optional().default('USD'),
  features: z.string().optional().default(''),
  maxUsers: z.coerce.number().min(1),
  maxBranches: z.coerce.number().min(1),
  maxWarehouses: z.coerce.number().min(1),
  maxProducts: z.coerce.number().min(1),
  maxInvoices: z.coerce.number().min(1),
  maxCustomers: z.coerce.number().min(1),
  maxSuppliers: z.coerce.number().min(1),
  isActive: z.boolean().optional().default(true),
  isRecommended: z.boolean().optional().default(false),
  trialDays: z.coerce.number().min(0).optional().default(0),
});
type PlanForm = z.infer<typeof planSchema>;

const FEATURE_LIMITS = [
  { key: 'maxUsers', label: 'plans.maxUsers' },
  { key: 'maxBranches', label: 'plans.maxBranches' },
  { key: 'maxWarehouses', label: 'plans.maxWarehouses' },
  { key: 'maxProducts', label: 'plans.maxProducts' },
  { key: 'maxInvoices', label: 'plans.maxInvoices' },
  { key: 'maxCustomers', label: 'plans.maxCustomers' },
  { key: 'maxSuppliers', label: 'plans.maxSuppliers' },
];

export default function PlansPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<PlanResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PlanResponse | null>(null);

  const { data: plansData, isLoading, error } = useQuery<PaginatedResponse<PlanResponse>>({
    queryKey: ['plans', 1, 100],
    queryFn: () => api.plans.getPlans({ page: 1, limit: 100 }),
  });

  const { register, handleSubmit, reset, watch } = useForm<PlanForm>({
    resolver: zodResolver(planSchema),
    defaultValues: { name: '', nameAr: '', nameEn: '', description: '', price: 0, currency: 'USD', features: '', maxUsers: 5, maxBranches: 1, maxWarehouses: 1, maxProducts: 100, maxInvoices: 500, maxCustomers: 100, maxSuppliers: 50, isActive: true, isRecommended: false, trialDays: 0 },
  });

  const createMut = useMutation({
    mutationFn: (data: PlanForm) => api.plans.createPlan({ ...data, features: data.features ? data.features.split(',').map((f) => f.trim()) : [] } as any),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['plans'] }); setDialogOpen(false); reset(); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PlanForm }) => api.plans.updatePlan(id, { ...data, features: data.features ? data.features.split(',').map((f) => f.trim()) : [] } as any),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['plans'] }); setDialogOpen(false); setEditPlan(null); reset(); },
  });
  const deleteMut = useMutation({
    mutationFn: api.plans.deletePlan,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['plans'] }); setDeleteTarget(null); },
  });
  const toggleMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => api.plans.updatePlan(id, { isActive: !isActive } as any),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plans'] }),
  });

  const handleOpenEdit = (p: PlanResponse) => {
    setEditPlan(p);
    reset({
      name: p.name, nameAr: p.nameAr || '', nameEn: p.nameEn || '', description: p.description || '',
      price: p.price, currency: p.currency || 'USD', features: (p.features || []).join(', '),
      maxUsers: p.maxUsers, maxBranches: p.maxBranches, maxWarehouses: p.maxWarehouses,
      maxProducts: p.maxProducts, maxInvoices: p.maxInvoices, maxCustomers: p.maxCustomers,
      maxSuppliers: p.maxSuppliers, isActive: p.isActive, isRecommended: p.isRecommended || false,
      trialDays: p.trialDays || 0,
    });
    setDialogOpen(true);
  };

  const plans = plansData?.data || [];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap mb={3}>
        <Typography variant="h4" fontWeight={700}>{t('plans.plans')}</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => { setEditPlan(null); reset(); setDialogOpen(true); }}>
          {t('plans.addPlan')}
        </Button>
      </Stack>

      {isLoading ? (
        <Grid container spacing={3}>
          {[...Array(6)].map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Skeleton variant="rounded" height={320} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: 3 }}>{(error as Error).message}</Alert>
      ) : plans.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 3 }}>{t('common.noData')}</Alert>
      ) : (
        <Grid container spacing={3}>
          {plans.map((plan) => (
            <Grid key={plan.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  borderRadius: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: plan.isRecommended ? `2px solid ${theme.palette.primary.main}` : undefined,
                  position: 'relative',
                  ...(plan.isRecommended && { boxShadow: theme.shadows[8] }),
                }}
              >
                {plan.isRecommended && (
                  <Chip
                    icon={<Star />}
                    label={t('plans.isRecommended')}
                    color="primary"
                    size="small"
                    sx={{ position: 'absolute', top: 12, right: 12 }}
                  />
                )}
                <CardContent sx={{ flex: 1, pb: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6" fontWeight={700}>{plan.nameAr || plan.nameEn || plan.name}</Typography>
                    <Chip label={plan.isActive ? t('common.active') : t('common.inactive')} size="small" color={plan.isActive ? 'success' : 'default'} />
                  </Stack>
                  <Typography variant="h4" fontWeight={700} color="primary.main" mb={1}>
                    {plan.price} <Typography component="span" variant="body2" color="text.secondary">{plan.currency || 'USD'}</Typography>
                  </Typography>
                  {plan.description && <Typography variant="body2" color="text.secondary" mb={2}>{plan.description}</Typography>}
                  {plan.features && plan.features.length > 0 && (
                    <Box mb={2}>
                      {(plan.features || []).map((f, i) => (
                        <Stack key={i} direction="row" spacing={1} alignItems="center" mb={0.5}>
                          <CheckCircle fontSize="small" color="success" />
                          <Typography variant="body2">{f}</Typography>
                        </Stack>
                      ))}
                    </Box>
                  )}
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.5}>{t('plans.limits')}</Typography>
                  <Grid container spacing={1}>
                    {FEATURE_LIMITS.map((l) => (
                      <Grid key={l.key} size={6}>
                        <Typography variant="caption" color="text.secondary">{t(l.label)}</Typography>
                        <Typography variant="body2" fontWeight={600}>{(plan as any)[l.key]}</Typography>
                      </Grid>
                    ))}
                  </Grid>
                  {plan.trialDays > 0 && (
                    <Chip label={`${plan.trialDays} ${t('plans.trialDays')}`} size="small" variant="outlined" sx={{ mt: 1.5 }} />
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', p: 1.5 }}>
                  <IconButton size="small" onClick={() => handleOpenEdit(plan)}><Edit fontSize="small" /></IconButton>
                  <IconButton size="small" onClick={() => toggleMut.mutate({ id: plan.id, isActive: plan.isActive })}>
                    {plan.isActive ? <Cancel fontSize="small" color="warning" /> : <CheckCircle fontSize="small" color="success" />}
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => setDeleteTarget(plan)}><Delete fontSize="small" /></IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditPlan(null); }} maxWidth="md" fullWidth>
        <DialogTitle>{editPlan ? t('plans.editPlan') : t('plans.addPlan')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField label={t('plans.planName')} {...register('name')} size="small" fullWidth />
              <TextField label={t('plans.planNameAr')} {...register('nameAr')} size="small" fullWidth />
              <TextField label={t('plans.planNameEn')} {...register('nameEn')} size="small" fullWidth />
            </Stack>
            <TextField label={t('plans.description')} {...register('description')} size="small" fullWidth multiline rows={2} />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField label={t('plans.price')} type="number" {...register('price')} size="small" fullWidth />
              <TextField label={t('plans.currency')} {...register('currency')} size="small" sx={{ minWidth: 120 }} />
              <TextField label={t('plans.trialDays')} type="number" {...register('trialDays')} size="small" sx={{ minWidth: 120 }} />
            </Stack>
            <TextField label={t('plans.features')} {...register('features')} size="small" fullWidth helperText="Comma-separated" />
            <Divider />
            <Typography variant="subtitle2" fontWeight={600}>{t('plans.limits')}</Typography>
            <Grid container spacing={2}>
              {FEATURE_LIMITS.map((l) => (
                <Grid key={l.key} size={{ xs: 6, sm: 4, md: 3 }}>
                  <TextField label={t(l.label)} type="number" {...register(l.key as any)} size="small" fullWidth />
                </Grid>
              ))}
            </Grid>
            <Stack direction="row" spacing={3}>
              <FormControlLabel control={<Switch {...register('isActive')} />} label={t('common.active')} />
              <FormControlLabel control={<Switch {...register('isRecommended')} />} label={t('plans.isRecommended')} />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDialogOpen(false); setEditPlan(null); }}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleSubmit((d) => editPlan ? updateMut.mutate({ id: editPlan.id, data: d }) : createMut.mutate(d))} disabled={createMut.isPending || updateMut.isPending}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('common.confirmDelete')}</DialogTitle>
        <DialogContent><Typography>{t('common.confirmDeleteMessage')}</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>{t('common.cancel')}</Button>
          <Button color="error" variant="contained" onClick={() => { if (deleteTarget) deleteMut.mutate(deleteTarget.id); }}>{t('common.delete')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}