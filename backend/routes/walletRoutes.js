const express = require("express");
const router = express.Router();
const { getOrCreateWallet } = require("../walletCreate");
const { auth } = require("express-oauth2-jwt-bearer");
const User = require("../models/userModel");


const checkJwt = auth({
    audience: "https://mybeautybags.onrender.com/api",
    issuerBaseURL: "https://dev-b62l6w6s4k7oirma.us.auth0.com/",
});



router.get("/", checkJwt, async (req, res) => {
    try {
        console.log("Decoded JWT payload:", req.auth.payload);
        const { sub } = req.auth.payload; // from JWT

        console.log("Fetching or creating wallet for:", sub)
        const wallet = await getOrCreateWallet(sub);
        console.log("Wallet fetched/created:", wallet);
        const user = await User.findOne({ userId: sub });
        console.log("User found:", user);
        const nftInfo = user
            ? {
                nftSent: user.nftSent,
                nftTxHash: user.nftTxHash,
            }
            : { nftSent: false };

        res.json({ wallet, nftInfo });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get wallet" });
    }
});

module.exports = router;
