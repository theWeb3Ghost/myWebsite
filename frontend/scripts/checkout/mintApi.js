export async function mintNFT(wallet) {
    try {
        const res = await fetch("http://localhost:4000/api/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: wallet.userId,
                email: wallet.email,
                address: wallet.wallet.address,
                privatekey: wallet.wallet.privatekey
            })
        });

        const data = await res.json();

        if (data.success) {
            console.log("✅ NFT minted for user:", data.txHash);
        } else {
            console.log("⚠️ NFT mint skipped:", data.message || data.error);
        }
    } catch (err) {
        console.error("❌ Mint request failed:", err);
    }
}