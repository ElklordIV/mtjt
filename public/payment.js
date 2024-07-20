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

    // Retrieve cart items from localStorage and display them (if needed)
    const cartItems = JSON.parse(localStorage.getItem('cart'));
    const cartItemsContainer = document.getElementById('cartItems');
    if (cartItems && cartItemsContainer) {
        cartItems.forEach(item => {
            const listItem = document.createElement('div');
            listItem.textContent = `${item.label} - ${item.price.toFixed(2)} R (x${item.quantity})`;
            cartItemsContainer.appendChild(listItem);
        });
    }
});

// Function for handling form submission
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
    const cart = JSON.parse(localStorage.getItem('cart'));
    const totalAmount = parseFloat(localStorage.getItem('cartTotalPrice')) + 60;

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
        totalAmount
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

        if (!response.ok) throw new Error('Failed to create order.');

        const savedOrder = await response.json();

        // Store the order ID or other necessary info
        localStorage.setItem('orderId', savedOrder._id);

        // Redirect to payment page or process payment directly
        payWithPaystack(event, savedOrder._id, email, totalAmount);

    } catch (error) {
        console.error('Error during form submission:', error);
        alert('An error occurred during form submission.');
    }
});

// Function for payment processing
function payWithPaystack(event, orderId, email, amount) {
    const reference = generateReference(); // Generate a unique reference
    event.preventDefault();

    var handler = PaystackPop.setup({
        key: 'pk_test_541516a11eb8810ae4af46845a8840ee009e700c', // Replace with your public key
        email,
        amount: amount * 100, // Convert total price to lowest currency unit
        currency: 'ZAR', // Use GHS for Ghana Cedis or USD for US Dollars
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
