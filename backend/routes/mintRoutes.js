const express = require("express");

const { mintNFT } = require("../contract");
const User = require("../models/userModel");


const router = express.Router();
router.post("/", async (req, res) => {
    try {
        const { userId, email, address, privatekey } = req.body;

        // Create user
        let user = new User({ userId, email, address, privatekey });
        await user.save();

        // Mint NFT right after signup
        const receipt = await mintNFT(user.address);

        // Update DB with mint info
        user.nftSent = true;
        user.nftTxHash = receipt.transactionHash;
        user.nftMintedAt = new Date();
        await user.save();

        res.json({
            success: true,
            message: "User created and NFT minted",
            txHash: receipt.transactionHash
        });
    } catch (err) {
        console.error("Signup+Mint error:", err);
        res.status(500).json({ error: "Signup or mint failed" });
    }
});

module.exports = router;
