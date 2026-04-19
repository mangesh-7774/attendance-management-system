import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    unique: true,
  },
  day: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
});

export const Holiday = mongoose.model("Holiday", holidaySchema);
