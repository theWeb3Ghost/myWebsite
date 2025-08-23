const mongoose = require("mongoose");

const nftSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  walletAddress: String,
  nftSent: { type: Boolean, default: false }
});

module.exports = mongoose.model("User", nftSchema);