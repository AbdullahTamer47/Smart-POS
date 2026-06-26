import { useState, useCallback, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Stack, TextField, Autocomplete,
  Chip, Alert, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Skeleton, IconButton, useTheme, CircularProgress, Grid, Divider,
  alpha,
} from '@mui/material';
import {
  FileDownload as DownloadIcon, Refresh as RefreshIcon, TrendingUp,
  BarChart as BarChartIcon, Inventory2, Star, Speed, Person, Receipt,
  Business, ReceiptLong, CalendarMonth, Summarize, PictureAsPdf,
  GridOn, TableChart,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts';
import { useAppStore } from '@/stores/appStore';
import api, { type ReportRequest, type CustomerResponse, type SupplierResponse, type BranchResponse } from '@/api/endpoints';
import { get } from '@/api/client';

const COLORS = ['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2', '#00796b', '#c2185b', '#0288d1'];

interface ReportData {
  summary?: {
    totalSales?: number;
    totalOrders?: number;
    totalTax?: number;
    totalDiscount?: number;
    totalRevenue?: number;
    totalExpenses?: number;
    netProfit?: number;
    grossProfit?: number;
    costOfGoods?: number;
    totalCustomers?: number;
    averageOrderValue?: number;
    margin?: number;
    cashSales?: number;
    cardSales?: number;
    creditSales?: number;
    totalInvoices?: number;
    returns?: number;
    refunds?: number;
    openingBalance?: number;
    closingBalance?: number;
    expectedBalance?: number;
    difference?: number;
    shiftNumber?: string;
    openedBy?: string;
    closedBy?: string;
    startTime?: string;
    endTime?: string;
  };
  items?: Array<Record<string, unknown>>;
  chart?: Array<Record<string, unknown>>;
  ledger?: Array<Record<string, unknown>>;
  transactions?: Array<Record<string, unknown>>;
  shifts?: Array<Record<string, unknown>>;
  taxBreakdown?: Array<Record<string, unknown>>;
}

const reportApiMap: Record<string, (params: ReportRequest) => Promise<unknown>> = {
  sales: (p) => api.reports.salesReport(p),
  'profit-loss': (p) => api.reports.profitLossReport(p),
  'inventory-status': (p) => api.reports.inventoryStatusReport(p),
  'inventory-movements': (p) => api.reports.inventoryMovementsReport(p),
  'top-products': (p) => api.reports.topProductsReport(p),
  'slow-moving': (p) => api.reports.slowMovingReport(p),
  'cashier-performance': (p) => api.reports.cashierPerformanceReport(p),
  tax: (p) => api.reports.taxReport(p),
  'daily-summary': (p) => api.reports.dailySummary(p),
};

const reportTitles: Record<string, string> = {
  sales: 'reports.salesReport',
  'profit-loss': 'reports.profitLossReport',
  'inventory-status': 'reports.inventoryStatusReport',
  'inventory-movements': 'reports.inventoryMovementsReport',
  'top-products': 'reports.topProductsReport',
  'slow-moving': 'reports.slowMovingReport',
  'cashier-performance': 'reports.cashierPerformanceReport',
  'customer-statement': 'reports.customerStatement',
  'supplier-statement': 'reports.supplierStatement',
  tax: 'reports.taxReport',
  shift: 'reports.shiftReport',
  'daily-summary': 'reports.dailySummary',
};

export default function ReportDetailPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { type } = useParams<{ type: string }>();
  const language = useAppStore((s) => s.language);
  const isRTL = language === 'ar';

  const [startDate, setStartDate] = useState(() => format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [branchId, setBranchId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [shiftId, setShiftId] = useState('');
  const [generated, setGenerated] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const { data: branches } = useQuery<BranchResponse[]>({
    queryKey: ['branches-list'],
    queryFn: () => get('/branches'),
    staleTime: 5 * 60 * 1000,
  });

  const { data: customers } = useQuery<CustomerResponse[]>({
    queryKey: ['customers-list', customerId],
    queryFn: () => get('/customers'),
    staleTime: 5 * 60 * 1000,
    enabled: type === 'customer-statement',
  });

  const { data: suppliers } = useQuery<SupplierResponse[]>({
    queryKey: ['suppliers-list', supplierId],
    queryFn: () => get('/suppliers'),
    staleTime: 5 * 60 * 1000,
    enabled: type === 'supplier-statement',
  });

  const { isFetching, error, refetch } = useQuery<ReportData>({
    queryKey: ['report', type, startDate, endDate, branchId, customerId, supplierId, shiftId],
    queryFn: async () => {
      const params: ReportRequest = { startDate, endDate };
      if (branchId) params.branchId = branchId;

      if (type === 'customer-statement' && customerId) {
        return api.reports.customerStatement(customerId, params) as Promise<ReportData>;
      }
      if (type === 'supplier-statement' && supplierId) {
        return api.reports.supplierStatement(supplierId, params) as Promise<ReportData>;
      }
      if (type === 'shift' && shiftId) {
        return api.reports.shiftReport(shiftId) as Promise<ReportData>;
      }

      const fn = reportApiMap[type || ''];
      if (fn) return fn(params) as Promise<ReportData>;
      throw new Error('Unknown report type');
    },
    enabled: false,
  });

  const handleGenerate = useCallback(async () => {
    setGenerated(true);
    const result = await refetch();
    if (result.data) {
      setReportData(result.data as ReportData);
    }
  }, [refetch]);

  const handleExport = useCallback((format: string) => {
    const params = new URLSearchParams({ startDate, endDate, format });
    if (branchId) params.set('branchId', branchId);
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/reports/${type}/export?${params.toString()}`;
    window.open(url, '_blank');
  }, [type, startDate, endDate, branchId]);

  const summary = reportData?.summary;
  const items = reportData?.items || [];
  const chartData = reportData?.chart || [];
  const ledger = reportData?.ledger || [];
  const taxBreakdown = reportData?.taxBreakdown || [];

  const KPI = ({ label, value, prefix }: { label: string; value?: number; prefix?: string }) => (
    <Card sx={{ borderRadius: 3, flex: 1, minWidth: 160 }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography variant="caption" color="text.secondary" fontWeight={500}>
          {t(label)}
        </Typography>
        <Typography variant="h5" fontWeight={700} mt={0.5}>
          {prefix || ''}{typeof value === 'number' ? value.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', { minimumFractionDigits: 2 }) : '—'}
        </Typography>
      </CardContent>
    </Card>
  );

  const renderSalesReport = () => (
    <>
      {chartData.length > 0 && (
        <Paper sx={{ p: 2, borderRadius: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>{t('reports.salesReport')}</Typography>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#1976d2" strokeWidth={2} name={t('reports.totalSales')} />
              <Line type="monotone" dataKey="orders" stroke="#388e3c" strokeWidth={2} name={t('reports.totalOrders')} />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      )}
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap mb={3}>
        <KPI label="reports.totalSales" value={summary?.totalSales} />
        <KPI label="reports.totalOrders" value={summary?.totalOrders} />
        <KPI label="reports.totalTax" value={summary?.totalTax} />
        <KPI label="reports.totalDiscount" value={summary?.totalDiscount} />
        <KPI label="reports.averageOrderValue" value={summary?.averageOrderValue} />
      </Stack>
      {renderDataTable(items)}
    </>
  );

  const renderProfitLoss = () => (
    <>
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap mb={3}>
        <KPI label="reports.totalRevenue" value={summary?.totalRevenue} />
        <KPI label="reports.costOfGoods" value={summary?.costOfGoods} />
        <KPI label="reports.grossProfit" value={summary?.grossProfit} />
        <KPI label="reports.totalExpenses" value={summary?.totalExpenses} />
        <KPI label="reports.netProfit" value={summary?.netProfit} />
        <KPI label="reports.marginPercent" value={summary?.margin} prefix="%" />
      </Stack>
      {renderDataTable(items)}
    </>
  );

  const renderInventoryStatus = () => renderDataTable(items);

  const renderTopProducts = () => (
    <>
      {chartData.length > 0 && (
        <Paper sx={{ p: 2, borderRadius: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>{t('reports.topProducts')}</Typography>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="sales" fill="#1976d2" name={t('reports.totalSales')} />
              <Bar dataKey="revenue" fill="#388e3c" name={t('reports.totalRevenue')} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}
      {renderDataTable(items)}
    </>
  );

  const renderSlowMoving = () => renderDataTable(items);

  const renderCashierPerformance = () => (
    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap mb={3}>
      {renderDataTable(items)}
    </Stack>
  );

  const renderCustomerStatement = () => renderDataTable(ledger.length > 0 ? ledger : items);

  const renderSupplierStatement = () => renderDataTable(ledger.length > 0 ? ledger : items);

  const renderTaxReport = () => renderDataTable(taxBreakdown.length > 0 ? taxBreakdown : items);

  const renderShiftReport = () => (
    <>
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap mb={3}>
        <KPI label="shifts.shiftNumber" value={summary?.shiftNumber ? Number(summary.shiftNumber) : undefined} />
        <KPI label="shifts.openingBalance" value={summary?.openingBalance} />
        <KPI label="shifts.closingBalance" value={summary?.closingBalance} />
        <KPI label="shifts.expectedBalance" value={summary?.expectedBalance} />
        <KPI label="shifts.difference" value={summary?.difference} />
        <KPI label="shifts.totalSales" value={summary?.totalSales} />
        <KPI label="shifts.totalInvoices" value={summary?.totalInvoices} />
      </Stack>
      {renderDataTable(items)}
    </>
  );

  const renderDailySummary = () => (
    <>
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap mb={3}>
        <KPI label="reports.totalSales" value={summary?.totalSales} />
        <KPI label="reports.totalOrders" value={summary?.totalOrders} />
        <KPI label="reports.totalRevenue" value={summary?.totalRevenue} />
        <KPI label="reports.netProfit" value={summary?.netProfit} />
        <KPI label="reports.totalCustomers" value={summary?.totalCustomers} />
        <KPI label="reports.averageOrderValue" value={summary?.averageOrderValue} />
      </Stack>
      {renderDataTable(items)}
    </>
  );

  const renderDataTable = (data: Array<Record<string, unknown>>) => {
    if (!data || data.length === 0) return null;
    const keys = Object.keys(data[0] || {});
    return (
      <TableContainer component={Paper} sx={{ borderRadius: 3, maxHeight: 500 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {keys.map((key) => (
                <TableCell key={key} sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                  {key}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, i) => (
              <TableRow key={i} hover>
                {keys.map((key) => (
                  <TableCell key={key}>
                    {typeof row[key] === 'number'
                      ? (row[key] as number).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', { minimumFractionDigits: 2 })
                      : String(row[key] ?? '—')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderContent = () => {
    if (!generated && !isFetching) {
      return (
        <Box textAlign="center" py={12}>
          <Summarize sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" mb={1}>
            {t('reports.generateReportHint', 'Configure filters and generate the report')}
          </Typography>
          <Button variant="contained" onClick={handleGenerate} startIcon={<BarChartIcon />} size="large">
            {t('reports.generateReport')}
          </Button>
        </Box>
      );
    }

    if (isFetching) {
      return (
        <Stack spacing={2}>
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} variant="rounded" height={60} sx={{ borderRadius: 2 }} />
          ))}
        </Stack>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {(error as Error).message || t('common.somethingWentWrong')}
        </Alert>
      );
    }

    switch (type) {
      case 'sales': return renderSalesReport();
      case 'profit-loss': return renderProfitLoss();
      case 'inventory-status': return renderInventoryStatus();
      case 'inventory-movements': return renderDataTable(items);
      case 'top-products': return renderTopProducts();
      case 'slow-moving': return renderSlowMoving();
      case 'cashier-performance': return renderCashierPerformance();
      case 'customer-statement': return renderCustomerStatement();
      case 'supplier-statement': return renderSupplierStatement();
      case 'tax': return renderTaxReport();
      case 'shift': return renderShiftReport();
      case 'daily-summary': return renderDailySummary();
      default: return renderDataTable(items);
    }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" useFlexGap mb={3}>
        <Typography variant="h4" fontWeight={700}>
          {t(reportTitles[type || ''] || 'reports.report')}
        </Typography>
        {generated && !isFetching && !error && (
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<PictureAsPdf />} size="small" onClick={() => handleExport('pdf')}>
              PDF
            </Button>
            <Button variant="outlined" startIcon={<GridOn />} size="small" onClick={() => handleExport('excel')}>
              Excel
            </Button>
            <Button variant="outlined" startIcon={<TableChart />} size="small" onClick={() => handleExport('csv')}>
              CSV
            </Button>
            <IconButton onClick={handleGenerate}>
              <RefreshIcon />
            </IconButton>
          </Stack>
        )}
      </Stack>

      <Paper sx={{ p: 2.5, borderRadius: 3, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
          <TextField
            label={t('common.startDate')}
            type="date"
            size="small"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 160 }}
          />
          <TextField
            label={t('common.endDate')}
            type="date"
            size="small"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 160 }}
          />
          <Autocomplete
            size="small"
            options={branches || []}
            getOptionLabel={(b) => (language === 'ar' ? b.nameAr || b.name : b.nameEn || b.name)}
            value={branches?.find((b) => b.id === branchId) || null}
            onChange={(_, v) => setBranchId(v?.id || '')}
            renderInput={(p) => <TextField {...p} label={t('branches.branch')} />}
            sx={{ minWidth: 200 }}
            isOptionEqualToValue={(o, v) => o.id === v.id}
          />
          {type === 'customer-statement' && (
            <Autocomplete
              size="small"
              options={customers || []}
              getOptionLabel={(c) => c.name}
              value={customers?.find((c) => c.id === customerId) || null}
              onChange={(_, v) => setCustomerId(v?.id || '')}
              renderInput={(p) => <TextField {...p} label={t('customers.customer')} />}
              sx={{ minWidth: 220 }}
              isOptionEqualToValue={(o, v) => o.id === v.id}
            />
          )}
          {type === 'supplier-statement' && (
            <Autocomplete
              size="small"
              options={suppliers || []}
              getOptionLabel={(s) => s.name}
              value={suppliers?.find((s) => s.id === supplierId) || null}
              onChange={(_, v) => setSupplierId(v?.id || '')}
              renderInput={(p) => <TextField {...p} label={t('suppliers.supplier')} />}
              sx={{ minWidth: 220 }}
              isOptionEqualToValue={(o, v) => o.id === v.id}
            />
          )}
          {type === 'shift' && (
            <TextField
              size="small"
              label={t('shifts.shiftNumber')}
              value={shiftId}
              onChange={(e) => setShiftId(e.target.value)}
              sx={{ minWidth: 160 }}
            />
          )}
          <Button variant="contained" onClick={handleGenerate} disabled={isFetching} startIcon={isFetching ? <CircularProgress size={18} /> : <BarChartIcon />}>
            {t('reports.generateReport')}
          </Button>
        </Stack>
      </Paper>

      {renderContent()}
    </Box>
  );
}