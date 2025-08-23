const express = require("express");
const Address = require("../models/addressModel");
const { auth } = require("express-oauth2-jwt-bearer");

const router = express.Router();
const checkJwt = auth({
    audience: "http://localhost/api",   // must match your Auth0 API Identifier
    issuerBaseURL: "https://dev-b62l6w6s4k7oirma.us.auth0.com/",
});

// === Save addresses ===
router.post("/", checkJwt, async (req, res) => {
    try {
        const userId = req.auth.payload.sub; // unique user id
        const { address1, address2, contact } = req.body;

        if (!address1 || !contact) {
            return res.status(400).json({ error: "Address 1 and Contact are required" });
        }

        // Save or update (if user already has one)
        let address = await Address.findOneAndUpdate(
            { userId },
            { address1, address2, contact },
            { new: true, upsert: true }
        );
        console.log("💾 Saved address in DB:", address);
        res.json({ message: "✅ Address saved successfully", address });
    } catch (err) {
        console.error("Save error:", err);
        res.status(500).json({ error: "Failed to save address" });
    }
});

// === Get addresses (for prefilling checkout) ===
router.get("/", checkJwt, async (req, res) => {
    try {
        const userId = req.user.sub;
        const address = await Address.findOne({ userId });

        if (!address) {
            return res.status(404).json({ error: "No address found" });
        }

        res.json(address);
    } catch (err) {
        console.error("Fetch error:", err);
        res.status(500).json({ error: "Failed to fetch address" });
    }
});

module.exports = router;
