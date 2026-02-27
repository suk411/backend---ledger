import mongoose from "mongoose";
import { number, trim } from "zod";
import { required } from "zod/v4-mini";

const userSchema = new mongoose.Schema({
  mobile: {
    type: number,
    required: [true, " Mobile number is required "],
    trim: true,
    match: [],
  },
});
