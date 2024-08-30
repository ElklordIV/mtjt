document.addEventListener('DOMContentLoaded', () => {
    const spinner = document.getElementById('loading-spinner');
    const productContainer = document.getElementById('product-list'); 
    const cartItems = document.getElementById('cartItems');
    const totalPriceElement = document.getElementById('totalPrice');

    // Update the cart display initially
    updateCartDisplay();

    // Show the spinner and fetch products
    (async () => {
        try {
            spinner.style.display = 'block';

            // Fetch products
            const response = await fetch('/api/products/category/Lenovo Monitors');
            const products = await response.json();

            spinner.style.display = 'none';

            // Display products
            products.forEach(product => {
                const productElement = document.createElement('div');
                productElement.className = 'product';

                productElement.innerHTML = `
                    <div class="group">
                        <a href="productDetails.html?id=${product._id}">
                            <img src="${product.imageUrl}" alt="${product.label}" class="product-img">
                            <h6 class="label">${product.label}</h6>
                            <h3 class="info">${product.info}</h3>
                            <h2 class="price">R${product.price}</h2>
                        </a>
                        <button class="cartB" data-id="${product._id}">ADD TO CART</button>
                    </div>
                `;
                productContainer.appendChild(productElement);
            });

            // Add event listeners for 'Add to Cart' buttons
            document.querySelectorAll('.cartB').forEach(button => {
                button.addEventListener('click', () => addToCart(button));
            });

        } catch (error) {
            console.error('Error loading products:', error);
            spinner.style.display = 'none'; 
        }
    })();

    // Function to add products to the cart
    function addToCart(button) {
        try {
            const productId = button.getAttribute('data-id');
            const productDiv = button.closest('.group');
            const label = productDiv.querySelector('.label').innerText;
            const info = productDiv.querySelector('.info').innerText;
            const priceText = productDiv.querySelector('.price').innerText;
            const price = parseFloat(priceText.replace('R', ''));
            const imageUrl = productDiv.querySelector('img').src;

            const product = { label, info, price, imageUrl };

            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            const existingIndex = cart.findIndex(item => item.label === product.label && item.info === product.info);
            if (existingIndex !== -1) {
                cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
            } else {
                product.quantity = 1;
                cart.push(product);
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartDisplay();
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('An error occurred while adding the product to the cart.');
        }
    }

    // Function to update the cart display
    function updateCartDisplay() {
        try {
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            cartItems.innerHTML = '';
            let totalPrice = 0;

            cart.forEach((item, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    ${item.label} - ${item.info} - R${item.price.toFixed(2)} (x${item.quantity || 1})
                    <button onclick="removeFromCart(${index})">Remove</button>
                `;
                cartItems.appendChild(li);
                totalPrice += item.price * (item.quantity || 1);
            });

            totalPriceElement.innerText = `Total: R${totalPrice.toFixed(2)}`;
            localStorage.setItem('cartTotalPrice', totalPrice.toFixed(2));
            localStorage.setItem('cart', JSON.stringify(cart));
        } catch (error) {
            console.error('Error updating cart display:', error);
            alert('An error occurred while updating the cart display.');
        }
    }

    // Function to remove a product from the cart
    window.removeFromCart = function(index) {
        try {
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            if (index >= 0 && index < cart.length) {
                cart.splice(index, 1);
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartDisplay();
            } else {
                console.error('Invalid cart index:', index);
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
            alert('An error occurred while removing the product from the cart.');
        }
    }

    // Function to clear the cart
    document.getElementById('clearCart').addEventListener('click', () => {
        try {
            localStorage.removeItem('cart');
            localStorage.removeItem('cartTotalPrice');
            updateCartDisplay();
        } catch (error) {
            console.error('Error clearing cart:', error);
            alert('An error occurred while clearing the cart.');
        }
    });

    // Function to handle checkout (to be implemented)
    document.getElementById('checkoutButton').addEventListener('click', () => {
        alert('Checkout functionality is not implemented yet.');
    });
});
