const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // comes from Auth0 token (req.user.sub)
    address1: { type: String, required: true },
    address2: { type: String },
    contact: { type: String, required: true },
}, { timestamps: true });

const Address = mongoose.model("Address", addressSchema);

module.exports = Address;
