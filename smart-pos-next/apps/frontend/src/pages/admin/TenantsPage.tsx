import { useState } from 'react';
import {
  Box, TextField, Button, Typography, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, Paper, Chip, IconButton,
  Skeleton, Alert, Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment,
  MenuItem, Switch, alpha, useTheme,
} from '@mui/material';
import {
  Add, Edit, Delete, Search, Close, Refresh, ToggleOn, ToggleOff,
  Domain, Palette, Visibility,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import api, { type TenantResponse, type PaginatedResponse, type PlanResponse } from '@/api/endpoints';
import { get } from '@/api/client';

const tenantSchema = z.object({
  name: z.string().min(1),
  nameAr: z.string().optional().default(''),
  nameEn: z.string().optional().default(''),
  email: z.string().email(),
  phone: z.string().optional().default(''),
  planId: z.string().optional().default(''),
});
type TenantForm = z.infer<typeof tenantSchema>;

const brandingSchema = z.object({
  primaryColor: z.string().optional().default('#1976d2'),
  secondaryColor: z.string().optional().default('#dc004e'),
});
type BrandingForm = z.infer<typeof brandingSchema>;

export default function TenantsPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTenant, setEditTenant] = useState<TenantResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TenantResponse | null>(null);
  const [toggleTarget, setToggleTarget] = useState<TenantResponse | null>(null);
  const [brandingTarget, setBrandingTarget] = useState<TenantResponse | null>(null);

  const { data: tenantsData, isLoading, error, refetch } = useQuery<PaginatedResponse<TenantResponse>>({
    queryKey: ['tenants', page + 1, rowsPerPage, search],
    queryFn: () => api.tenants.getTenants({ page: page + 1, limit: rowsPerPage, search }),
  });

  const { data: plans } = useQuery<PlanResponse[]>({
    queryKey: ['plans-list'],
    queryFn: async () => { const r = await api.plans.getPlans({ limit: 100 }); return (r as any).data || []; },
    staleTime: 5 * 60 * 1000,
  });

  const { register, handleSubmit, reset } = useForm<TenantForm>({
    resolver: zodResolver(tenantSchema),
    defaultValues: { name: '', nameAr: '', nameEn: '', email: '', phone: '', planId: '' },
  });

  const brandingForm = useForm<BrandingForm>({
    resolver: zodResolver(brandingSchema),
    defaultValues: { primaryColor: '#1976d2', secondaryColor: '#dc004e' },
  });

  const createMut = useMutation({
    mutationFn: api.tenants.createTenant,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tenants'] }); setDialogOpen(false); reset(); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.tenants.updateTenant(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tenants'] }); setDialogOpen(false); setEditTenant(null); reset(); },
  });
  const deleteMut = useMutation({
    mutationFn: api.tenants.deleteTenant,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tenants'] }); setDeleteTarget(null); },
  });
  const toggleMut = useMutation({
    mutationFn: api.tenants.toggleTenantActive,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tenants'] }); setToggleTarget(null); },
  });
  const brandingMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.tenants.updateBranding(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tenants'] }); setBrandingTarget(null); },
  });

  const handleOpenEdit = (t: TenantResponse) => {
    setEditTenant(t);
    reset({ name: t.name, nameAr: t.nameAr || '', nameEn: t.nameEn || '', email: t.email || '', phone: t.phone || '', planId: t.planId || '' });
    setDialogOpen(true);
  };

  const handleOpenBranding = (t: TenantResponse) => {
    setBrandingTarget(t);
    brandingForm.reset({ primaryColor: t.branding?.primaryColor || '#1976d2', secondaryColor: t.branding?.secondaryColor || '#dc004e' });
  };

  const tenants = tenantsData?.data || [];

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>{t('nav.traders')}</Typography>

      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap mb={2}>
        <TextField
          size="small"
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>, endAdornment: search ? <InputAdornment position="end"><IconButton size="small" onClick={() => setSearch('')}><Close fontSize="small" /></IconButton></InputAdornment> : null }}
          sx={{ minWidth: 260 }}
        />
        <Button variant="contained" startIcon={<Add />} onClick={() => { setEditTenant(null); reset({ name: '', nameAr: '', nameEn: '', email: '', phone: '', planId: '' }); setDialogOpen(true); }}>
          {t('branches.addBranch')} Tenant
        </Button>
      </Stack>

      {isLoading ? (
        <Stack spacing={1}>{[...Array(5)].map((_, i) => <Skeleton key={i} variant="rounded" height={48} />)}</Stack>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: 3 }}>{(error as Error).message}</Alert>
      ) : tenants.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 3 }}>{t('common.noData')}</Alert>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>{t('common.name')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Subdomain</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t('common.email')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t('plans.planName')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t('common.status')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t('common.created')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id} hover>
                    <TableCell>{tenant.nameAr || tenant.nameEn || tenant.name}</TableCell>
                    <TableCell>{tenant.name?.toLowerCase().replace(/\s+/g, '-') || '—'}</TableCell>
                    <TableCell>{tenant.email || '—'}</TableCell>
                    <TableCell><Chip label={tenant.planId || '—'} size="small" variant="outlined" /></TableCell>
                    <TableCell>
                      <Chip label={tenant.isActive ? t('common.active') : t('common.inactive')} size="small" color={tenant.isActive ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell>{tenant.createdAt ? format(new Date(tenant.createdAt), 'dd/MM/yyyy') : '—'}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpenEdit(tenant)}><Edit fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => setToggleTarget(tenant)}>
                        {tenant.isActive ? <ToggleOff fontSize="small" color="warning" /> : <ToggleOn fontSize="small" color="success" />}
                      </IconButton>
                      <IconButton size="small" onClick={() => handleOpenBranding(tenant)}><Palette fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(tenant)}><Delete fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination component="div" count={tenantsData?.total || 0} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0); }} rowsPerPageOptions={[10, 25, 50]} />
        </>
      )}

      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditTenant(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>{editTenant ? t('common.edit') : t('common.add')} Tenant</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label={t('common.name')} {...register('name')} size="small" fullWidth />
            <TextField label={t('settings.companyNameAr')} {...register('nameAr')} size="small" fullWidth />
            <TextField label={t('settings.companyNameEn')} {...register('nameEn')} size="small" fullWidth />
            <TextField label={t('common.email')} {...register('email')} size="small" fullWidth />
            <TextField label={t('common.phone')} {...register('phone')} size="small" fullWidth />
            <TextField select label={t('plans.planName')} {...register('planId')} size="small" fullWidth>
              <MenuItem value="">{t('common.none')}</MenuItem>
              {(plans || []).map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDialogOpen(false); setEditTenant(null); }}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleSubmit((d) => editTenant ? updateMut.mutate({ id: editTenant.id, data: d }) : createMut.mutate(d))} disabled={createMut.isPending || updateMut.isPending}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!brandingTarget} onClose={() => setBrandingTarget(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Branding — {brandingTarget?.name}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label={t('settings.primaryColor')} {...brandingForm.register('primaryColor')} size="small" fullWidth />
            <TextField label={t('settings.secondaryColor')} {...brandingForm.register('secondaryColor')} size="small" fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBrandingTarget(null)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={brandingForm.handleSubmit((d) => brandingMut.mutate({ id: brandingTarget!.id, data: { branding: d } }))} disabled={brandingMut.isPending}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!toggleTarget} onClose={() => setToggleTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('common.confirm')}</DialogTitle>
        <DialogContent><Typography>{toggleTarget?.isActive ? 'Deactivate this tenant?' : 'Activate this tenant?'}</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setToggleTarget(null)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={() => { if (toggleTarget) toggleMut.mutate(toggleTarget.id); }}>{t('common.confirm')}</Button>
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