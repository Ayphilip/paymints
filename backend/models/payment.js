import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    paymentNo: { type: String, required: true, unique: true },
    paymentInvoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    paymentType: { type: String, required: true },
    paymentSender: { type: String, required: true },
    paymentRecipient: { type: String, required: true },
    paymentStatus: { type: String, default: 'pending' },
    paymentComment: { type: String },
    paymentAmount: { type: Number, required: true },
    paymentMintAddress: { type: String },
    paymentChain: { type: String }, 
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
