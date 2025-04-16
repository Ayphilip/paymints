import express from "express";
import Order from "../models/order.js";
import { getToken, isAuth, isAdmin } from "../util.js";

const router = express.Router();

const checkOwnershipOrAdmin = (req, res, order) => {
  if (!req.user.isAdmin && order.createdBy.toString() !== req.user._id) {
    return res.status(403).json({ message: "Unauthorized" });
  }
  return null;
};

// Helper to compute invoice totals
const computeInvoiceTotals = (order) => {
  if (order.orderType !== "invoice") return;
  order.subtotal = order.items.reduce((sum, item) => {
    item.total = item.quantity * item.unitPrice; // Compute item total
    return sum + item.total;
  }, 0);
  order.discount = order.discountCodes.reduce((sum, dc) => sum + (dc.discountPercent / 100) * order.subtotal, 0);
  order.taxAmount = order.subtotal * (order.taxRate / 100);
  order.totalAmount = order.subtotal - order.discount + order.taxAmount;
};

// Helper to compute payroll recipient netPay
const computeRecipientNetPay = (recipient) => {
  recipient.netPay = recipient.grossPay;
  if (recipient.deductions) {
    recipient.netPay -= recipient.deductions.reduce((sum, ded) => sum + parseFloat(ded || 0), 0);
  }
  if (recipient.bonuses) {
    recipient.netPay += recipient.bonuses.reduce((sum, bonus) => sum + parseFloat(bonus || 0), 0);
  }
};

function generate7DigitId() {
  return Math.floor(1000000 + Math.random() * 9000000).toString();
}
// POST /orders - Create a new order
router.post("/orders", isAuth, async (req, res) => {
  try {
    // const invoiceId = generate7DigitId();
    const orderData = {
      ...req.body,
      createdBy: req.user._id,
      orderType: req.body.orderType || "invoice", // Default to invoice
    };

    // Validate required fields based on orderType
    if (orderData.orderType === "invoice"  && !orderData.items?.length) {
      return res.status(400).json({ message: "Invoice orders require at least one item" });
    }
    if (orderData.orderType === "payroll" && !orderData.recipients?.length) {
      return res.status(400).json({ message: "Payroll orders require at least one recipient" });
    }

    const order = new Order(orderData);

    // Compute totals for invoices
    if (order.orderType === "invoice") {
      computeInvoiceTotals(order);
    }
    // Compute netPay for payroll recipients
    if (order.isPayroll) {
      order.recipients.forEach(computeRecipientNetPay);
    }

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: "Failed to create order", error: error.message });
  }
});

// GET /orders - Fetch all orders with filters and pagination
router.get("/orders", isAuth, async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;
    const query = {};

    // Restrict non-admins to their own orders
    if (!req.user.isAdmin) {
      query.createdBy = req.user._id;
    }
    if (status) query.orderStatus = status;
    if (type) query.orderType = type;

    const orders = await Order.find(query)
      .populate("createdBy", "name email address")
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);
    res.json({ orders, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
});

// GET /orders/:orderNo - Fetch a single order
router.get("/orders/:orderNo", async (req, res) => {
  try {
    const order = await Order.findOne({ orderNo: req.params.orderNo }).populate("createdBy", "name email address");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Allow public invoices to be viewed without ownership check
    if (order.orderType === "invoice" && order.invoiceVisibility === "public") {
      return res.json(order);
    }

    // const authError = checkOwnershipOrAdmin(req, res, order);
    // if (authError) return authError;

    // Check if invoice is expired
    if (order.isExpirable && order.dueDate && new Date() > new Date(order.dueDate)) {
      return res.status(400).json({ message: "Invoice has expired" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch order", error: error.message });
  }
});

// PUT /orders/:orderNo - Update an order
router.put("/orders/:orderNo", isAuth, async (req, res) => {
  try {
    const order = await Order.findOne({ orderNo: req.params.orderNo });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const authError = checkOwnershipOrAdmin(req, res, order);
    if (authError) return authError;

    if (order.orderStatus === "paid") {
      return res.status(400).json({ message: "Cannot update a paid order" });
    }

    // Prevent changing critical fields
    const { createdBy, orderNo, ...updateData } = req.body;

    // Update and recompute totals
    Object.assign(order, updateData);
    if (order.orderType === "invoice") {
      computeInvoiceTotals(order);
    }
    if (order.isPayroll) {
      order.recipients.forEach(computeRecipientNetPay);
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: "Failed to update order", error: error.message });
  }
});

// DELETE /orders/:orderNo - Delete an order
router.delete("/orders/:orderNo", isAuth, async (req, res) => {
  try {
    const order = await Order.findOne({ orderNo: req.params.orderNo });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Allow owners to delete draft orders or admins to delete any
    if (!req.user.isAdmin && (order.createdBy.toString() !== req.user._id || order.orderStatus !== "draft")) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (order.orderStatus === "paid") {
      return res.status(400).json({ message: "Cannot delete a paid order" });
    }

    await order.deleteOne();
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete order", error: error.message });
  }
});

// POST /orders/:orderNo/items - Add an item to an invoice
router.post("/orders/:orderNo/items", isAuth, async (req, res) => {
  try {
    const order = await Order.findOne({ orderNo: req.params.orderNo });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const authError = checkOwnershipOrAdmin(req, res, order);
    if (authError) return authError;

    if (order.orderType !== "invoice") {
      return res.status(400).json({ message: "Items can only be added to invoices" });
    }
    if (order.orderStatus === "paid") {
      return res.status(400).json({ message: "Cannot add items to a paid order" });
    }

    const item = req.body;
    if (item.quantity > item.stockAvailable) {
      return res.status(400).json({ message: `Insufficient stock for item: ${item.title}` });
    }

    order.items.push(item);
    computeInvoiceTotals(order);
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: "Failed to add item", error: error.message });
  }
});

// POST /orders/:orderNo/recipients - Add a recipient to a payroll
router.post("/orders/:orderNo/recipients", isAuth, async (req, res) => {
  try {
    const order = await Order.findOne({ orderNo: req.params.orderNo });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const authError = checkOwnershipOrAdmin(req, res, order);
    if (authError) return authError;

    if (!order.isPayroll) {
      return res.status(400).json({ message: "Recipients can only be added to payroll orders" });
    }
    if (order.orderStatus === "paid") {
      return res.status(400).json({ message: "Cannot add recipients to a paid order" });
    }

    const recipient = req.body;
    computeRecipientNetPay(recipient);
    order.recipients.push(recipient);
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: "Failed to add recipient", error: error.message });
  }
});

// PATCH /orders/:orderNo/pay - Mark order as paid
router.patch("/orders/:orderNo/pay", isAuth, async (req, res) => {
  try {
    const order = await Order.findOne({ orderNo: req.params.orderNo });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const authError = checkOwnershipOrAdmin(req, res, order);
    if (authError) return authError;

    if (order.orderStatus === "paid") {
      return res.status(400).json({ message: "Order is already paid" });
    }

    // Validate transactionHash format (basic check)
    const { transactionHash } = req.body;
    if (transactionHash && !/^[0-9a-fA-F]{64}$/.test(transactionHash)) {
      return res.status(400).json({ message: "Invalid transaction hash" });
    }

    order.orderStatus = "paid";
    order.transactionHash = transactionHash || order.transactionHash;

    if (order.isPayroll) {
      order.recipients.forEach((recipient) => {
        recipient.paid = true;
        recipient.txHash = transactionHash || recipient.txHash;
      });
    }

    if (order.autoReduceStockOnPay && order.orderType === "invoice") {
      order.items.forEach((item) => {
        if (item.stockAvailable < item.quantity) {
          throw new Error(`Insufficient stock for item: ${item.title}`);
        }
        item.stockAvailable -= item.quantity;
      });
    }

    // Mock email receipt (in real app, integrate with email service)
    if (order.autoEmailReceipt && order.orderType === "invoice") {
      console.log(`Sending receipt to ${order.clientEmail} for order ${order.orderNo}`);
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: "Failed to mark order as paid", error: error.message });
  }
});

export default router;