export interface InvoiceItem {
  id: string;
  productName: string;
  productNameAr?: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  taxRate: number;
  total: number;
  variantName?: string;
}

export interface ThermalPrintOptions {
  width?: 58 | 80;
  showLogo?: boolean;
  showBarcode?: boolean;
  showQRCode?: boolean;
  footerMessage?: string;
  footerMessageAr?: string;
  copies?: number;
  language?: 'ar' | 'en';
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  branchName?: string;
  branchNameAr?: string;
  branchAddress?: string;
  branchPhone?: string;
  branchVatNumber?: string;
  cashierName?: string;
  customerName?: string;
  customerPhone?: string;
  customerTaxNumber?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  tax: number;
  grandTotal: number;
  paid: number;
  balance: number;
  payments: Array<{
    method: string;
    amount: number;
    reference?: string;
  }>;
  notes?: string;
  terms?: string;
  storeName?: string;
  storeNameAr?: string;
  storeLogo?: string;
}

export interface KitchenOrderItem {
  name: string;
  nameAr?: string;
  quantity: number;
  variant?: string;
  notes?: string;
}

export interface KitchenOrder {
  orderNumber: string;
  tableNumber?: string;
  customerName?: string;
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  items: KitchenOrderItem[];
  timestamp: string;
  waiterName?: string;
  specialInstructions?: string;
}

function formatCurrency(amount: number): string {
  return amount.toFixed(2);
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function formatTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
}

function calculateItemDiscount(item: InvoiceItem): number {
  if (item.discountType === 'percentage') {
    return (item.unitPrice * item.quantity * item.discount) / 100;
  }
  return item.discount;
}

function getPaymentMethodLabel(method: string, lang: 'ar' | 'en'): string {
  const labels: Record<string, { ar: string; en: string }> = {
    cash: { ar: 'نقدي', en: 'Cash' },
    card: { ar: 'بطاقة', en: 'Card' },
    credit: { ar: 'آجل', en: 'Credit' },
    wallet: { ar: 'محفظة', en: 'Wallet' },
    giftCard: { ar: 'بطاقة هدية', en: 'Gift Card' },
    bankTransfer: { ar: 'تحويل بنكي', en: 'Bank Transfer' },
  };
  return labels[method]?.[lang] || method;
}

function getLanguageLabels(lang: 'ar' | 'en') {
  return {
    invoice: lang === 'ar' ? 'فاتورة' : 'Invoice',
    date: lang === 'ar' ? 'التاريخ' : 'Date',
    time: lang === 'ar' ? 'الوقت' : 'Time',
    item: lang === 'ar' ? 'الصنف' : 'Item',
    qty: lang === 'ar' ? 'الكمية' : 'Qty',
    price: lang === 'ar' ? 'السعر' : 'Price',
    total: lang === 'ar' ? 'الإجمالي' : 'Total',
    subtotal: lang === 'ar' ? 'المجموع' : 'Subtotal',
    discount: lang === 'ar' ? 'الخصم' : 'Discount',
    tax: lang === 'ar' ? 'الضريبة' : 'Tax',
    grandTotal: lang === 'ar' ? 'الإجمالي الكلي' : 'Grand Total',
    paid: lang === 'ar' ? 'المدفوع' : 'Paid',
    balance: lang === 'ar' ? 'المتبقي' : 'Balance',
    change: lang === 'ar' ? 'الباقي' : 'Change',
    paymentMethod: lang === 'ar' ? 'طريقة الدفع' : 'Payment Method',
    customer: lang === 'ar' ? 'العميل' : 'Customer',
    cashier: lang === 'ar' ? 'الكاشير' : 'Cashier',
    branch: lang === 'ar' ? 'الفرع' : 'Branch',
    vatNumber: lang === 'ar' ? 'الرقم الضريبي' : 'VAT Number',
    thankYou: lang === 'ar' ? 'شكراً لتسوقكم معنا' : 'Thank you for shopping with us',
    visitAgain: lang === 'ar' ? 'نتمنى زيارتكم مرة أخرى' : 'We hope to see you again',
    notes: lang === 'ar' ? 'ملاحظات' : 'Notes',
    terms: lang === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions',
    orderNumber: lang === 'ar' ? 'رقم الطلب' : 'Order #',
    table: lang === 'ar' ? 'الطاولة' : 'Table',
    orderType: lang === 'ar' ? 'نوع الطلب' : 'Order Type',
    waiter: lang === 'ar' ? 'النادل' : 'Waiter',
    instructions: lang === 'ar' ? 'تعليمات خاصة' : 'Special Instructions',
    dineIn: lang === 'ar' ? 'داخل المطعم' : 'Dine-in',
    takeaway: lang === 'ar' ? 'سفري' : 'Takeaway',
    delivery: lang === 'ar' ? 'توصيل' : 'Delivery',
    page: lang === 'ar' ? 'صفحة' : 'Page',
    of: lang === 'ar' ? 'من' : 'of',
  };
}

function openPrintWindow(html: string, title: string): void {
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) {
    alert('Please allow pop-ups for printing.');
    return;
  }

  printWindow.document.write(html);
  printWindow.document.title = title;
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
  };

  printWindow.onafterprint = () => {
    printWindow.close();
  };
}

export function printThermalReceipt(
  invoice: InvoiceData,
  options: ThermalPrintOptions = {}
): void {
  const {
    width = 80,
    showLogo = true,
    showBarcode = true,
    showQRCode = false,
    footerMessage,
    footerMessageAr,
    language = 'ar',
  } = options;

  const labels = getLanguageLabels(language);
  const isRtl = language === 'ar';
  const dir = isRtl ? 'rtl' : 'ltr';
  const maxWidth = width === 58 ? '58mm' : '80mm';
  const colWidth = width === 58 ? '28mm' : '38mm';
  const itemNameWidth = width === 58 ? '22mm' : '30mm';

  const change = invoice.paid > invoice.grandTotal ? invoice.paid - invoice.grandTotal : 0;

  const lines: string[] = [];

  lines.push(`
    <div class="header" style="text-align:center;margin-bottom:4mm;">
      ${showLogo && invoice.storeLogo ? `<img src="${invoice.storeLogo}" style="max-width:${colWidth};max-height:15mm;margin-bottom:2mm;" alt="logo" />` : ''}
      ${invoice.storeName ? `<div class="store-name" style="font-size:${width === 58 ? '12px' : '14px'};font-weight:bold;">${invoice.storeName}</div>` : ''}
      ${invoice.storeNameAr ? `<div class="store-name-ar" style="font-size:${width === 58 ? '11px' : '13px'};font-weight:bold;">${invoice.storeNameAr}</div>` : ''}
      ${invoice.branchName ? `<div style="font-size:${width === 58 ? '10px' : '11px'};">${invoice.branchName}</div>` : ''}
      ${invoice.branchAddress ? `<div style="font-size:${width === 58 ? '9px' : '10px'};">${invoice.branchAddress}</div>` : ''}
      ${invoice.branchPhone ? `<div style="font-size:${width === 58 ? '9px' : '10px'};">${invoice.branchPhone}</div>` : ''}
      ${invoice.branchVatNumber ? `<div style="font-size:${width === 58 ? '9px' : '10px'};">${labels.vatNumber}: ${invoice.branchVatNumber}</div>` : ''}
    </div>
  `);

  lines.push(`<hr style="border:none;border-top:1px dashed #000;margin:2mm 0;" />`);

  lines.push(`
    <div style="text-align:center;font-size:${width === 58 ? '10px' : '11px'};margin-bottom:2mm;">
      <div style="font-weight:bold;">${labels.invoice}: ${invoice.invoiceNumber}</div>
      <div>${labels.date}: ${formatDate(invoice.invoiceDate)} | ${labels.time}: ${formatTime(invoice.invoiceDate)}</div>
    </div>
  `);

  lines.push(`<hr style="border:none;border-top:1px dashed #000;margin:2mm 0;" />`);

  if (invoice.customerName) {
    lines.push(`
      <div style="font-size:${width === 58 ? '10px' : '11px'};margin-bottom:2mm;">
        <div>${labels.customer}: ${invoice.customerName}</div>
        ${invoice.customerPhone ? `<div>${invoice.customerPhone}</div>` : ''}
      </div>
    `);
    lines.push(`<hr style="border:none;border-top:1px dashed #000;margin:2mm 0;" />`);
  }

  if (invoice.cashierName) {
    lines.push(`
      <div style="font-size:${width === 58 ? '9px' : '10px'};margin-bottom:2mm;">
        ${labels.cashier}: ${invoice.cashierName}
      </div>
    `);
  }

  const headerFontSize = width === 58 ? '9px' : '10px';
  const itemFontSize = width === 58 ? '9px' : '10px';

  lines.push(`
    <table style="width:100%;font-size:${headerFontSize};border-collapse:collapse;margin-bottom:2mm;">
      <thead>
        <tr style="border-bottom:1px solid #000;">
          <th style="text-align:${isRtl ? 'right' : 'left'};width:${itemNameWidth};font-size:${headerFontSize};">${labels.item}</th>
          <th style="text-align:center;font-size:${headerFontSize};">${labels.qty}</th>
          <th style="text-align:${isRtl ? 'left' : 'right'};font-size:${headerFontSize};">${labels.price}</th>
          <th style="text-align:${isRtl ? 'left' : 'right'};font-size:${headerFontSize};">${labels.total}</th>
        </tr>
      </thead>
      <tbody>
  `);

  for (const item of invoice.items) {
    const itemTotal = item.unitPrice * item.quantity;
    const itemDiscount = calculateItemDiscount(item);
    const displayTotal = itemTotal - itemDiscount;
    const displayName = item.variantName
      ? `${item.productName} (${item.variantName})`
      : item.productName;

    lines.push(`
      <tr>
        <td style="font-size:${itemFontSize};word-break:break-word;">${displayName}</td>
        <td style="text-align:center;font-size:${itemFontSize};">${item.quantity}</td>
        <td style="text-align:${isRtl ? 'left' : 'right'};font-size:${itemFontSize};">${formatCurrency(item.unitPrice)}</td>
        <td style="text-align:${isRtl ? 'left' : 'right'};font-size:${itemFontSize};">${formatCurrency(displayTotal)}</td>
      </tr>
    `);

    if (itemDiscount > 0) {
      lines.push(`
        <tr>
          <td style="font-size:${itemFontSize};padding-${isRtl ? 'right' : 'left'}:4mm;color:#555;">${labels.discount}</td>
          <td></td>
          <td></td>
          <td style="text-align:${isRtl ? 'left' : 'right'};font-size:${itemFontSize};color:#555;">-${formatCurrency(itemDiscount)}</td>
        </tr>
      `);
    }
  }

  lines.push(`
      </tbody>
    </table>
  `);

  lines.push(`<hr style="border:none;border-top:1px dashed #000;margin:2mm 0;" />`);

  const summaryFontSize = width === 58 ? '10px' : '11px';
  const summary = [
    { label: labels.subtotal, value: invoice.subtotal },
    { label: labels.discount, value: invoice.discount },
    { label: labels.tax, value: invoice.tax },
  ];

  lines.push(`
    <table style="width:100%;font-size:${summaryFontSize};border-collapse:collapse;margin-bottom:2mm;">
  `);

  for (const row of summary) {
    if (row.value === 0) continue;
    lines.push(`
      <tr>
        <td style="text-align:${isRtl ? 'right' : 'left'};">${row.label}</td>
        <td style="text-align:${isRtl ? 'left' : 'right'};width:${colWidth};">${row.label === labels.discount ? '-' : ''}${formatCurrency(row.value)}</td>
      </tr>
    `);
  }

  lines.push(`
      <tr style="border-top:1px solid #000;font-weight:bold;font-size:${width === 58 ? '12px' : '14px'};">
        <td>${labels.grandTotal}</td>
        <td style="text-align:${isRtl ? 'left' : 'right'};">${formatCurrency(invoice.grandTotal)}</td>
      </tr>
  `);

  if (invoice.paid > 0) {
    lines.push(`
      <tr>
        <td>${labels.paid}</td>
        <td style="text-align:${isRtl ? 'left' : 'right'};">${formatCurrency(invoice.paid)}</td>
      </tr>
    `);
  }

  if (invoice.balance > 0) {
    lines.push(`
      <tr style="font-weight:bold;">
        <td>${labels.balance}</td>
        <td style="text-align:${isRtl ? 'left' : 'right'};">${formatCurrency(invoice.balance)}</td>
      </tr>
    `);
  }

  if (change > 0) {
    lines.push(`
      <tr style="font-weight:bold;">
        <td>${labels.change}</td>
        <td style="text-align:${isRtl ? 'left' : 'right'};">${formatCurrency(change)}</td>
      </tr>
    `);
  }

  lines.push(`</table>`);

  if (invoice.payments.length > 0) {
    lines.push(`<hr style="border:none;border-top:1px dashed #000;margin:2mm 0;" />`);
    lines.push(`
      <div style="font-size:${summaryFontSize};margin-bottom:2mm;">
        <div style="font-weight:bold;">${labels.paymentMethod}:</div>
    `);

    for (const payment of invoice.payments) {
      lines.push(`
        <div style="margin-${isRtl ? 'right' : 'left'}:2mm;">
          ${getPaymentMethodLabel(payment.method, language)}: ${formatCurrency(payment.amount)}
          ${payment.reference ? ` (${payment.reference})` : ''}
        </div>
      `);
    }

    lines.push(`</div>`);
  }

  if (invoice.notes) {
    lines.push(`<hr style="border:none;border-top:1px dashed #000;margin:2mm 0;" />`);
    lines.push(`
      <div style="font-size:${width === 58 ? '9px' : '10px'};margin-bottom:2mm;">
        ${labels.notes}: ${invoice.notes}
      </div>
    `);
  }

  if (showBarcode) {
    lines.push(`
      <div style="text-align:center;margin:2mm 0;">
        <div style="font-size:${width === 58 ? '10px' : '12px'};font-family:monospace;margin-bottom:1mm;">*${invoice.invoiceNumber}*</div>
      </div>
    `);
  }

  if (showQRCode) {
    const qrData = encodeURIComponent(
      `INV:${invoice.invoiceNumber}|DATE:${invoice.invoiceDate}|TOTAL:${invoice.grandTotal}`
    );
    lines.push(`
      <div style="text-align:center;margin:2mm 0;">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${qrData}"
             style="width:20mm;height:20mm;" alt="QR" />
      </div>
    `);
  }

  lines.push(`<hr style="border:none;border-top:1px dashed #000;margin:2mm 0;" />`);

  lines.push(`
    <div style="text-align:center;font-size:${width === 58 ? '10px' : '11px'};">
      <div style="font-weight:bold;">${footerMessageAr || footerMessage || labels.thankYou}</div>
      <div>${footerMessage || labels.visitAgain}</div>
    </div>
  `);

  const printCss = `
    @page {
      size: ${maxWidth} auto;
      margin: 0;
    }
    @media print {
      body {
        margin: 0;
        padding: 3mm;
        width: ${maxWidth};
      }
    }
  `;

  const html = `<!DOCTYPE html>
<html dir="${dir}" lang="${language}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', 'Monaco', monospace;
      width: ${maxWidth};
      min-width: ${maxWidth};
      max-width: ${maxWidth};
      padding: 3mm;
      color: #000;
      background: #fff;
    }
    ${printCss}
  </style>
  <title>${labels.invoice} ${invoice.invoiceNumber}</title>
</head>
<body>
  ${lines.join('\n')}
</body>
</html>`;

  openPrintWindow(html, `${labels.invoice} ${invoice.invoiceNumber}`);
}

export function printA4Invoice(invoice: InvoiceData): void {
  const labels = getLanguageLabels('ar');

  const lines: string[] = [];

  lines.push(`
    <div class="invoice-wrapper">
      <table class="header-table">
        <tr>
          <td class="logo-cell">
            ${invoice.storeLogo ? `<img src="${invoice.storeLogo}" class="logo" alt="logo" />` : ''}
          </td>
          <td class="header-info">
            <h1 class="store-name">${invoice.storeNameAr || invoice.storeName || ''}</h1>
            ${invoice.branchName ? `<div>${labels.branch}: ${invoice.branchName}</div>` : ''}
            ${invoice.branchAddress ? `<div>${invoice.branchAddress}</div>` : ''}
            ${invoice.branchPhone ? `<div>${invoice.branchPhone}</div>` : ''}
            ${invoice.branchVatNumber ? `<div>${labels.vatNumber}: ${invoice.branchVatNumber}</div>` : ''}
          </td>
        </tr>
      </table>
      <hr />
  `);

  lines.push(`
    <div class="invoice-title">
      <h2 style="margin:0;">${labels.invoice}</h2>
    </div>
  `);

  lines.push(`
    <table class="meta-table">
      <tr>
        <td class="meta-left">
          <div><strong>${labels.invoice}:</strong> ${invoice.invoiceNumber}</div>
          <div><strong>${labels.date}:</strong> ${formatDate(invoice.invoiceDate)}</div>
          <div><strong>${labels.time}:</strong> ${formatTime(invoice.invoiceDate)}</div>
          ${invoice.cashierName ? `<div><strong>${labels.cashier}:</strong> ${invoice.cashierName}</div>` : ''}
        </td>
        <td class="meta-right">
          ${invoice.customerName ? `
            <div><strong>${labels.customer}:</strong> ${invoice.customerName}</div>
            ${invoice.customerPhone ? `<div><strong>${invoice.customerPhone}</strong></div>` : ''}
            ${invoice.customerTaxNumber ? `<div><strong>${labels.vatNumber}:</strong> ${invoice.customerTaxNumber}</div>` : ''}
          ` : ''}
        </td>
      </tr>
    </table>
  `);

  lines.push(`
    <table class="items-table">
      <thead>
        <tr>
          <th class="col-num">#</th>
          <th class="col-item">${labels.item}</th>
          <th class="col-sku">SKU</th>
          <th class="col-qty">${labels.qty}</th>
          <th class="col-price">${labels.price}</th>
          <th class="col-discount">${labels.discount}</th>
          <th class="col-tax">${labels.tax}</th>
          <th class="col-total">${labels.total}</th>
        </tr>
      </thead>
      <tbody>
  `);

  let index = 1;
  for (const item of invoice.items) {
    const itemTotal = item.unitPrice * item.quantity;
    const itemDiscount = calculateItemDiscount(item);
    const itemTax = ((itemTotal - itemDiscount) * item.taxRate) / 100;
    const displayName = item.variantName
      ? `${item.productName} (${item.variantName})`
      : item.productName;

    lines.push(`
      <tr>
        <td class="col-num">${index++}</td>
        <td class="col-item">${displayName}</td>
        <td class="col-sku">${item.sku}</td>
        <td class="col-qty">${item.quantity}</td>
        <td class="col-price">${formatCurrency(item.unitPrice)}</td>
        <td class="col-discount">${itemDiscount > 0 ? formatCurrency(itemDiscount) : '-'}</td>
        <td class="col-tax">${formatCurrency(itemTax)}</td>
        <td class="col-total">${formatCurrency(itemTotal - itemDiscount)}</td>
      </tr>
    `);
  }

  lines.push(`
      </tbody>
    </table>
  `);

  lines.push(`
    <table class="summary-table">
      <tr>
        <td class="summary-labels">
          <div>${labels.subtotal}</div>
          ${invoice.discount > 0 ? `<div>${labels.discount}</div>` : ''}
          ${invoice.tax > 0 ? `<div>${labels.tax}</div>` : ''}
          <div class="grand-total">${labels.grandTotal}</div>
        </td>
        <td class="summary-values">
          <div>${formatCurrency(invoice.subtotal)}</div>
          ${invoice.discount > 0 ? `<div>-${formatCurrency(invoice.discount)}</div>` : ''}
          ${invoice.tax > 0 ? `<div>${formatCurrency(invoice.tax)}</div>` : ''}
          <div class="grand-total">${formatCurrency(invoice.grandTotal)}</div>
        </td>
      </tr>
    </table>
  `);

  if (invoice.payments.length > 0) {
    lines.push(`
      <div class="section-title">${labels.paymentMethod}</div>
      <table class="payments-table">
        <thead>
          <tr>
            <th>${labels.paymentMethod}</th>
            <th>${labels.total}</th>
            <th>Reference</th>
          </tr>
        </thead>
        <tbody>
    `);

    for (const payment of invoice.payments) {
      lines.push(`
        <tr>
          <td>${getPaymentMethodLabel(payment.method, 'ar')}</td>
          <td>${formatCurrency(payment.amount)}</td>
          <td>${payment.reference || '-'}</td>
        </tr>
      `);
    }

    lines.push(`
        </tbody>
      </table>
    `);

    const change = invoice.paid > invoice.grandTotal ? invoice.paid - invoice.grandTotal : 0;
    lines.push(`
      <table class="payment-summary">
        <tr>
          <td>${labels.paid}</td>
          <td>${formatCurrency(invoice.paid)}</td>
        </tr>
        ${invoice.balance > 0 ? `
        <tr>
          <td>${labels.balance}</td>
          <td>${formatCurrency(invoice.balance)}</td>
        </tr>
        ` : ''}
        ${change > 0 ? `
        <tr>
          <td>${labels.change}</td>
          <td>${formatCurrency(change)}</td>
        </tr>
        ` : ''}
      </table>
    `);
  }

  if (invoice.notes) {
    lines.push(`
      <div class="section-title">${labels.notes}</div>
      <div class="notes-text">${invoice.notes}</div>
    `);
  }

  if (invoice.terms) {
    lines.push(`
      <div class="section-title">${labels.terms}</div>
      <div class="terms-text">${invoice.terms}</div>
    `);
  }

  lines.push(`
    <div class="footer">
      <div>${labels.thankYou}</div>
      <div>${labels.visitAgain}</div>
    </div>
  `);

  lines.push(`</div>`);

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 11px;
      color: #1a1a1a;
      background: #fff;
      padding: 15mm 10mm;
    }
    h1 { font-size: 20px; }
    h2 { font-size: 18px; }
    .invoice-wrapper { max-width: 190mm; margin: 0 auto; }
    .header-table { width: 100%; margin-bottom: 5mm; }
    .header-table td { vertical-align: top; }
    .logo-cell { width: 30mm; }
    .logo { max-width: 25mm; max-height: 25mm; }
    .header-info { text-align: right; }
    .store-name { font-size: 22px; margin-bottom: 2mm; color: #2563EB; }
    hr { border: none; border-top: 2px solid #2563EB; margin: 5mm 0; }
    .invoice-title { text-align: center; margin: 5mm 0; }
    .meta-table { width: 100%; margin-bottom: 8mm; }
    .meta-table td { vertical-align: top; width: 50%; }
    .meta-left { text-align: right; }
    .meta-right { text-align: right; }
    .meta-table div { margin-bottom: 1mm; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 8mm; }
    .items-table th { background: #2563EB; color: #fff; padding: 2mm; font-size: 10px; }
    .items-table td { padding: 2mm; border-bottom: 1px solid #e5e7eb; }
    .items-table tbody tr:nth-child(even) { background: #f9fafb; }
    .col-num { width: 5%; text-align: center; }
    .col-item { width: 25%; text-align: right; }
    .col-sku { width: 12%; text-align: right; }
    .col-qty { width: 8%; text-align: center; }
    .col-price { width: 12%; text-align: right; }
    .col-discount { width: 10%; text-align: right; }
    .col-tax { width: 10%; text-align: right; }
    .col-total { width: 12%; text-align: right; font-weight: bold; }
    .summary-table { width: 50%; margin-right: 0; margin-left: auto; margin-bottom: 8mm; }
    .summary-table td { padding: 1mm 0; }
    .summary-labels { text-align: right; font-weight: bold; }
    .summary-values { text-align: right; padding-right: 5mm; }
    .grand-total { font-size: 14px; font-weight: bold; color: #2563EB; margin-top: 1mm; }
    .section-title { font-size: 12px; font-weight: bold; color: #2563EB; margin: 5mm 0 2mm 0; border-bottom: 1px solid #2563EB; padding-bottom: 1mm; }
    .payments-table { width: 100%; border-collapse: collapse; margin-bottom: 5mm; }
    .payments-table th { background: #f3f4f6; padding: 2mm; font-size: 10px; text-align: right; }
    .payments-table td { padding: 2mm; border-bottom: 1px solid #e5e7eb; text-align: right; }
    .payment-summary { width: 40%; margin-right: 0; margin-left: auto; margin-bottom: 5mm; }
    .payment-summary td { padding: 1mm 0; }
    .payment-summary td:first-child { text-align: right; font-weight: bold; }
    .payment-summary td:last-child { text-align: right; padding-right: 5mm; }
    .notes-text { padding: 2mm; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 2mm; margin-bottom: 5mm; }
    .terms-text { font-size: 9px; color: #6b7280; margin-bottom: 5mm; }
    .footer { text-align: center; margin-top: 10mm; padding-top: 5mm; border-top: 1px solid #e5e7eb; color: #6b7280; }
    .footer div { margin-bottom: 1mm; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      @page { size: A4; margin: 10mm; }
    }
  </style>
  <title>${labels.invoice} ${invoice.invoiceNumber}</title>
</head>
<body>
  ${lines.join('\n')}
</body>
</html>`;

  openPrintWindow(html, `${labels.invoice} ${invoice.invoiceNumber}`);
}

export function printKitchenOrder(order: KitchenOrder): void {
  const labels = getLanguageLabels('ar');

  const orderTypeMap: Record<string, string> = {
    'dine-in': labels.dineIn,
    takeaway: labels.takeaway,
    delivery: labels.delivery,
  };

  const lines: string[] = [];

  lines.push(`
    <div class="ticket">
      <div class="header">
        <div class="order-type">${orderTypeMap[order.orderType] || order.orderType}</div>
        <div class="order-number">${labels.orderNumber}: ${order.orderNumber}</div>
        <div class="timestamp">${formatDate(order.timestamp)} ${formatTime(order.timestamp)}</div>
        ${order.tableNumber ? `<div class="table">${labels.table}: ${order.tableNumber}</div>` : ''}
        ${order.customerName ? `<div class="customer">${labels.customer}: ${order.customerName}</div>` : ''}
        ${order.waiterName ? `<div class="waiter">${labels.waiter}: ${order.waiterName}</div>` : ''}
      </div>
      <hr />
      <div class="items">
  `);

  for (const item of order.items) {
    const displayName = item.variant
      ? `${item.nameAr || item.name} (${item.variant})`
      : item.nameAr || item.name;

    lines.push(`
      <div class="item-row">
        <span class="item-qty">${item.quantity}x</span>
        <span class="item-name">${displayName}</span>
      </div>
    `);

    if (item.notes) {
      lines.push(`
        <div class="item-notes">-- ${item.notes}</div>
      `);
    }
  }

  lines.push(`
      </div>
  `);

  if (order.specialInstructions) {
    lines.push(`
      <hr />
      <div class="instructions">
        <div class="instructions-title">${labels.instructions}:</div>
        <div class="instructions-text">${order.specialInstructions}</div>
      </div>
    `);
  }

  lines.push(`
      <hr />
      <div class="timestamp-footer">${new Date().toLocaleString('ar-SA')}</div>
    </div>
  `);

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', 'Monaco', monospace;
      font-size: 12px;
      color: #000;
      background: #fff;
      padding: 5mm;
      width: 80mm;
    }
    .ticket { width: 70mm; }
    .header { text-align: center; margin-bottom: 3mm; }
    .order-type { font-size: 16px; font-weight: bold; text-transform: uppercase; margin-bottom: 1mm; }
    .order-number { font-size: 18px; font-weight: bold; margin-bottom: 1mm; }
    .timestamp { font-size: 10px; margin-bottom: 1mm; }
    .table { font-size: 14px; font-weight: bold; margin-bottom: 1mm; }
    .customer { font-size: 11px; margin-bottom: 1mm; }
    .waiter { font-size: 10px; }
    hr { border: none; border-top: 1px dashed #000; margin: 3mm 0; }
    .items { margin-bottom: 3mm; }
    .item-row { display: flex; margin-bottom: 2mm; font-size: 13px; }
    .item-qty { font-weight: bold; min-width: 10mm; font-size: 14px; }
    .item-name { flex: 1; }
    .item-notes { font-size: 10px; padding-right: 10mm; color: #555; margin-bottom: 1mm; }
    .instructions { margin-bottom: 3mm; }
    .instructions-title { font-weight: bold; font-size: 11px; margin-bottom: 1mm; }
    .instructions-text { font-size: 11px; }
    .timestamp-footer { text-align: center; font-size: 9px; color: #888; }
    @media print {
      @page { size: 80mm auto; margin: 0; }
      body { margin: 0; padding: 5mm; }
    }
  </style>
  <title>${labels.orderNumber} ${order.orderNumber}</title>
</head>
<body>
  ${lines.join('\n')}
</body>
</html>`;

  openPrintWindow(html, `${labels.orderNumber} ${order.orderNumber}`);
}