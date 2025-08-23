const express = require("express");

const { mintNFT } = require("../contract");
const User = require("../models/userModel");


const router = express.Router();
router.post("/", async (req, res) => {
    try {
        console.log("📥 Incoming signup/mint body:", req.body);
        const { userId, email, address, privatekey } = req.body;

        // Atomically create or update the user
        let user = await User.findOneAndUpdate(
            { userId },
            { $setOnInsert: { userId, email, address, privatekey } }, // only set these if new
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        if (!user.nftSent) {
            const receipt = await mintNFT(user.address);

            // Update DB atomically
            user = await User.findOneAndUpdate(
                { userId },
                {
                    nftSent: true,
                    nftTxHash: receipt.transactionHash,
                    nftMintedAt: new Date()
                },
                { new: true } // return the updated document
            );
            return res.json({
                success: true,
                message: "User created and NFT minted",
                txHash: receipt.transactionHash
            });
        }

        // If already minted → just return info
        res.json({
            success: true,
            message: "User already has NFT",
            txHash: user.nftTxHash
        });
    } catch (err) {
        console.error("Signup+Mint error:", err);
        res.status(500).json({ error: "Signup or mint failed" });
    }
});

module.exports = router;
