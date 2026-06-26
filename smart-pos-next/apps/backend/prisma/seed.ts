import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // ---------------------------------------------------------------
  // Clean existing data in reverse dependency order
  // ---------------------------------------------------------------
  console.log("🧹 Cleaning existing data...");

  await prisma.couponUsage.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.ticketMessage.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoiceHold.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.supplierLedger.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.loyaltyTransaction.deleteMany();
  await prisma.loyaltyConfig.deleteMany();
  await prisma.giftCard.deleteMany();
  await prisma.customerLedger.deleteMany();
  await prisma.customerAddress.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.stockAlert.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.stockLevel.deleteMany();
  await prisma.productPrice.deleteMany();
  await prisma.priceList.deleteMany();
  await prisma.productCompositeItem.deleteMany();
  await prisma.productVariantOption.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productUnit.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.webhookEndpoint.deleteMany();
  await prisma.backup.deleteMany();
  await prisma.exchangeRate.deleteMany();
  await prisma.taxConfig.deleteMany();
  await prisma.revenue.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.cashShift.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.featureFlag.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.cashierProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.superAdmin.deleteMany();
  await prisma.currencyRate.deleteMany();

  console.log("✅ Cleaned existing data.");

  // ---------------------------------------------------------------
  // 1. Create Super Admin
  // ---------------------------------------------------------------
  console.log("👤 Creating Super Admin...");
  const adminPasswordHash = await bcrypt.hash("Admin@123456", 12);
  const superAdmin = await prisma.superAdmin.create({
    data: {
      email: "admin@smartpos.com",
      passwordHash: adminPasswordHash,
      name: "Super Admin",
      isActive: true,
    },
  });
  console.log(`  ✅ Super Admin created: ${superAdmin.email}`);

  // ---------------------------------------------------------------
  // 2. Create Subscription Plans
  // ---------------------------------------------------------------
  console.log("📦 Creating Subscription Plans...");

  const trialPlan = await prisma.subscriptionPlan.create({
    data: {
      nameAr: "تجريبي",
      nameEn: "Trial",
      descriptionAr: "خطة تجريبية مجانية لمدة 14 يوم",
      descriptionEn: "Free 14-day trial plan",
      maxBranches: 1,
      maxCashiers: 3,
      maxProducts: 500,
      maxInvoicesPerMonth: 1000,
      durationDays: 14,
      price: 0,
      features: [
        "1 Branch",
        "3 Cashiers",
        "500 Products",
        "1,000 Invoices/Month",
        "Basic Inventory",
        "Basic POS",
        "Basic Reports",
        "Email Support",
      ],
      interval: "TRIAL",
      isActive: true,
      sortOrder: 0,
    },
  });
  console.log(`  ✅ Trial Plan created: ${trialPlan.nameEn}`);

  const weeklyPlan = await prisma.subscriptionPlan.create({
    data: {
      nameAr: "اسبوعي",
      nameEn: "Weekly",
      descriptionAr: "خطة اسبوعية بسعر مناسب",
      descriptionEn: "Weekly plan at an affordable price",
      maxBranches: 2,
      maxCashiers: 5,
      maxProducts: 1000,
      maxInvoicesPerMonth: 2000,
      durationDays: 7,
      price: 9.99,
      features: [
        "2 Branches",
        "5 Cashiers",
        "1,000 Products",
        "2,000 Invoices/Month",
        "Full Inventory",
        "Full POS",
        "Basic Reports",
        "Email Support",
        "Multi-Warehouse",
      ],
      interval: "WEEKLY",
      isActive: true,
      sortOrder: 1,
    },
  });
  console.log(`  ✅ Weekly Plan created: ${weeklyPlan.nameEn}`);

  const monthlyPlan = await prisma.subscriptionPlan.create({
    data: {
      nameAr: "شهري",
      nameEn: "Monthly",
      descriptionAr: "خطة شهرية للمتاجر المتوسطة",
      descriptionEn: "Monthly plan for medium-sized stores",
      maxBranches: 5,
      maxCashiers: 10,
      maxProducts: 5000,
      maxInvoicesPerMonth: 10000,
      durationDays: 30,
      price: 29.99,
      features: [
        "5 Branches",
        "10 Cashiers",
        "5,000 Products",
        "10,000 Invoices/Month",
        "Full Inventory",
        "Full POS",
        "Advanced Reports",
        "Priority Support",
        "Multi-Warehouse",
        "Loyalty Program",
        "Gift Cards",
        "API Access",
      ],
      interval: "MONTHLY",
      isActive: true,
      sortOrder: 2,
    },
  });
  console.log(`  ✅ Monthly Plan created: ${monthlyPlan.nameEn}`);

  const yearlyPlan = await prisma.subscriptionPlan.create({
    data: {
      nameAr: "سنوي",
      nameEn: "Yearly",
      descriptionAr: "خطة سنوية شاملة مع أفضل توفير",
      descriptionEn: "Comprehensive yearly plan with best savings",
      maxBranches: 20,
      maxCashiers: 50,
      maxProducts: 999999,
      maxInvoicesPerMonth: 999999,
      durationDays: 365,
      price: 299.99,
      features: [
        "20 Branches",
        "50 Cashiers",
        "Unlimited Products",
        "Unlimited Invoices",
        "Full Inventory",
        "Full POS",
        "Advanced Reports",
        "24/7 Priority Support",
        "Multi-Warehouse",
        "Loyalty Program",
        "Gift Cards",
        "API Access",
        "ZATCA Integration",
        "Custom Branding",
        "Dedicated Account Manager",
        "White Label Option",
      ],
      interval: "YEARLY",
      isActive: true,
      sortOrder: 3,
    },
  });
  console.log(`  ✅ Yearly Plan created: ${yearlyPlan.nameEn}`);

  // ---------------------------------------------------------------
  // 3. Create Demo Tenant
  // ---------------------------------------------------------------
  console.log("🏢 Creating Demo Tenant...");
  const demoBranchPasswordHash = await bcrypt.hash("Trader@123456", 12);
  const demoTenant = await prisma.tenant.create({
    data: {
      name: "Demo Store",
      subdomain: "demo",
      email: "demo@smartpos.com",
      phone: "+966500000000",
      address: "Riyadh, Saudi Arabia",
      isActive: true,
      maxBranches: 2,
      maxCashiers: 5,
      maxProducts: 1000,
      maxInvoicesPerMonth: 2000,
      branding: {
        primaryColor: "#1a73e8",
        secondaryColor: "#34a853",
        logoUrl: null,
      },
      settings: {
        currency: "SAR",
        language: "ar",
        timezone: "Asia/Riyadh",
        dateFormat: "DD/MM/YYYY",
        lowStockAlert: true,
      },
    },
  });
  console.log(`  ✅ Demo Tenant created: ${demoTenant.name} (${demoTenant.subdomain})`);

  // ---------------------------------------------------------------
  // 4. Create Demo Subscription
  // ---------------------------------------------------------------
  console.log("💳 Creating Demo Subscription...");
  const subscriptionEndDate = new Date();
  subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
  const demoSubscription = await prisma.subscription.create({
    data: {
      tenantId: demoTenant.id,
      planId: monthlyPlan.id,
      startDate: new Date(),
      endDate: subscriptionEndDate,
      status: "ACTIVE",
      amount: 29.99,
      autoRenew: true,
    },
  });
  console.log(`  ✅ Demo Subscription created: ${demoSubscription.status}`);

  // ---------------------------------------------------------------
  // 5. Create Demo Trader User
  // ---------------------------------------------------------------
  console.log("👤 Creating Demo Trader User...");
  const demoUser = await prisma.user.create({
    data: {
      tenantId: demoTenant.id,
      email: "trader@demo.com",
      passwordHash: demoBranchPasswordHash,
      name: "Demo Trader",
      role: "TRADER",
      isActive: true,
    },
  });
  console.log(`  ✅ Demo Trader created: ${demoUser.email}`);

  // ---------------------------------------------------------------
  // 6. Create Demo Branches
  // ---------------------------------------------------------------
  console.log("🏪 Creating Demo Branches...");
  const mainBranch = await prisma.branch.create({
    data: {
      tenantId: demoTenant.id,
      nameAr: "الفرع الرئيسي",
      nameEn: "Main Branch",
      code: "BR001",
      address: "King Fahd Road, Riyadh",
      phone: "+966500000001",
      isActive: true,
      isMain: true,
      location: {
        lat: 24.7136,
        lng: 46.6753,
        address: "King Fahd Road, Riyadh",
      },
    },
  });
  console.log(`  ✅ Main Branch created: ${mainBranch.nameEn}`);

  const secondBranch = await prisma.branch.create({
    data: {
      tenantId: demoTenant.id,
      nameAr: "فرع العليا",
      nameEn: "Olaya Branch",
      code: "BR002",
      address: "Olaya Street, Riyadh",
      phone: "+966500000002",
      isActive: true,
      isMain: false,
      location: {
        lat: 24.7111,
        lng: 46.6644,
        address: "Olaya Street, Riyadh",
      },
    },
  });
  console.log(`  ✅ Second Branch created: ${secondBranch.nameEn}`);

  // Update demo user with branch assignment
  await prisma.user.update({
    where: { id: demoUser.id },
    data: { branchId: mainBranch.id },
  });

  // ---------------------------------------------------------------
  // 7. Create Warehouses
  // ---------------------------------------------------------------
  console.log("🏭 Creating Warehouses...");
  const mainWarehouse = await prisma.warehouse.create({
    data: {
      tenantId: demoTenant.id,
      branchId: mainBranch.id,
      nameAr: "المستودع الرئيسي",
      nameEn: "Main Warehouse",
      code: "WH-MAIN",
      isActive: true,
      isDefault: true,
    },
  });
  console.log(`  ✅ Main Warehouse created: ${mainWarehouse.nameEn}`);

  const secondWarehouse = await prisma.warehouse.create({
    data: {
      tenantId: demoTenant.id,
      branchId: secondBranch.id,
      nameAr: "مستودع العليا",
      nameEn: "Olaya Warehouse",
      code: "WH-OLAYA",
      isActive: true,
      isDefault: true,
    },
  });
  console.log(`  ✅ Second Warehouse created: ${secondWarehouse.nameEn}`);

  // ---------------------------------------------------------------
  // 8. Create Demo Categories
  // ---------------------------------------------------------------
  console.log("📁 Creating Demo Categories...");
  const categoriesData = [
    { nameAr: "مشروبات", nameEn: "Beverages", slug: "beverages", sortOrder: 1 },
    { nameAr: "مخبوزات", nameEn: "Bakery", slug: "bakery", sortOrder: 2 },
    { nameAr: "وجبات خفيفة", nameEn: "Snacks", slug: "snacks", sortOrder: 3 },
    { nameAr: "منتجات البان", nameEn: "Dairy", slug: "dairy", sortOrder: 4 },
    { nameAr: "منظفات", nameEn: "Cleaning", slug: "cleaning", sortOrder: 5 },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const category = await prisma.category.create({
      data: {
        tenantId: demoTenant.id,
        nameAr: cat.nameAr,
        nameEn: cat.nameEn,
        slug: cat.slug,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
    });
    categories[cat.slug] = category.id;
    console.log(`  ✅ Category created: ${category.nameEn}`);
  }

  // Create subcategories under beverages
  const hotDrinks = await prisma.category.create({
    data: {
      tenantId: demoTenant.id,
      parentId: categories["beverages"],
      nameAr: "مشروبات ساخنة",
      nameEn: "Hot Drinks",
      slug: "hot-drinks",
      sortOrder: 1,
      isActive: true,
    },
  });
  console.log(`  ✅ Subcategory created: ${hotDrinks.nameEn}`);

  const coldDrinks = await prisma.category.create({
    data: {
      tenantId: demoTenant.id,
      parentId: categories["beverages"],
      nameAr: "مشروبات باردة",
      nameEn: "Cold Drinks",
      slug: "cold-drinks",
      sortOrder: 2,
      isActive: true,
    },
  });
  console.log(`  ✅ Subcategory created: ${coldDrinks.nameEn}`);

  // ---------------------------------------------------------------
  // 9. Create Demo Products
  // ---------------------------------------------------------------
  console.log("📦 Creating Demo Products...");
  const productsData = [
    {
      nameAr: "قهوة عربية", nameEn: "Arabic Coffee", sku: "BEV-001", barcode: "6281000000001",
      categorySlug: "beverages", costPrice: 5.00, sellingPrice: 12.00, unit: "PIECE",
      descriptionAr: "قهوة عربية محمصة طازجة", descriptionEn: "Freshly roasted Arabic coffee",
    },
    {
      nameAr: "شاي أحمر", nameEn: "Black Tea", sku: "BEV-002", barcode: "6281000000002",
      categorySlug: "beverages", costPrice: 2.00, sellingPrice: 6.00, unit: "PIECE",
      descriptionAr: "شاي أحمر فاخر", descriptionEn: "Premium black tea",
    },
    {
      nameAr: "عصير برتقال طبيعي", nameEn: "Fresh Orange Juice", sku: "BEV-003", barcode: "6281000000003",
      categorySlug: "beverages", costPrice: 4.00, sellingPrice: 10.00, unit: "PIECE",
      descriptionAr: "عصير برتقال طازج 100%", descriptionEn: "100% fresh orange juice",
    },
    {
      nameAr: "مياه معدنية صغيرة", nameEn: "Small Water Bottle", sku: "BEV-004", barcode: "6281000000004",
      categorySlug: "beverages", costPrice: 0.50, sellingPrice: 1.00, unit: "PIECE",
      descriptionAr: "مياه معدنية 330 مل", descriptionEn: "Mineral water 330ml",
    },
    {
      nameAr: "مياه معدنية كبيرة", nameEn: "Large Water Bottle", sku: "BEV-005", barcode: "6281000000005",
      categorySlug: "beverages", costPrice: 1.00, sellingPrice: 2.00, unit: "PIECE",
      descriptionAr: "مياه معدنية 1.5 لتر", descriptionEn: "Mineral water 1.5L",
    },
    {
      nameAr: "كرواسون زبدة", nameEn: "Butter Croissant", sku: "BAK-001", barcode: "6281000000006",
      categorySlug: "bakery", costPrice: 2.00, sellingPrice: 5.00, unit: "PIECE",
      descriptionAr: "كرواسون طازج بالزبدة", descriptionEn: "Fresh butter croissant",
    },
    {
      nameAr: "خبز عربي", nameEn: "Arabic Bread", sku: "BAK-002", barcode: "6281000000007",
      categorySlug: "bakery", costPrice: 0.50, sellingPrice: 1.50, unit: "PIECE",
      descriptionAr: "خبز عربي طازج", descriptionEn: "Fresh Arabic bread",
    },
    {
      nameAr: "دونات شوكولاتة", nameEn: "Chocolate Donut", sku: "BAK-003", barcode: "6281000000008",
      categorySlug: "bakery", costPrice: 1.50, sellingPrice: 4.00, unit: "PIECE",
      descriptionAr: "دونات محشية بالشوكولاتة", descriptionEn: "Chocolate-filled donut",
    },
    {
      nameAr: "كيكة الفانيليا", nameEn: "Vanilla Cake", sku: "BAK-004", barcode: "6281000000009",
      categorySlug: "bakery", costPrice: 8.00, sellingPrice: 20.00, unit: "PIECE",
      descriptionAr: "كيكة فانيلا طازجة", descriptionEn: "Fresh vanilla cake",
    },
    {
      nameAr: "شيبس بطاطس", nameEn: "Potato Chips", sku: "SNK-001", barcode: "6281000000010",
      categorySlug: "snacks", costPrice: 1.50, sellingPrice: 3.50, unit: "PIECE",
      descriptionAr: "شيبس بطاطس مملح", descriptionEn: "Salted potato chips",
    },
    {
      nameAr: "مكسرات مشكلة", nameEn: "Mixed Nuts", sku: "SNK-002", barcode: "6281000000011",
      categorySlug: "snacks", costPrice: 10.00, sellingPrice: 25.00, unit: "KG",
      descriptionAr: "مكسرات مشكلة طازجة", descriptionEn: "Fresh mixed nuts",
    },
    {
      nameAr: "شوكولاتة", nameEn: "Chocolate Bar", sku: "SNK-003", barcode: "6281000000012",
      categorySlug: "snacks", costPrice: 3.00, sellingPrice: 7.00, unit: "PIECE",
      descriptionAr: "شوكولاتة بالحليب", descriptionEn: "Milk chocolate bar",
    },
    {
      nameAr: "بسكويت", nameEn: "Biscuits", sku: "SNK-004", barcode: "6281000000013",
      categorySlug: "snacks", costPrice: 2.00, sellingPrice: 5.00, unit: "PIECE",
      descriptionAr: "بسكويت سادة", descriptionEn: "Plain biscuits",
    },
    {
      nameAr: "حليب طازج", nameEn: "Fresh Milk", sku: "DRY-001", barcode: "6281000000014",
      categorySlug: "dairy", costPrice: 3.00, sellingPrice: 6.00, unit: "PIECE",
      descriptionAr: "حليب طازج كامل الدسم 1 لتر", descriptionEn: "Fresh full cream milk 1L",
    },
    {
      nameAr: "زبادي", nameEn: "Yogurt", sku: "DRY-002", barcode: "6281000000015",
      categorySlug: "dairy", costPrice: 1.00, sellingPrice: 2.50, unit: "PIECE",
      descriptionAr: "زبادي طبيعي", descriptionEn: "Natural yogurt",
    },
    {
      nameAr: "جبنة بيضاء", nameEn: "White Cheese", sku: "DRY-003", barcode: "6281000000016",
      categorySlug: "dairy", costPrice: 8.00, sellingPrice: 16.00, unit: "KG",
      descriptionAr: "جبنة بيضاء طازجة", descriptionEn: "Fresh white cheese",
    },
    {
      nameAr: "منظف أرضيات", nameEn: "Floor Cleaner", sku: "CLN-001", barcode: "6281000000017",
      categorySlug: "cleaning", costPrice: 4.00, sellingPrice: 10.00, unit: "PIECE",
      descriptionAr: "منظف أرضيات مركز 2 لتر", descriptionEn: "Concentrated floor cleaner 2L",
    },
    {
      nameAr: "صابون سائل", nameEn: "Liquid Soap", sku: "CLN-002", barcode: "6281000000018",
      categorySlug: "cleaning", costPrice: 3.00, sellingPrice: 8.00, unit: "PIECE",
      descriptionAr: "صابون سائل لليدين 500 مل", descriptionEn: "Liquid hand soap 500ml",
    },
    {
      nameAr: "مناديل ورقية", nameEn: "Tissue Paper", sku: "CLN-003", barcode: "6281000000019",
      categorySlug: "cleaning", costPrice: 1.50, sellingPrice: 3.00, unit: "BOX",
      descriptionAr: "مناديل ورقية عبوة 10", descriptionEn: "Tissue paper box of 10",
    },
    {
      nameAr: "معطر جو", nameEn: "Air Freshener", sku: "CLN-004", barcode: "6281000000020",
      categorySlug: "cleaning", costPrice: 5.00, sellingPrice: 12.00, unit: "PIECE",
      descriptionAr: "معطر جو بخاخ 300 مل", descriptionEn: "Air freshener spray 300ml",
    },
  ];

  const products: Array<{ id: string; sku: string }> = [];
  for (const prod of productsData) {
    const product = await prisma.product.create({
      data: {
        tenantId: demoTenant.id,
        categoryId: categories[prod.categorySlug],
        nameAr: prod.nameAr,
        nameEn: prod.nameEn,
        descriptionAr: prod.descriptionAr,
        descriptionEn: prod.descriptionEn,
        sku: prod.sku,
        barcode: prod.barcode,
        costPrice: prod.costPrice,
        sellingPrice: prod.sellingPrice,
        unit: prod.unit,
        hasExpiry: prod.categorySlug === "dairy" || prod.categorySlug === "bakery",
        expiryDays: prod.categorySlug === "dairy" ? 7 : prod.categorySlug === "bakery" ? 3 : null,
        isActive: true,
        lowStockAlert: 5,
      },
    });
    products.push({ id: product.id, sku: product.sku });
    console.log(`  ✅ Product created: ${product.nameEn} (${product.sku})`);
  }

  // ---------------------------------------------------------------
  // 10. Create Product Variants
  // ---------------------------------------------------------------
  console.log("🔀 Creating Product Variants...");

  // Coffee variant: small / medium / large
  const coffeeProduct = products.find((p) => p.sku === "BEV-001");
  if (coffeeProduct) {
    const smallCoffee = await prisma.productVariant.create({
      data: {
        productId: coffeeProduct.id,
        name: "Small",
        sku: "BEV-001-S",
        barcode: "6281000000101",
        costPrice: 3.00,
        sellingPrice: 8.00,
        isActive: true,
      },
    });
    await prisma.productVariantOption.create({
      data: { variantId: smallCoffee.id, name: "Size", value: "Small" },
    });
    console.log(`  ✅ Variant created: Coffee Small`);

    const mediumCoffee = await prisma.productVariant.create({
      data: {
        productId: coffeeProduct.id,
        name: "Medium",
        sku: "BEV-001-M",
        barcode: "6281000000102",
        costPrice: 5.00,
        sellingPrice: 12.00,
        isActive: true,
      },
    });
    await prisma.productVariantOption.create({
      data: { variantId: mediumCoffee.id, name: "Size", value: "Medium" },
    });
    console.log(`  ✅ Variant created: Coffee Medium`);

    const largeCoffee = await prisma.productVariant.create({
      data: {
        productId: coffeeProduct.id,
        name: "Large",
        sku: "BEV-001-L",
        barcode: "6281000000103",
        costPrice: 7.00,
        sellingPrice: 16.00,
        isActive: true,
      },
    });
    await prisma.productVariantOption.create({
      data: { variantId: largeCoffee.id, name: "Size", value: "Large" },
    });
    console.log(`  ✅ Variant created: Coffee Large`);
  }

  // Juice variant: small / large
  const juiceProduct = products.find((p) => p.sku === "BEV-003");
  if (juiceProduct) {
    const smallJuice = await prisma.productVariant.create({
      data: {
        productId: juiceProduct.id,
        name: "Small (250ml)",
        sku: "BEV-003-S",
        barcode: "6281000000201",
        costPrice: 3.00,
        sellingPrice: 7.00,
        isActive: true,
      },
    });
    await prisma.productVariantOption.create({
      data: { variantId: smallJuice.id, name: "Size", value: "250ml" },
    });
    console.log(`  ✅ Variant created: Juice Small`);

    const largeJuice = await prisma.productVariant.create({
      data: {
        productId: juiceProduct.id,
        name: "Large (500ml)",
        sku: "BEV-003-L",
        barcode: "6281000000202",
        costPrice: 5.00,
        sellingPrice: 12.00,
        isActive: true,
      },
    });
    await prisma.productVariantOption.create({
      data: { variantId: largeJuice.id, name: "Size", value: "500ml" },
    });
    console.log(`  ✅ Variant created: Juice Large`);
  }

  // ---------------------------------------------------------------
  // 11. Create Demo Customers
  // ---------------------------------------------------------------
  console.log("👥 Creating Demo Customers...");
  const customersData = [
    { name: "Ahmed Mohammed", phone: "0500000001", email: "ahmed@example.com", tier: "REGULAR" },
    { name: "Fatima Ali", phone: "0500000002", email: "fatima@example.com", tier: "SILVER" },
    { name: "Omar Hassan", phone: "0500000003", email: "omar@example.com", tier: "GOLD" },
    { name: "Noura Ibrahim", phone: "0500000004", email: "noura@example.com", tier: "REGULAR" },
    { name: "Khalid Abdullah", phone: "0500000005", email: "khalid@example.com", tier: "SILVER" },
    { name: "Sara Tariq", phone: "0500000006", email: "sara@example.com", tier: "REGULAR" },
    { name: "Yousef Saleh", phone: "0500000007", email: "yousef@example.com", tier: "PLATINUM" },
    { name: "Layla Adel", phone: "0500000008", email: "layla@example.com", tier: "REGULAR" },
    { name: "Hamza Noor", phone: "0500000009", email: "hamza@example.com", tier: "SILVER" },
    { name: "Mona Rashid", phone: "0500000010", email: "mona@example.com", tier: "REGULAR" },
  ];

  const customers: Array<{ id: string; name: string }> = [];
  for (const cust of customersData) {
    const customer = await prisma.customer.create({
      data: {
        tenantId: demoTenant.id,
        name: cust.name,
        phone: cust.phone,
        email: cust.email,
        tier: cust.tier,
        balance: 0,
        creditLimit: cust.tier === "PLATINUM" ? 5000 : cust.tier === "GOLD" ? 2000 : cust.tier === "SILVER" ? 1000 : 0,
        loyaltyPoints: 0,
        totalSpent: 0,
        totalOrders: 0,
        isActive: true,
      },
    });
    customers.push({ id: customer.id, name: customer.name });
    console.log(`  ✅ Customer created: ${customer.name} (${customer.tier})`);
  }

  // ---------------------------------------------------------------
  // 12. Create Demo Suppliers
  // ---------------------------------------------------------------
  console.log("🚚 Creating Demo Suppliers...");
  const supplier1 = await prisma.supplier.create({
    data: {
      tenantId: demoTenant.id,
      name: "Almarai Company",
      phone: "0500000100",
      email: "sales@almarai.com",
      contactPerson: "Mohammed Al-Otaibi",
      address: "Riyadh Industrial Area",
      balance: 0,
      paymentTerms: "NET 30",
      notes: "Main dairy and beverage supplier",
      isActive: true,
    },
  });
  console.log(`  ✅ Supplier created: ${supplier1.name}`);

  const supplier2 = await prisma.supplier.create({
    data: {
      tenantId: demoTenant.id,
      name: "PepsiCo Saudi Arabia",
      phone: "0500000101",
      email: "orders@pepsico.sa",
      contactPerson: "Abdullah Al-Shahrani",
      address: "Jeddah Industrial City",
      balance: 0,
      paymentTerms: "NET 15",
      notes: "Snacks and beverages supplier",
      isActive: true,
    },
  });
  console.log(`  ✅ Supplier created: ${supplier2.name}`);

  // ---------------------------------------------------------------
  // 13. Create Demo Stock Levels
  // ---------------------------------------------------------------
  console.log("📊 Creating Demo Stock Levels...");
  for (const product of products) {
    await prisma.stockLevel.create({
      data: {
        tenantId: demoTenant.id,
        warehouseId: mainWarehouse.id,
        productId: product.id,
        quantity: Math.floor(Math.random() * 100) + 20,
        minQuantity: 10,
        maxQuantity: 200,
        lastCountedAt: new Date(),
      },
    });
    await prisma.stockLevel.create({
      data: {
        tenantId: demoTenant.id,
        warehouseId: secondWarehouse.id,
        productId: product.id,
        quantity: Math.floor(Math.random() * 50) + 5,
        minQuantity: 5,
        maxQuantity: 100,
        lastCountedAt: new Date(),
      },
    });
  }
  console.log(`  ✅ Stock levels created for ${products.length} products across 2 warehouses`);

  console.log("");
  console.log("🎉 Seed completed successfully!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📧 Super Admin: admin@smartpos.com / Admin@123456");
  console.log("📧 Demo Trader: trader@demo.com / Trader@123456");
  console.log("🏢 Demo Tenant: demo");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });

export { main as seed };