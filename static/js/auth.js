document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const errorMsg = document.getElementById('error-msg');
    const roleSelect = document.getElementById('role');
    const deptGroup = document.getElementById('dept-group');

    // Toggle Department Input based on Role
    if (roleSelect) {
        roleSelect.addEventListener('change', (e) => {
            if (e.target.value === 'officer') {
                deptGroup.style.display = 'block';
            } else {
                deptGroup.style.display = 'none';
            }
        });
    }

    // Login Handler
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                    localStorage.setItem('token', data.token);
                    
                    // Redirect based on role
                    if (data.user.role === 'admin') {
                        window.location.href = '/dashboard/admin';
                    } else if (data.user.role === 'officer') {
                        window.location.href = '/dashboard/officer';
                    } else {
                        window.location.href = '/dashboard/citizen';
                    }
                } else {
                    showError(data.error || 'Login failed');
                }
            } catch (err) {
                showError('Network error. Please try again.');
            }
        });
    }

    // Register Handler
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const fullName = document.getElementById('full_name').value;
            const role = document.getElementById('role').value;
            const departmentId = document.getElementById('department_id')?.value;

            const payload = {
                email,
                password,
                full_name: fullName,
                role
            };

            if (role === 'officer' && departmentId) {
                payload.department_id = parseInt(departmentId);
            }

            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Registration successful! Please login.');
                    window.location.href = '/login';
                } else {
                    showError(data.error || 'Registration failed');
                }
            } catch (err) {
                showError('Network error. Please try again.');
            }
        });
    }

    function showError(msg) {
        errorMsg.textContent = msg;
        errorMsg.style.display = 'block';
    }
});
