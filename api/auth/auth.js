document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;
            const messageDiv = document.getElementById('loginMessage');
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    window.location.href = '/admin.html';
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

    if (signupForm) {
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = document.getElementById('signupUsername').value;
            const password = document.getElementById('signupPassword').value;
            const messageDiv = document.getElementById('signupMessage');
            
            try {
                const response = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
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
