const { ethers } = require("ethers");
const contractABI = require("./ContractABI.json");
const dotenv = require("dotenv");

dotenv.config();

//env
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    contractABI,
    wallet
);

export async function mintNFT(toAddress) {
    try {
        const tokenUri = process.env.TOKEN_URI;
        const tx = await contract.mintNft(toAddress, tokenUri);
        console.log("Minting tx:", tx.hash);

        const receipt = await tx.wait();
        console.log("Mint confirmed:", receipt.transactionHash);
        return receipt;
    } catch (err) {
        console.error("Mint failed:", err);
        throw err;
    }
}
