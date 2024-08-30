document.addEventListener('DOMContentLoaded', () => {
    const loginFormC = document.getElementById('loginCustomerForm');
    const signupFormC = document.getElementById('signupCustomerForm');

    if (loginFormC) {
        loginFormC.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;
            const messageDiv = document.getElementById('loginMessage');
            
            try {
                const response = await fetch('/api/auth/loginCustomer', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    window.location.href = '/index.html';
                } else {
                    messageDiv.textContent = result.error || 'Login failed';
                    messageDiv.style.color = 'red';
                }
            } catch (error) {
                messageDiv.textContent = 'An error occurred';
                messageDiv.style.color = 'red';
            }
        });
    }

    if (signupFormC) {
        signupFormC.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = document.getElementById('signupFirstName').value;
            const lastName = document.getElementById('signupLastName').value;
            const email = document.getElementById('signupEmail').value;
            const phone = document.getElementById('signupPhone').value;
            const address = document.getElementById('signupAddress').value;
            const city = document.getElementById('signupCity').value;
            const state = document.getElementById('signupState').value;
            const zipCode = document.getElementById('signupZip').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('signupConfirmPassword').value;
            const messageDiv = document.getElementById('signupMessage');
            
            try {
                const response = await fetch('/api/auth/signupCustomer', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, lastName, email, phone, address, city, state, zipCode, password, confirmPassword })
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    messageDiv.textContent = 'Sign up successful! You can now log in.';
                    messageDiv.style.color = 'green';
                } else {
                    messageDiv.textContent = result.error || 'Sign up failed';
                    messageDiv.style.color = 'red';
                }
            } catch (error) {
                messageDiv.textContent = 'An error occurred';
                messageDiv.style.color = 'red';
            }
        });
    }
});
