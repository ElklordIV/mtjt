window.addEventListener('DOMContentLoaded', () => {
    // Retrieve the total price from localStorage
    const totalPrice = parseFloat(localStorage.getItem('cartTotalPrice')) || 0;
    const deliveryFee = 60;
    const totalWithDelivery = totalPrice + deliveryFee;

    // Display the total price
    const cartTotalPriceElement = document.querySelector('#amount');
    if (cartTotalPriceElement) {
        cartTotalPriceElement.textContent = `R${totalWithDelivery.toFixed(2)}`;
    }

    // Handle delivery type change
    const deliverySelect = document.getElementById('delivery-type');
    deliverySelect.addEventListener('change', () => {
        const selectedDeliveryFee = deliverySelect.value === 'express' ? 100 : 60;
        const newTotalWithDelivery = totalPrice + selectedDeliveryFee;
        cartTotalPriceElement.textContent = `R${newTotalWithDelivery.toFixed(2)}`;
    });

    // Display cart items
    displayCartItems();

    // Handle the "See Payment Options" button click
    const seePaymentOptionsButton = document.getElementById('seePaymentOptions');
    seePaymentOptionsButton.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default button behavior
        document.getElementById('paymentForm').dispatchEvent(new Event('submit')); // Trigger form submission
    });
});

document.getElementById('paymentForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission

    // Get form data
    const email = document.getElementById('email-address').value;
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const street = document.getElementById('street').value;
    const city = document.getElementById('city').value;
    const province = document.getElementById('state').value;
    const zipCode = document.getElementById('zip').value;
    const country = document.getElementById('country').value;
    const deliveryType = document.getElementById('delivery-type').value;
    const cart = JSON.parse(localStorage.getItem('cart'));
    const totalAmount = parseFloat(localStorage.getItem('cartTotalPrice')) + (deliveryType === 'express' ? 100 : 60);

    // Construct order data
    const orderData = {
        email,
        firstName,
        lastName,
        address: {
            street,
            city,
            province,
            zipCode,
            country
        },
        cart,
        totalAmount,
        deliveryType // Include deliveryType in the order data
    };

    try {
        // Send order data to server
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            const errorResponse = await response.text(); // Get the error response text
            throw new Error(`Failed to create order. Response status: ${response.status}. Response body: ${errorResponse}`);
        }

        const savedOrder = await response.json();

        // Store the order ID or other necessary info
        localStorage.setItem('orderId', savedOrder._id);

        // Show the Paystack form
        payWithPaystack(savedOrder._id, email, totalAmount);

    } catch (error) {
        console.error('Error during form submission:', error.message);
        alert('An error occurred during form submission: ' + error.message);
    }
});

// Function to display cart items
function displayCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
        return;
    }

    const itemsHtml = cart.map(item => `
        <div class="cart-item">
            <span class="cart-item-name">${item.label}</span>
            <span class="cart-item-quantity">x${item.quantity}</span>
            <span class="cart-item-price">R${item.price.toFixed(2)}</span>
        </div>
    `).join('');

    cartItemsContainer.innerHTML = itemsHtml;
}

// Function for payment processing
// Function for payment processing
function payWithPaystack(orderId, email, amount) {
    const reference = generateReference(); // Generate a unique reference

    var handler = PaystackPop.setup({
        key: 'pk_test_a17e9a285f7974ed3d64bf2572469e2a7e419c6f', // Replace with your public key
        email,
        amount: amount * 100, // Convert total price to lowest currency unit
        currency: 'ZAR', // Use ZAR for South African Rand
        ref: reference, // Use the generated reference
        callback: function (response) {
            var paymentReference = response.reference;
            alert('Payment complete! Reference: ' + paymentReference);

            // Update the order with the generated reference and user details
            fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ paymentReference })
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Order updated with reference:', data);
                    // Redirect or further actions
                })
                .catch(error => {
                    console.error('Error updating order:', error);
                });
        },
        onClose: function () {
            alert('Transaction was not completed, window closed.');
        },
    });
    handler.openIframe();
}


// Function to generate a unique reference
function generateReference() {
    return 'ref_' + Math.random().toString(36).substr(2, 9);
}
