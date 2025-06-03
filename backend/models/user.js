import mongoose from 'mongoose';

const beneficiariesSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, default: "", trim: true, match: [/.+\@.+\..+/, "Invalid email"] },
  walletAddress: { type: String, default: "", trim: true }
});

const userSchema = new mongoose.Schema({
    name: { type: String },
    username: { type: String, dropDups: true, unique: true },
    email: { type: String },
    image: { type: String },
    address: { type: String, required: true, dropDups: true, unique: true },
    status: { type: String, default: '0' },
    isAdmin: { type: Boolean, default: false },
    twitterId: { type: String },
    website: { type: String },
    beneficiaries: [beneficiariesSchema],
}, {
    timestamps: true
});

const userModel = mongoose.model("User", userSchema);

export default userModel;