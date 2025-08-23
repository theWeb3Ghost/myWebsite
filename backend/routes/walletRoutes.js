const express = require("express");
const router = express.Router();
const { getOrCreateWallet } = require("../walletCreate");
const { auth } = require("express-oauth2-jwt-bearer");
const checkJwt = auth({
    audience: "http://localhost/api",
    issuerBaseURL: "https://dev-b62l6w6s4k7oirma.us.auth0.com/",
});


router.get("/", checkJwt, async (req, res) => {
    try {
        console.log("Decoded JWT payload:", req.auth.payload);
        const { sub, email } = req.auth.payload; // from JWT
        const wallet = await getOrCreateWallet(sub, email);
        res.json({ wallet });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get wallet" });
    }
});

module.exports = router;
