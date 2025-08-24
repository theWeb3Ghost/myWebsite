export async function fetchWallet(token) {
    const res = await fetch("https://mybeautybags.onrender.com/api/wallet", {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch wallet");
    return res.json();
}
export default fetchWallet;