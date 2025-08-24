const { ethers } = require("ethers");
const User = require("./models/userModel");

async function getOrCreateWallet(sub, email) {
    // Look up by userId (not sub!)
    let wallet = await User.findOne({ userId: sub });

    if (!wallet) {
        // generate a new Ethereum wallet
        const newWallet = ethers.Wallet.createRandom();

        wallet = new User({
            userId: sub,
            ...(email ? { email } : {}),
            address: newWallet.address,
            privatekey: newWallet.privateKey
        });

        await wallet.save();
    }

    return wallet;
}

module.exports = { getOrCreateWallet };