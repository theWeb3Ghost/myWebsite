const express = require("express");
const Cart = require("../models/cartModel.js");
const { auth } = require("express-oauth2-jwt-bearer");

const router = express.Router();

// ✅ Auth0 middleware
const checkJwt = auth({
    audience: "http://localhost/api",   // must match your Auth0 API Identifier
    issuerBaseURL: "https://dev-b62l6w6s4k7oirma.us.auth0.com/",
});

// === Save or update cart ===
router.post("/", checkJwt, async (req, res) => {
    try {
        const userId = req.auth.payload.sub; // unique user id from Auth0 token
        const { cart } = req.body;

        const saved = await Cart.findOneAndUpdate(
            { userId },
            { cart },
            { upsert: true, new: true }
        );
        console.log("Cart saved in DB:", saved);
        res.json(saved);
    } catch (err) {
        console.error("Cart save error:", err);
        res.status(500).json({ error: "Failed to save cart" });
    }
});

// === Get user cart ===
router.get("/", checkJwt, async (req, res) => {
    try {
        const userId = req.auth.payload.sub;
        const cart = await Cart.findOne({ userId });

        if (!cart) return res.status(404).json({ msg: "No cart found" });

        res.json(cart);
    } catch (err) {
        console.error("Cart fetch error:", err);
        res.status(500).json({ error: "Failed to fetch cart" });
    }
});

module.exports = router;
