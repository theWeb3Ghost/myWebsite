const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: { type: String },
    userId: { type: String, required: true, unique: true }, // Firebase UID
    address: { type: String, required: true },
    privatekey: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },

    //nft

    nftSent: { type: Boolean, default: false },
    nftTxHash: { type: String },
    nftMintedAt: { type: Date },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
