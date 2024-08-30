document.addEventListener('DOMContentLoaded', () => {
    fetchCategories();
    fetchProducts();

    const addProductForm = document.getElementById('addProductForm');
    const updateProductButton = document.getElementById('updateProductButton');
    const searchOrderForm = document.getElementById('searchOrderForm');
    const editProductForm = document.getElementById('editProductForm');
    const closeModalButton = document.querySelector('.modal .close');

    if (addProductForm) {
        addProductForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const newProduct = {
                label: document.getElementById('label').value,
                info: document.getElementById('info').value,
                price: parseFloat(document.getElementById('price').value),
                imageUrl: document.getElementById('imageUrl').value,
                details: document.getElementById('details').value,
                category: document.getElementById('category').value,
                page: document.getElementById('page').value // Page selection
            };

            try {
                const response = await fetch('/api/products', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newProduct)
                });

                if (response.ok) {
                    console.log('Product added successfully');
                    fetchProducts(); // Refresh the product list
                    addProductForm.reset(); // Reset form fields
                } else {
                    const error = await response.json();
                    console.error('Failed to add product:', error.message);
                }
            } catch (error) {
                console.error('Error adding product:', error);
            }
        });
    }

    if (updateProductButton) {
        updateProductButton.addEventListener('click', async () => {
            const productId = document.getElementById('productId').value;
            const updatedProduct = {
                label: document.getElementById('editLabel').value,
                info: document.getElementById('editInfo').value,
                price: parseFloat(document.getElementById('editPrice').value),
                imageUrl: document.getElementById('editImageUrl').value,
                details: document.getElementById('editDetails').value,
                category: document.getElementById('editCategory').value,
                page: document.getElementById('editPage').value // Page selection
            };

            try {
                const response = await fetch(`/api/products/${productId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedProduct)
                });

                if (response.ok) {
                    console.log('Product updated successfully');
                    fetchProducts(); // Refresh the product list
                    document.getElementById('editProductModal').style.display = 'none'; // Hide the modal
                } else {
                    const error = await response.json();
                    console.error('Failed to update product:', error.message);
                }
            } catch (error) {
                console.error('Error updating product:', error);
            }
        });
    }

    const removeAllButton = document.getElementById('removeAllButton');
    if (removeAllButton) {
        removeAllButton.addEventListener('click', async () => {
            if (confirm('Are you sure you want to remove all products? This action cannot be undone.')) {
                try {
                    const response = await fetch('/api/products', {
                        method: 'DELETE'
                    });
                    if (response.ok) {
                        console.log('All products removed successfully');
                        fetchProducts(); // Refresh the product list
                    } else {
                        console.error('Failed to remove all products');
                    }
                } catch (error) {
                    console.error('Error removing all products:', error);
                }
            }
        });
    }

    if (searchOrderForm) {
        searchOrderForm.addEventListener('submit', handleSearchOrder);
    }

    if (editProductForm) {
        editProductForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            await updateProduct(event);
        });
    }

    if (closeModalButton) {
        closeModalButton.addEventListener('click', () => {
            document.getElementById('editProductModal').style.display = 'none';
        });
    }

    window.onclick = function(event) {
        if (event.target == document.getElementById('editProductModal')) {
            document.getElementById('editProductModal').style.display = 'none';
        }
    };

   
});

async function handleSearchOrder(event) {
    event.preventDefault(); // Prevent the form from submitting the default way

    const paymentReference = document.getElementById('paymentReference').value.trim();
    if (!paymentReference) {
        alert('Please enter a payment reference.');
        return;
    }

    try {
        const response = await fetch(`/api/orders/search?paymentReference=${encodeURIComponent(paymentReference)}`);
        if (response.ok) {
            const order = await response.json();
            displayOrderDetails(order);
        } else {
            throw new Error('Order not found.');
        }
    } catch (error) {
        console.error('Error searching for order:', error);
        alert('An error occurred while searching for the order.');
    }
}

function displayOrderDetails(order) {
    const orderDetailsSection = document.getElementById('orderDetails');
    orderDetailsSection.innerHTML = ''; // Clear previous order details

    if (order) {
        const orderDetailsHtml = `
            <h2>Order Details</h2>
            <p><strong>Payment Reference:</strong> ${order.paymentReference}</p>
            <p><strong>Email:</strong> ${order.email}</p>
            <p><strong>Name:</strong> ${order.firstName} ${order.lastName}</p>
            <p><strong>Address:</strong> ${order.address.street}, ${order.address.city}, ${order.address.province}, ${order.address.zipCode}, ${order.address.country}</p>
            <p><strong>Total Amount:</strong> R${order.totalAmount.toFixed(2)}</p>
            <h3>Items:</h3>
            <ul>
                ${order.cart.map(item => `<li>${item.label} - R${item.price.toFixed(2)} (x${item.quantity})</li>`).join('')}
            </ul>
        `;
        orderDetailsSection.innerHTML = orderDetailsHtml;
    } else {
        orderDetailsSection.innerHTML = '<p>No order details available.</p>';
    }
}

async function fetchCategories() {
    try {
        const response = await fetch('/api/categories');
        if (response.ok) {
            const categories = await response.json();
            console.log('Categories:', categories);
            populateCategories(categories);
        } else {
            console.error('Failed to fetch categories');
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

function populateCategories(categories) {
    const categorySelect = document.getElementById('category');
    const editCategorySelect = document.getElementById('editCategory');
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        categorySelect.appendChild(option);
        editCategorySelect.appendChild(option.cloneNode(true)); // Clone option for the edit form
    });
}

async function fetchProducts() {
    try {
        const response = await fetch('/api/products'); // Fetch all products
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

async function deleteProduct(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            console.log('Product deleted successfully');
            fetchProducts(); // Refresh the product list
        } else {
            const error = await response.json();
            console.error('Failed to delete product:', error.message);
        }
    } catch (error) {
        console.error('Error deleting product:', error);
    }
}

function displayProducts(products) {
    const productList = document.getElementById('productList');
    productList.innerHTML = ''; // Clear previous products

    const categories = [...new Set(products.map(p => p.category))]; // Get unique categories
    categories.forEach(category => {
        const categorySection = document.createElement('section');
        categorySection.innerHTML = `<h2>${category}</h2>`;
        
        const categoryProducts = products.filter(product => product.category === category);
        const productGrid = document.createElement('div');
        productGrid.classList.add('product-grid');
        
        categoryProducts.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('product-item');
            productDiv.innerHTML = `
                <img src="${product.imageUrl}" alt="${product.label}">
                <h3>${product.label}</h3>
                <p>${product.info}</p>
                <p>${product.details}</p>
                <p>R${product.price.toFixed(2)}</p>
                <button class="edit-product-button" data-id="${product._id}">Edit</button>
                <button class="delete-product-button" data-id="${product._id}">Delete</button>
            `;

            productDiv.querySelector('.edit-product-button').addEventListener('click', () => editProduct(product));
            productDiv.querySelector('.delete-product-button').addEventListener('click', () => deleteProduct(product._id));

            productGrid.appendChild(productDiv);
        });

        categorySection.appendChild(productGrid);
        productList.appendChild(categorySection);
    });
}

function editProduct(product) {
    document.getElementById('editProductModal').style.display = 'block';
    document.getElementById('productId').value = product._id;
    document.getElementById('editLabel').value = product.label;
    document.getElementById('editInfo').value = product.info;
    document.getElementById('editPrice').value = product.price;
    document.getElementById('editImageUrl').value = product.imageUrl;
    document.getElementById('editDetails').value = product.details;
    document.getElementById('editCategory').value = product.category;
    document.getElementById('editPage').value = product.page; // Set the page selection
}
