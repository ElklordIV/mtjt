document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    updateCartDisplay();
});

// Global cart variable
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Function to fetch products from the server and display them
async function fetchProducts() {
    try {
        // Determine which page to fetch products for (index, building, tools, etc.)
        const page = document.getElementById('pageSelector')?.value || 'index'; // Default to 'index' if no page is selected
        const response = await fetch(`/api/products/${page}`);
        if (response.ok) {
            const products = await response.json();
            displayProducts(products);
        } else {
            console.error('Failed to fetch products');
        }
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}
// index.js

document.addEventListener('DOMContentLoaded', () => {
    const userName = localStorage.getItem('userName');
    const signUpLink = document.querySelector('a[href="signUpCustomer.html"]');
    
    if (userName && signUpLink) {
        signUpLink.textContent = `Welcome, ${userName}`;
    }
});

// Function to display products in a grid format
function displayProducts(products) {
    const productList = document.getElementById('productList');
    productList.innerHTML = ''; // Clear previous products

    const categories = [...new Set(products.map(p => p.category))]; // Get unique categories
    categories.forEach(category => {
        const categorySection = document.createElement('section');
        categorySection.innerHTML = `<h2>${category}</h2>`;
        
        const categoryProducts = products.filter(product => product.category === category).slice(0, 3);
        const productGrid = document.createElement('div');
        productGrid.classList.add('product-grid');
        
        categoryProducts.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('product-item');
            
            const price = product.price ? `R${product.price.toFixed(2)}` : 'Price not available';
            
            productDiv.innerHTML = `
                <div class="group">
                    <a href="productDetails.html?id=${product._id}">
                        <img src="${product.imageUrl}" alt="${product.label}" class="product-img">
                        <h6 class="label">${product.label}</h6>
                        <h3 class="info">${product.info}</h3>
                        <h2 class="price">${price}</h2>
                    </a>
                    <button class="cartB" onclick="addToCart(this)">ADD TO CART</button>
                </div>
            `;
            
            productGrid.appendChild(productDiv);
        });
        
        categorySection.appendChild(productGrid);
        productList.appendChild(categorySection);
    });
}

// Function to add a product to the cart
function addToCart(button) {
    try {
        // Find the product group
        let productGroup = button.closest('.group');
        if (!productGroup) throw new Error('Product group not found.');

        // Extract the product information
        let labelElement = productGroup.querySelector('.label');
        let infoElement = productGroup.querySelector('.info');
        let priceElement = productGroup.querySelector('.price');

        if (!labelElement || !infoElement || !priceElement) {
            throw new Error('Product information elements not found.');
        }

        let productInfo = {
            label: labelElement.textContent.trim(),
            info: infoElement.textContent.trim(),
            price: parseFloat(priceElement.textContent.replace(/[^0-9.-]+/g,"")), // Remove currency symbols
            quantity: 1 // Default quantity
        };

        if (isNaN(productInfo.price)) throw new Error('Invalid price.');

        // Check if the item already exists in the cart
        let existingIndex = cart.findIndex(item => item.label === productInfo.label && item.info === productInfo.info);
        if (existingIndex !== -1) {
            // If the item exists, increment its quantity
            cart[existingIndex].quantity++;
        } else {
            // If the item is new, add it to the cart
            cart.push(productInfo);
        }

        // Update the cart display
        updateCartDisplay();
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('An error occurred while adding the product to the cart.');
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
//function to your index.js file
function searchProducts() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) {
        alert("Please enter a search term");
        return;
    }
    fetch(`/searchProducts?query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(products => {
            const productList = document.getElementById('productList');
            productList.innerHTML = ''; // Clear existing products
            if (products.length === 0) {
                productList.innerHTML = '<p>No products found</p>';
                return;
            }
            products.forEach(product => {
                const productElement = document.createElement('div');
                productElement.className = 'product';
                productElement.innerHTML = `
                    <img src="${product.imageUrl}" alt="${product.name}">
                    <h2>${product.label}</h2>
                    <p>${product.info}</p>
                    <p>${product.price}</p>
                    <button onclick="viewProduct('${product._id}')">View Details</button>
                `;
                productList.appendChild(productElement);
            });
        })
        .catch(error => console.error('Error:', error));
}

function viewProduct(productId) {
    window.location.href = `productDetails.html?id=${productId}`;
}

function viewProduct(productId) {
    window.location.href = `productDetails.html?id=${productId}`;
}

function viewProduct(productId) {
    window.location.href = `productDetails.html?id=${productId}`;
}

// Function to remove an item from the cart
function removeItem(index) {
    cart.splice(index, 1);
    updateCartDisplay();
}

// Function to clear the cart
function clearCart() {
    cart = [];
    localStorage.removeItem('cart');
    updateCartDisplay();
}

// Function to handle checkout
function redirectToCheckout() {
    localStorage.setItem('cartTotalPrice', calculateCartTotal());
    window.location.href = 'payment.html';
}

// Function to calculate the total price of items in the cart
function calculateCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Add event listener to checkout button
document.getElementById('checkoutButton')?.addEventListener('click', redirectToCheckout);
