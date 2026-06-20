import { useState, useCallback } from 'react';
import {
  Box, TextField, Button, Typography, Stack, Card, CardContent, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TablePagination, Paper, Chip,
  IconButton, Skeleton, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  Switch, FormControlLabel, Checkbox, FormGroup, Divider, InputAdornment, MenuItem,
} from '@mui/material';
import {
  Add, Edit, Delete, Search, Close, FilterList, Refresh, ToggleOn, ToggleOff,
  PersonAdd, LockReset,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api, { type UserResponse, type PaginatedResponse, type BranchResponse } from '@/api/endpoints';
import { get } from '@/api/client';

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).optional().or(z.literal('')),
  fullName: z.string().min(1),
  phone: z.string().optional().default(''),
  role: z.string().min(1),
  branchId: z.string().optional().default(''),
  isActive: z.boolean().optional().default(true),
});
type UserForm = z.infer<typeof userSchema>;

const ROLES = ['ADMIN', 'MANAGER', 'CASHIER', 'ACCOUNTANT', 'INVENTORY_STAFF', 'VIEWER'];
const CASHIER_PERMISSIONS = [
  { key: 'pos.create_sale', label: 'pos.completeSale' },
  { key: 'pos.apply_discount', label: 'pos.discount' },
  { key: 'pos.hold_invoice', label: 'pos.holdInvoice' },
  { key: 'pos.refund', label: 'pos.refund' },
  { key: 'pos.void_invoice', label: 'invoices.cancelInvoice' },
  { key: 'pos.open_cash_drawer', label: 'pos.openRegister' },
  { key: 'pos.view_reports', label: 'reports.reports' },
  { key: 'pos.manage_customers', label: 'customers.customers' },
  { key: 'pos.view_cost', label: 'products.costPrice' },
];

export default function UserManagementPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [userDialog, setUserDialog] = useState(false);
  const [editUser, setEditUser] = useState<UserResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserResponse | null>(null);
  const [permissionsUser, setPermissionsUser] = useState<UserResponse | null>(null);
  const [permValues, setPermValues] = useState<string[]>([]);

  const { data: usersData, isLoading, error, refetch } = useQuery<PaginatedResponse<UserResponse>>({
    queryKey: ['users', page + 1, rowsPerPage, search],
    queryFn: () => api.users.getUsers({ page: page + 1, limit: rowsPerPage, search }),
  });

  const { data: branches } = useQuery<BranchResponse[]>({
    queryKey: ['branches-list'],
    queryFn: () => get('/branches'),
    staleTime: 5 * 60 * 1000,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: { email: '', fullName: '', phone: '', role: 'CASHIER', branchId: '', isActive: true },
  });

  const createMut = useMutation({
    mutationFn: (data: UserForm) => api.users.createUser({ ...data, password: data.password || 'changeme123' } as any),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); setUserDialog(false); reset(); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.users.updateUser(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); setUserDialog(false); setEditUser(null); reset(); },
  });
  const deleteMut = useMutation({
    mutationFn: api.users.deleteUser,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); setDeleteTarget(null); },
  });
  const toggleMut = useMutation({
    mutationFn: api.users.toggleActive,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
  const updatePermsMut = useMutation({
    mutationFn: (data: { id: string; permissions: string[] }) => api.users.updatePermissions(data.id, { permissions: data.permissions }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); setPermissionsUser(null); },
  });

  const handleOpenEdit = (u: UserResponse) => {
    setEditUser(u);
    reset({ email: u.email, fullName: u.fullName, phone: u.phone || '', role: u.role, branchId: u.branchId || '', isActive: u.isActive });
    setUserDialog(true);
  };

  const handleOpenPermissions = (u: UserResponse) => {
    setPermissionsUser(u);
    setPermValues(u.permissions || []);
  };

  const togglePerm = (key: string) => {
    setPermValues((prev) => prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]);
  };

  const users = usersData?.data || [];

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>{t('settings.userManagement')}</Typography>

      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap mb={2}>
        <TextField
          size="small"
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>, endAdornment: search ? <InputAdornment position="end"><IconButton size="small" onClick={() => setSearch('')}><Close fontSize="small" /></IconButton></InputAdornment> : null }}
          sx={{ minWidth: 260 }}
        />
        <Button variant="contained" startIcon={<PersonAdd />} onClick={() => { setEditUser(null); reset({ email: '', fullName: '', phone: '', role: 'CASHIER', branchId: '', isActive: true }); setUserDialog(true); }}>
          {t('users.addUser')}
        </Button>
      </Stack>

      {isLoading ? (
        <Stack spacing={1}>{[...Array(5)].map((_, i) => <Skeleton key={i} variant="rounded" height={48} />)}</Stack>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: 3 }}>{(error as Error).message}</Alert>
      ) : users.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 3 }}>{t('common.noData')}</Alert>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>{t('auth.fullName')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t('auth.email')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t('auth.role')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t('branches.branch')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t('common.status')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell>{u.fullName}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell><Chip label={u.role} size="small" variant="outlined" /></TableCell>
                    <TableCell>{u.branchName || '—'}</TableCell>
                    <TableCell>
                      <Chip label={u.isActive ? t('common.active') : t('common.inactive')} size="small" color={u.isActive ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpenEdit(u)}><Edit fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => toggleMut.mutate(u.id)}>
                        {u.isActive ? <ToggleOff fontSize="small" color="warning" /> : <ToggleOn fontSize="small" color="success" />}
                      </IconButton>
                      {u.role === 'CASHIER' && (
                        <IconButton size="small" onClick={() => handleOpenPermissions(u)}><LockReset fontSize="small" /></IconButton>
                      )}
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(u)}><Delete fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination component="div" count={usersData?.total || 0} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0); }} rowsPerPageOptions={[10, 25, 50]} />
        </>
      )}

      {/* User Dialog */}
      <Dialog open={userDialog} onClose={() => { setUserDialog(false); setEditUser(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>{editUser ? t('users.editUser') : t('users.addUser')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label={t('auth.fullName')} {...register('fullName')} size="small" fullWidth error={!!errors.fullName} helperText={errors.fullName?.message} />
            <TextField label={t('auth.email')} {...register('email')} size="small" fullWidth error={!!errors.email} helperText={errors.email?.message} />
            {!editUser && <TextField label={t('auth.password')} type="password" {...register('password')} size="small" fullWidth />}
            <TextField label={t('auth.phone')} {...register('phone')} size="small" fullWidth />
            <TextField select label={t('auth.role')} {...register('role')} size="small" fullWidth>
              {ROLES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField>
            <TextField select label={t('branches.branch')} {...register('branchId')} size="small" fullWidth>
              <MenuItem value="">{t('common.none')}</MenuItem>
              {(branches || []).map((b) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setUserDialog(false); setEditUser(null); }}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleSubmit((d) => editUser ? updateMut.mutate({ id: editUser.id, data: d }) : createMut.mutate(d))} disabled={createMut.isPending || updateMut.isPending}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={!!permissionsUser} onClose={() => setPermissionsUser(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('users.permissions')} — {permissionsUser?.fullName}</DialogTitle>
        <DialogContent>
          <FormGroup>
            <Stack spacing={0.5} mt={1}>
              {CASHIER_PERMISSIONS.map((perm) => (
                <FormControlLabel
                  key={perm.key}
                  control={<Checkbox checked={permValues.includes(perm.key)} onChange={() => togglePerm(perm.key)} />}
                  label={t(perm.label)}
                />
              ))}
            </Stack>
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPermissionsUser(null)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={() => updatePermsMut.mutate({ id: permissionsUser!.id, permissions: permValues })} disabled={updatePermsMut.isPending}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
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