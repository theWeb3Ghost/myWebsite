export async function fetchWallet(token) {
    const res = await fetch("http://localhost:4000/api/wallet", {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch wallet");
    return res.json();
}
export default fetchWallet;