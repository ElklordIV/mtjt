let cart = []; // Initialize an empty cart array

// Function to add a product to the cart
function addToCart(button) {
    try {
        // Find the product group
        let productGroup = button.closest('.group');
        if (!productGroup) throw new Error('Product group not found.');

        // Extract the product information
        let labelElement = productGroup.querySelector('.label', 'product.label');
        let infoElement = productGroup.querySelector('.info','product.info');
        let priceElement = productGroup.querySelector('.price','product.price');

        
        if (!labelElement || !infoElement || !priceElement) {
            throw new Error('Product information elements not found.');
        }

        let productInfo = {
            label: labelElement.textContent,
            info: infoElement.textContent,
            price: parseFloat(priceElement.textContent.replace('R', ''))
        };

        if (isNaN(productInfo.price)) throw new Error('Invalid price.');

        // Check if the item already exists in the cart
        let existingIndex = cart.findIndex(item => item.label === productInfo.label);
        if (existingIndex !== -1) {
            // If the item exists, increment its quantity
            cart[existingIndex].quantity++;
        } else {
            // If the item is new, add it to the cart
            productInfo.quantity = 1; // Add quantity property
            cart.push(productInfo);
        }

        // Update the cart display
        updateCartDisplay();
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('An error occurred while adding the product to the cart.');
    }
}

// Function to remove an item from the cart
function removeItem(index) {
    try {
        if (index < 0 || index >= cart.length) throw new Error('Invalid index.');
        cart.splice(index, 1); // Remove the item at the specified index
        updateCartDisplay();
    } catch (error) {
        console.error('Error removing item:', error);
        alert('An error occurred while removing the item from the cart.');
    }
}

// Function to update the cart display
function updateCartDisplay() {
    try {
        const cartItemsList = document.getElementById('cartItems');
        const totalPriceElement = document.getElementById('totalPrice');
        if (!cartItemsList || !totalPriceElement) {
            throw new Error('Cart display elements not found.');
        }

        cartItemsList.innerHTML = ''; // Clear the existing cart items

        let totalPrice = 0;
        cart.forEach((item, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = `${item.label} - R${item.price.toFixed(2)} (x${item.quantity})`; // Display the quantity
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.onclick = () => removeItem(index);
            listItem.appendChild(removeButton);
            cartItemsList.appendChild(listItem);

            totalPrice += item.price * item.quantity; // Multiply price by quantity
        });

        totalPriceElement.textContent = `Total: R${totalPrice.toFixed(2)}`;

        // Store the total price and cart in localStorage
        localStorage.setItem('cartTotalPrice', totalPrice.toFixed(2));
        localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
        console.error('Error updating cart display:', error);
        alert('An error occurred while updating the cart display.');
    }
}

// Function to clear the cart
function clearCart() {
    try {
        cart = []; // Clear the cart
        updateCartDisplay();
    } catch (error) {
        console.error('Error clearing cart:', error);
        alert('An error occurred while clearing the cart.');
    }
}

// Add event listener for the clear cart button
document.getElementById('clearCartButton').addEventListener('click', clearCart);

// Function for checkout
async function checkout() {
    try {
        if (cart.length === 0) throw new Error('Cart is empty.');

        // Construct order data
        const orderData = {
            cart,
            totalAmount: parseFloat(localStorage.getItem('cartTotalPrice'))
        };

        // Send order data to server
        const response = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) throw new Error('Failed to create order.');

        const savedOrder = await response.json();

        // Store the order ID or other necessary info
        localStorage.setItem('orderId', savedOrder._id);

        // Redirect to payment page
        window.location.href = 'payment.html';
    } catch (error) {
        console.error('Error during checkout:', error);
        alert('An error occurred during checkout.');
    }
}

// Add event listener for the checkout button
document.getElementById('checkoutButton').addEventListener('click', checkout);

// Initialize cart from localStorage on page load
window.addEventListener('load', () => {
    const storedCart = localStorage.getItem('cart');
    const storedTotalPrice = localStorage.getItem('cartTotalPrice');

    if (storedCart) {
        cart = JSON.parse(storedCart);
        updateCartDisplay();
    }

    if (storedTotalPrice) {
        document.getElementById('totalPrice').textContent = `Total: R${parseFloat(storedTotalPrice).toFixed(2)}`;
    }
});
