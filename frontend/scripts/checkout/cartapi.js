// === Save Cart to DB ===
export async function saveCart(cart, token) {
  try {
    const res = await fetch("https://mybeautybags.onrender.com/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(cart) // <-- don't wrap it again
    });

    console.log("Response status:", res.status);

    if (!res.ok) throw new Error("Failed to save cart");

    const data = await res.json();
    console.log("Cart saved successfully!", data);
    return data;
  } catch (err) {
    console.error("Error saving cart:", err);
    return null;
  }
}

// === Get Cart from DB ===
export async function getCartFromDB(token) {
  const res = await fetch("https://mybeautybags.onrender.com/api/cart", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  console.log("Token being sent:", token);

  if (!res.ok) throw new Error("Failed to fetch cart");

  const data = await res.json();
  console.log("Cart fetched from DB:", data);

  return data.cart || [];
}
// Either use named imports:
export default {
  saveCart,
  getCartFromDB
};

