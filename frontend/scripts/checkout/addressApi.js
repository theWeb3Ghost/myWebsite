

// localStorage
export function saveAddresses(address1, address2, contact) {

    const addresses = { address1, address2, contact };
    localStorage.setItem("savedAddresses", JSON.stringify(addresses));
    return addresses;
}

// Get from localStorage
export function getSavedAddresses() {
    const saved = localStorage.getItem("savedAddresses");
    return saved ? JSON.parse(saved) : null;
}

// Save into backend DB
export async function saveAddressesToDB(token) {
    const data = getSavedAddresses();
    if (!data) throw new Error("No saved addresses found.");
    ;

    const response = await fetch("https://mybeautybags.onrender.com/api/addresses", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error("Failed to save addresses to database.");
    }

    return await response.json();
}
