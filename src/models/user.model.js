import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});
const Counter = mongoose.model("Counter", counterSchema);

const userSchema = new mongoose.Schema(
  {
    userId: { type: Number, unique: true },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
      match: [/^\d{10}$/, "Please fill a valid 10-digit mobile number"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      "userId", // ✅ Fixed: string ID, not object
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );
    this.userId = counter.seq + 32545512; // ✅ Starts from 32545513
  }

  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
