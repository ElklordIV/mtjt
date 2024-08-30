document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    console.log('Product ID:', productId);  // Debug statement

    if (productId) {
        fetch(`/getProductById?id=${productId}`)
            .then(response => response.json())
            .then(product => {
                document.getElementById('productName').textContent = product.label;
                document.getElementById('productImage').src = product.imageUrl;
                document.getElementById('productInfo').textContent = product.info;

                // Split the product details by periods, and create list items
                const detailsArray = product.details.split(/<br>|\|,/); // You can customize the delimiters
                const detailsList = detailsArray
                    .filter(detail => detail.trim() !== '')  // Remove empty items
                    .map(detail => `<li>${detail.trim()}</li>`)
                    .join('');

                // Wrap the details in a <ul> element
                document.getElementById('productDetails').innerHTML = `<ul>${detailsList}</ul>`;
                
                document.getElementById('productPrice').textContent = `Price: R${product.price}`;
                
            })
            .catch(error => console.error('Error fetching product details:', error));
    } else {
        console.error('No product ID found in URL.');
    }
});


function addToCart(productId) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const product = { id: productId }; // Ideally, you would fetch full product details or ensure it is available
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Product added to cart');
}