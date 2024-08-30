// building.js

document.addEventListener('DOMContentLoaded', () => {
    fetchRoofProducts();
    updateCartDisplay();
    fetchProducts();
});

// Global cart variable
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Function to fetch products for the Building page
async function fetchProducts() {
    try {
        // Fetch products specifically for the Building page
        const response = await fetch('/api/products/roof');
        if (response.ok) {
            const products = await response.json();
            displayProducts(products);
        } else {
            console.error('Failed to fetch building products');
        }
    } catch (error) {
        console.error('Error fetching building products:', error);
    }
}
function fetchRoofProducts() {
    fetch('/getRoofProducts') // Adjust the endpoint to your actual route
        .then(response => response.json())
        .then(products => {
            const productList = document.getElementById('productList');
            products.forEach(product => {
                const productElement = document.createElement('div');
                productElement.className = 'product-item';
                productElement.innerHTML = `
                    <img src="${product.imageUrl}" alt="${product.label}">
                    <h3>${product.label}</h3>
                    <p>${product.info}</p>
                    <p>Price: R${product.price}</p>
                `;
                productElement.addEventListener('click', () => {
                    window.location.href = `productDetails.html?id=${product._id}`;
                });
                productList.appendChild(productElement);
            });
        })
        .catch(error => console.error('Error fetching products:', error));
}
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
// Function to add a product to the cart
function addToCart(button) {
    try {
        const productDiv = button.closest('.group');
        const label = productDiv.querySelector('.label').innerText;
        const info = productDiv.querySelector('.info').innerText;
        const priceText = productDiv.querySelector('.price').innerText;
        const price = parseFloat(priceText.replace('R', ''));
        const imageUrl = productDiv.querySelector('img').src;

        const product = { label, info, price, imageUrl };

        // Check if the item already exists in the cart
        const existingIndex = cart.findIndex(item => item.label === product.label && item.info === product.info);
        if (existingIndex !== -1) {
            // If the item exists, increment its quantity
            cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
        } else {
            // If the item is new, add it to the cart
            product.quantity = 1; // Default quantity
            cart.push(product);
        }

        // Update the cart display
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
        const cartItems = document.getElementById('cartItems');
        const totalPriceElement = document.getElementById('totalPrice');
        if (!cartItems || !totalPriceElement) {
            throw new Error('Cart display elements not found.');
        }

        cartItems.innerHTML = ''; // Clear the existing cart items

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

        // Store the total price and cart in localStorage
        localStorage.setItem('cartTotalPrice', totalPrice.toFixed(2));
        localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
        console.error('Error updating cart display:', error);
        alert('An error occurred while updating the cart display.');
    }
}

// Function to remove an item from the cart
function removeFromCart(index) {
    try {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
    } catch (error) {
        console.error('Error removing item from cart:', error);
        alert('An error occurred while removing the item from the cart.');
    }
}

// Function to clear the cart
function clearCart() {
    try {
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
    } catch (error) {
        console.error('Error clearing cart:', error);
        alert('An error occurred while clearing the cart.');
    }
}

// Function to handle checkout
function checkout() {
    // Implement your checkout logic here
    localStorage.setItem('cartTotalPrice', calculateCartTotal());
    window.location.href = 'payment.html';
}

// Function to calculate the total price of items in the cart
function calculateCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Add event listener to checkout button
document.getElementById('checkoutButton')?.addEventListener('click', checkout);
