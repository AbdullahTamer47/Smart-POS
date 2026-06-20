import { create } from 'zustand';

export interface Product {
  id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  sku: string;
  barcode?: string;
  image?: string;
  categoryId?: string;
  categoryName?: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  taxRate: number;
  isActive: boolean;
  hasExpiry: boolean;
  hasVariants: boolean;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  taxRate: number;
  variant?: {
    id: string;
    name: string;
    value: string;
  };
  note?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  loyaltyPoints?: number;
  creditLimit?: number;
  balance?: number;
}

export interface Payment {
  id: string;
  method: 'cash' | 'card' | 'credit' | 'wallet' | 'giftCard' | 'bankTransfer';
  amount: number;
  reference?: string;
  note?: string;
  cardNumber?: string;
  giftCardCode?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  minOrderAmount?: number;
}

export interface GiftCard {
  id: string;
  code: string;
  balance: number;
  isActive: boolean;
}

interface CartTotals {
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  grandTotal: number;
  totalPaid: number;
  balance: number;
}

interface POSState {
  cart: CartItem[];
  selectedCustomer: Customer | null;
  appliedCoupon: Coupon | null;
  appliedGiftCard: GiftCard | null;
  payments: Payment[];
  heldInvoiceId: string | null;
  isScanning: boolean;
  searchQuery: string;
  selectedCategory: string | null;
  quickKeys: Product[];
  isProcessing: boolean;
}

interface POSActions {
  addToCart: (product: Product, quantity?: number, variant?: CartItem['variant'], note?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateDiscount: (itemId: string, discount: number, discountType: 'percentage' | 'fixed') => void;
  updateItemNote: (itemId: string, note: string) => void;
  clearCart: () => void;
  setCustomer: (customer: Customer | null) => void;
  setCoupon: (coupon: Coupon | null) => void;
  removeCoupon: () => void;
  setGiftCard: (giftCard: GiftCard | null) => void;
  removeGiftCard: () => void;
  addPayment: (payment: Payment) => void;
  removePayment: (paymentId: string) => void;
  clearPayments: () => void;
  setScanning: (scanning: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (categoryId: string | null) => void;
  setQuickKeys: (products: Product[]) => void;
  setProcessing: (processing: boolean) => void;
  holdCurrentInvoice: (invoiceId: string) => void;
  resumeInvoice: (invoiceId: string) => void;
  clearHeldInvoice: () => void;
  calculateTotals: () => CartTotals;
}

type POSStore = POSState & POSActions;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function calculateItemDiscount(item: CartItem): number {
  const lineTotal = item.unitPrice * item.quantity;
  if (item.discountType === 'percentage') {
    return (lineTotal * item.discount) / 100;
  }
  return item.discount;
}

function calculateItemTax(item: CartItem): number {
  const lineTotal = item.unitPrice * item.quantity;
  const afterDiscount = lineTotal - calculateItemDiscount(item);
  return (afterDiscount * item.taxRate) / 100;
}

export const usePOSStore = create<POSStore>((set, get) => ({
  cart: [],
  selectedCustomer: null,
  appliedCoupon: null,
  appliedGiftCard: null,
  payments: [],
  heldInvoiceId: null,
  isScanning: false,
  searchQuery: '',
  selectedCategory: null,
  quickKeys: [],
  isProcessing: false,

  addToCart: (product: Product, quantity = 1, variant?: CartItem['variant'], note?: string) => {
    const { cart } = get();
    const existingIndex = cart.findIndex(
      (item) =>
        item.product.id === product.id &&
        item.variant?.id === variant?.id
    );

    if (existingIndex >= 0) {
      const updatedCart = [...cart];
      updatedCart[existingIndex] = {
        ...updatedCart[existingIndex]!,
        quantity: updatedCart[existingIndex]!.quantity + quantity,
        note: note || updatedCart[existingIndex]!.note,
      };
      set({ cart: updatedCart });
    } else {
      const newItem: CartItem = {
        id: generateId(),
        product,
        quantity,
        unitPrice: product.sellingPrice,
        discount: 0,
        discountType: 'fixed',
        taxRate: product.taxRate,
        variant,
        note,
      };
      set({ cart: [...cart, newItem] });
    }
  },

  removeFromCart: (itemId: string) => {
    const { cart } = get();
    set({ cart: cart.filter((item) => item.id !== itemId) });
  },

  updateQuantity: (itemId: string, quantity: number) => {
    const { cart } = get();
    if (quantity <= 0) {
      set({ cart: cart.filter((item) => item.id !== itemId) });
      return;
    }
    const updatedCart = cart.map((item) =>
      item.id === itemId ? { ...item, quantity } : item
    );
    set({ cart: updatedCart });
  },

  updateDiscount: (itemId: string, discount: number, discountType: 'percentage' | 'fixed') => {
    const { cart } = get();
    const updatedCart = cart.map((item) =>
      item.id === itemId ? { ...item, discount, discountType } : item
    );
    set({ cart: updatedCart });
  },

  updateItemNote: (itemId: string, note: string) => {
    const { cart } = get();
    const updatedCart = cart.map((item) =>
      item.id === itemId ? { ...item, note } : item
    );
    set({ cart: updatedCart });
  },

  clearCart: () => {
    set({
      cart: [],
      selectedCustomer: null,
      appliedCoupon: null,
      appliedGiftCard: null,
      payments: [],
      heldInvoiceId: null,
    });
  },

  setCustomer: (customer: Customer | null) => {
    set({ selectedCustomer: customer });
  },

  setCoupon: (coupon: Coupon | null) => {
    set({ appliedCoupon: coupon });
  },

  removeCoupon: () => {
    set({ appliedCoupon: null });
  },

  setGiftCard: (giftCard: GiftCard | null) => {
    set({ appliedGiftCard: giftCard });
  },

  removeGiftCard: () => {
    set({ appliedGiftCard: null });
  },

  addPayment: (payment: Payment) => {
    set((state) => ({ payments: [...state.payments, payment] }));
  },

  removePayment: (paymentId: string) => {
    const { payments } = get();
    set({ payments: payments.filter((p) => p.id !== paymentId) });
  },

  clearPayments: () => {
    set({ payments: [] });
  },

  setScanning: (scanning: boolean) => {
    set({ isScanning: scanning });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setSelectedCategory: (categoryId: string | null) => {
    set({ selectedCategory: categoryId });
  },

  setQuickKeys: (products: Product[]) => {
    set({ quickKeys: products });
  },

  setProcessing: (processing: boolean) => {
    set({ isProcessing: processing });
  },

  holdCurrentInvoice: (invoiceId: string) => {
    set({ heldInvoiceId: invoiceId });
  },

  resumeInvoice: (_invoiceId: string) => {
    // Invoice data is already in the cart state
    set({ heldInvoiceId: null });
  },

  clearHeldInvoice: () => {
    set({ heldInvoiceId: null });
  },

  calculateTotals: (): CartTotals => {
    const { cart, payments, appliedCoupon } = get();

    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    for (const item of cart) {
      const lineTotal = item.unitPrice * item.quantity;
      subtotal += lineTotal;

      const itemDiscount = calculateItemDiscount(item);
      totalDiscount += itemDiscount;

      const itemTax = calculateItemTax(item);
      totalTax += itemTax;
    }

    let grandTotal = subtotal + totalTax - totalDiscount;

    if (appliedCoupon) {
      let couponDiscount = 0;
      if (appliedCoupon.discountType === 'percentage') {
        couponDiscount = (grandTotal * appliedCoupon.discountValue) / 100;
        if (appliedCoupon.maxDiscount && couponDiscount > appliedCoupon.maxDiscount) {
          couponDiscount = appliedCoupon.maxDiscount;
        }
      } else {
        couponDiscount = appliedCoupon.discountValue;
      }
      if (couponDiscount > grandTotal) {
        couponDiscount = grandTotal;
      }
      totalDiscount += couponDiscount;
      grandTotal -= couponDiscount;
    }

    grandTotal = Math.max(0, Math.round(grandTotal * 100) / 100);
    subtotal = Math.round(subtotal * 100) / 100;
    totalDiscount = Math.round(totalDiscount * 100) / 100;
    totalTax = Math.round(totalTax * 100) / 100;

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const balance = Math.round((grandTotal - totalPaid) * 100) / 100;

    return {
      subtotal,
      totalDiscount,
      totalTax,
      grandTotal,
      totalPaid: Math.round(totalPaid * 100) / 100,
      balance,
    };
  },
}));