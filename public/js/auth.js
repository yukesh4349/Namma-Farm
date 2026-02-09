// ===================================
// AUTHENTICATION LOGIC
// ===================================

// Handle Login
async function handleLogin(event) {
    event.preventDefault();

    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');

    // Validate
    if (!validatePhone(phone)) {
        showAlert(getCurrentLanguage() === 'ta'
            ? 'தவறான தொலைபேசி எண் வடிவம்'
            : 'Invalid phone number format', 'danger');
        return;
    }

    if (!validatePassword(password)) {
        showAlert(getCurrentLanguage() === 'ta'
            ? 'கடவுச்சொல் குறைந்தது 6 எழுத்துக்கள் இருக்க வேண்டும்'
            : 'Password must be at least 6 characters', 'danger');
        return;
    }

    // Disable button and show loading
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px; margin: 0 auto;"></div>';

    try {
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ phone, password })
        });

        if (response.success) {
            // Save token and user data
            setAuthToken(response.token);
            setUserData(response.user);

            // Set language preference
            localStorage.setItem('nammaFarmLang', response.user.language);

            showAlert(getCurrentLanguage() === 'ta'
                ? 'வெற்றிகரமாக உள்நுழைந்தீர்கள்!'
                : 'Login successful!', 'success');

            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1000);
        }
    } catch (error) {
        showAlert(getCurrentLanguage() === 'ta'
            ? 'உள்நுழைவு தோல்வியுற்றது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
            : 'Login failed. Please try again.', 'danger');

        loginBtn.disabled = false;
        loginBtn.innerHTML = '<span data-en="Login" data-ta="உள்நுழைய">Login</span>';
        applyLanguage();
    }
}

// Handle Signup
async function handleSignup(event) {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const location = document.getElementById('location').value.trim();
    const cropType = document.getElementById('cropType').value.trim();
    const language = document.getElementById('language').value;
    const signupBtn = document.getElementById('signupBtn');

    // Validate
    if (!name) {
        showAlert(getCurrentLanguage() === 'ta'
            ? 'பெயரை உள்ளிடவும்'
            : 'Please enter your name', 'danger');
        return;
    }

    if (!validatePhone(phone)) {
        showAlert(getCurrentLanguage() === 'ta'
            ? 'தவறான தொலைபேசி எண் வடிவம்'
            : 'Invalid phone number format', 'danger');
        return;
    }

    if (!validatePassword(password)) {
        showAlert(getCurrentLanguage() === 'ta'
            ? 'கடவுச்சொல் குறைந்தது 6 எழுத்துக்கள் இருக்க வேண்டும்'
            : 'Password must be at least 6 characters', 'danger');
        return;
    }

    // Disable button and show loading
    signupBtn.disabled = true;
    signupBtn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px; margin: 0 auto;"></div>';

    try {
        const response = await apiRequest('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({
                name,
                phone,
                password,
                location,
                cropType,
                language
            })
        });

        if (response.success) {
            // Save token and user data
            setAuthToken(response.token);
            setUserData(response.user);

            // Set language preference
            localStorage.setItem('nammaFarmLang', language);

            showAlert(getCurrentLanguage() === 'ta'
                ? 'கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது!'
                : 'Account created successfully!', 'success');

            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1000);
        }
    } catch (error) {
        showAlert(error.message || (getCurrentLanguage() === 'ta'
            ? 'பதிவு தோல்வியுற்றது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
            : 'Signup failed. Please try again.'), 'danger');

        signupBtn.disabled = false;
        signupBtn.innerHTML = '<span data-en="Create Account" data-ta="கணக்கை உருவாக்கவும்">Create Account</span>';
        applyLanguage();
    }
}
