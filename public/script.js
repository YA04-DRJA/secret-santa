const SIGNUP_PASSWORD = 'I90.SS2025';

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const passwordScreen = document.getElementById('passwordScreen');
    const signupCard = document.getElementById('signupCard');
    const passwordForm = document.getElementById('passwordForm');
    const passwordInput = document.getElementById('accessPassword');
    const passwordError = document.getElementById('passwordError');
    const santaAnimation = document.getElementById('santaAnimation');
    const signupForm = document.getElementById('signupForm');
    const messageEl = document.getElementById('message');

    // Show signup card function
    function showSignupCard() {
        passwordScreen.style.display = 'none';
        signupCard.style.display = 'block';
        loadParticipantCount();
    }

    // Check if already authenticated
    if (sessionStorage.getItem('authenticated') === 'true') {
        showSignupCard();
    }

    // Password form handling
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const password = passwordInput.value;

            if (password === SIGNUP_PASSWORD) {
                // Play Santa animation
                santaAnimation.classList.add('fly');
                
                // Show signup card after animation
                setTimeout(function() {
                    sessionStorage.setItem('authenticated', 'true');
                    showSignupCard();
                }, 1500);
            } else {
                passwordError.textContent = '❌ Wrong password! Try again.';
                passwordError.style.display = 'block';
                passwordInput.value = '';
                
                // Shake animation
                passwordScreen.style.animation = 'shake 0.5s';
                setTimeout(() => passwordScreen.style.animation = '', 500);
            }
        });
    }

    // Load participant count
    async function loadParticipantCount() {
        const countEl = document.getElementById('participantCount');
        if (!countEl) return;

        try {
            const response = await fetch('/.netlify/functions/getParticipants');
            const data = await response.json();
            const count = data.participants ? data.participants.length : 0;
            countEl.textContent = count;
        } catch (error) {
            countEl.textContent = '0';
        }
    }

    // Signup form handling
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = signupForm.querySelector('button');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending to Santa...';
            
            const formData = {
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
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    window.location.href = '/thankyou.html';
                } else {
                    messageEl.textContent = data.error || 'Error! Please try again.';
                    messageEl.style.display = 'block';
                    submitBtn.disabled = false;
                    submitBtn.textContent = '🎄 Join Secret Santa! 🎄';
                }
            } catch (error) {
                messageEl.textContent = 'Network error. Try again!';
                messageEl.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.textContent = '🎄 Join Secret Santa! 🎄';
            }
        });
    }

    // Countdown for thank you page
    const countdownEl = document.getElementById('countdown');
    if (countdownEl) {
        function updateCountdown() {
            const eventDate = new Date('December 19, 2025 13:00:00').getTime();
            const now = new Date().getTime();
            const distance = eventDate - now;

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

            countdownEl.textContent = `${days} days, ${hours} hours, ${minutes} minutes`;
        }

        updateCountdown();
        setInterval(updateCountdown, 60000);
    }
});

// Shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
        20%, 40%, 60%, 80% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);
