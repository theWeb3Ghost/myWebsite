function addToCart(button) {
    const product = button.closest(".product");
    const id = product.dataset.id;
    const name = product.dataset.name;
    const price = parseFloat(product.dataset.price);
    const quantity = parseInt(product.querySelector("input").value);

    //object for storage.
    const cartContent = {
        id: id,
        name: name,
        price: price,
        quantity: quantity
    };


    //get cart if is there is a cart.

    const activeCart = localStorage.getItem("activeCart") || "cart1";
    let cart = JSON.parse(localStorage.getItem(activeCart)) || [];

    //check if the product is in the cart
    const existingProduct = cart.findIndex(item => item.id === cartContent.id)
    if (existingProduct >= 0) {
        cart[existingProduct].quantity += quantity;
    } else {
        cart.push(cartContent)
    }

    localStorage.setItem(activeCart, JSON.stringify(cart));
    alert(`"${cartContent.name}" added to cart`)
}