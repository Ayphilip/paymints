import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "", trim: true },
  quantity: { type: Number, min: 0, default: 1 },
  unitPrice: { type: Number, min: 0, default: 0 },
  skuCode: { type: String, default: "", trim: true },
  stockAvailable: { type: Number, min: 0, default: 10 },
  total: { type: Number, min: 0, default: 0 }, // Computed: quantity * unitPrice
  image: { type: String, default: "" }, // Could be a URL or base64 string
});

const discountCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, uppercase: true, trim: true },
  discountPercent: { type: Number, required: true, min: 0, max: 100 },
});

const recipientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, default: "", trim: true, match: [/.+\@.+\..+/, "Invalid email"] },
  walletAddress: { type: String, default: "", trim: true },
  payType: { type: String, enum: ["crypto", "fiat"], default: "crypto" },
  grossPay: { type: Number, min: 0, default: 0 },
  netPay: { type: Number, min: 0, default: 0 }, // Computed: grossPay - deductions + bonuses
  bonuses: [{ type: String, trim: true }],
  deductions: [{ type: String, trim: true }],
  paid: { type: Boolean, default: false },
  txHash: { type: String, default: "", trim: true },
});

const orderSchema = new mongoose.Schema({
  // General Meta
  orderNo: { type: String, required: true, unique: true, default: () => crypto.randomUUID() },
  orderType: { type: String, enum: ["invoice", "payroll"], required: true },
  orderTitle: { type: String, required: true, trim: true },
  orderImage: { type: String, default: "", trim: true },
  orderDescription: { type: String, default: "", trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  orderStatus: { type: String, enum: ["0", "1", "2"], default: "0" },

  // Invoice Specific
  invoiceType: { type: String },
  clientName: { type: String, default: "", trim: true },
  clientWallet: { type: String, default: "", trim: true },
  clientEmail: { type: String, default: "", trim: true, match: [/.+\@.+\..+/, "Invalid email"] },
  isClientInformation: { type: Boolean, default: false },
    clientAddress: { type: String, default: "", trim: true },
    isExpirable: { type: Boolean, default: false },
  dueDate: { type: Date, default: null },
  discountCodes: [discountCodeSchema],
  tipOptionEnabled: { type: Boolean, default: true },
  invoiceVisibility: { type: String, enum: ["private", "public"], default: "private" },
  autoEmailReceipt: { type: Boolean, default: true },
  QRcodeEnabled: { type: Boolean, default: true },
  items: [itemSchema],
  subtotal: { type: Number, min: 0, default: 0 }, // Computed: sum(items.total)
  discount: { type: Number, min: 0, default: 0 }, // Computed from discountCodes
  taxRate: { type: Number, min: 0, max: 100, default: 0 },
  taxAmount: { type: Number, min: 0, default: 0 }, // Computed: subtotal * (taxRate / 100)
  totalAmount: { type: Number, min: 0, default: 0 }, // Computed: subtotal - discount + taxAmount

  // Payroll Specific
  isPayroll: { type: Boolean, default: false },
  payrollType: { type: String },
  paymentType: { type: Number, default: 0 },
  payrollPeriod: { type: String, default: "", trim: true }, // e.g., "monthly", "bi-weekly"
  payCycleStart: { type: Date, default: null },
  payCycleEnd: { type: Date, default: null },
  recipients: [recipientSchema],

  // Blockchain Info
  stablecoinSymbol: { type: String, default: "USDC", trim: true },
  chain: { type: String},
  tokenAddress: { type: String, default: "", trim: true },
  decimals: { type: Number, default: 6, min: 0 },
  network: { type: String},
  transactionHash: { type: String, default: "", trim: true },
  gasEstimateUSD: { type: Number, min: 0, default: 0 },

  // UI & Templates
  previewTemplate: { type: String, default: "modern", trim: true },
  notes: { type: String, default: "", trim: true },
  termsAndConditions: { type: String, default: "", trim: true },

  // Automation
  autoReduceStockOnPay: { type: Boolean, default: true },
  recurringCycle: { type: String, default: "", trim: true }, // e.g., "weekly", "monthly"
});

// // Indexes for better query performance
// orderSchema.index({ orderNo: 1 });
// orderSchema.index({ createdBy: 1, createdAt: -1 });
// orderSchema.index({ orderStatus: 1 });

export default mongoose.model("Order", orderSchema);