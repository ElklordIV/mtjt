document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#loginForm');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const messageDiv = document.getElementById('loginMessage');

        try {
            const response = await fetch('/api/auth/customer/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (response.ok) {
                window.location.href = '/customer-dashboard.html';
            } else {
                messageDiv.textContent = result.error || 'Login failed';
                messageDiv.style.color = 'red';
            }
        } catch (error) {
            messageDiv.textContent = 'An error occurred';
            messageDiv.style.color = 'red';
        }
    });
});
