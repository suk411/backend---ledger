import mongoose from "mongoose";
import bcrypt from "bcryptjs"; // Add this (npm i bcryptjs)

const userSchema = new mongoose.Schema(
  {
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
      match: [/^\d{10}$/, "Please fill a valid 10-digit mobile number"],
      unique: [true, "Mobile number must be unique"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false, // Exclude from queries
    },
  },
  {
    timestamps: true, // Move to options object (comma after fields)
  },
);

// Hash password pre-save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const userModel = mongoose.model("User", userSchema);
export default userModel;
