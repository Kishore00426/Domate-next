import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  label: { type: String, default: "Home" }, // Home, Work, etc.
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, default: "INDIA" },
  isDefault: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// ✅ Safe export pattern
export default mongoose.models.Address ||
  mongoose.model("Address", addressSchema);