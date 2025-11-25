const PASSWORD = 'I90.SS2025';

document.addEventListener('DOMContentLoaded', function() {
    const passwordCard = document.getElementById('passwordCard');
    const signupCard = document.getElementById('signupCard');
    const passwordForm = document.getElementById('passwordForm');
    const passwordInput = document.getElementById('passwordInput');
    const passwordError = document.getElementById('passwordError');
    const santaFly = document.getElementById('santaFly');
    const signupForm = document.getElementById('signupForm');
    const signupError = document.getElementById('signupError');

    // Check if already logged in
    if (sessionStorage.getItem('authenticated') === 'true') {
        showSignup();
    }

    // Password form
    passwordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (passwordInput.value === PASSWORD) {
            // Show Santa flying
            santaFly.classList.add('active');
            
            // Switch to signup after animation
            setTimeout(function() {
                sessionStorage.setItem('authenticated', 'true');
                showSignup();
            }, 2500);
        } else {
            passwordError.textContent = '❌ Wrong password! Try again.';
            passwordError.style.display = 'block';
            passwordCard.classList.add('shake');
            setTimeout(() => passwordCard.classList.remove('shake'), 500);
            passwordInput.value = '';
        }
    });

    // Signup form
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const btn = signupForm.querySelector('.btn');
        btn.disabled = true;
        btn.textContent = 'Sending to Santa... 🎅';
        
        const data = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            preferences: {
                collectOrReceive: document.getElementById('q1').value,
                favoriteStore: document.getElementById('q2').value,
                hobby: document.getElementById('q3').value,
                wishlist: document.getElementById('q4').value || 'No specific items'
            }
        };
        
        try {
            const response = await fetch('/.netlify/functions/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                window.location.href = '/thankyou.html';
            } else {
                const result = await response.json();
                signupError.textContent = result.error || 'Error! Try again.';
                signupError.style.display = 'block';
                btn.disabled = false;
                btn.textContent = '🎄 JOIN SECRET SANTA 🎄';
            }
        } catch (error) {
            signupError.textContent = 'Network error! Try again.';
            signupError.style.display = 'block';
            btn.disabled = false;
            btn.textContent = '🎄 JOIN SECRET SANTA 🎄';
        }
    });

    function showSignup() {
        passwordCard.style.display = 'none';
        signupCard.style.display = 'block';
        loadCount();
    }

    async function loadCount() {
        try {
            const response = await fetch('/.netlify/functions/getParticipants');
            const data = await response.json();
            const count = data.participants ? data.participants.length : 0;
            document.getElementById('participantCount').textContent = count;
        } catch (error) {
            document.getElementById('participantCount').textContent = '0';
        }
    }
});
