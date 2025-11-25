const SIGNUP_PASSWORD = 'I90.SS2025';

// Countdown Timer (for thank you page)
function updateCountdown() {
    const countdownEl = document.getElementById('countdown');
    if (!countdownEl) return;
    
    const eventDate = new Date('December 19, 2025 13:00:00').getTime();
    const now = new Date().getTime();
    const distance = eventDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

    countdownEl.textContent = `${days} days, ${hours} hours, ${minutes} minutes!`;
}

if (document.getElementById('countdown')) {
    updateCountdown();
    setInterval(updateCountdown, 60000);
}

// Check if already authenticated
if (sessionStorage.getItem('authenticated') === 'true') {
    const passwordScreen = document.getElementById('passwordScreen');
    const signupCard = document.getElementById('signupCard');
    if (passwordScreen && signupCard) {
        passwordScreen.style.display = 'none';
        signupCard.style.display = 'block';
        loadParticipantCount();
    }
}

// Password form handling
const passwordForm = document.getElementById('passwordForm');
if (passwordForm) {
    passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const password = document.getElementById('accessPassword').value;
        const errorDiv = document.getElementById('passwordError');
        const hohohoDiv = document.getElementById('hohoho');
        const passwordScreen = document.getElementById('passwordScreen');
        const santaTransition = document.getElementById('santaTransition');
        
        if (password === SIGNUP_PASSWORD) {
            // Shake the screen
            document.body.classList.add('shake');
            setTimeout(() => document.body.classList.remove('shake'), 500);
            
            // Show HO HO HO message
            hohohoDiv.classList.add('show');
            
            // Trigger Santa sleigh flying across
            if (santaTransition) {
                santaTransition.classList.add('fly');
            }
            
            // After animation, transition to signup form
            setTimeout(() => {
                sessionStorage.setItem('authenticated', 'true');
                passwordScreen.style.display = 'none';
                document.getElementById('signupCard').style.display = 'block';
                loadParticipantCount();
            }, 2000);
        } else {
            errorDiv.textContent = '❌ Incorrect password. Please try again.';
            errorDiv.style.display = 'block';
            document.getElementById('accessPassword').value = '';
            
            // Shake the card
            passwordScreen.classList.add('shake');
            setTimeout(() => passwordScreen.classList.remove('shake'), 500);
        }
    });
}

// Load participant count
async function loadParticipantCount() {
    try {
        const response = await fetch('/.netlify/functions/getParticipants');
        const data = await response.json();
        const count = data.participants ? data.participants.length : 0;
        const countEl = document.getElementById('participantCount');
        if (countEl) {
            countEl.textContent = count;
        }
    } catch (error) {
        const countEl = document.getElementById('participantCount');
        if (countEl) {
            countEl.textContent = '0';
        }
    }
}

// Form field sparkle animation and progress tracking
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    const formInputs = document.querySelectorAll('#signupForm input[required]');
    const progressContainer = document.getElementById('progressContainer');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    const encouragingMessages = [
        "Let's get started! 🎅",
        "Great start! Keep going! ✨",
        "You're doing amazing! 🎄",
        "Almost halfway there! 🎁",
        "Fantastic! Keep it up! ⭐",
        "You're crushing it! 🎉",
        "So close now! 💫",
        "Final stretch! You got this! 🚀"
    ];

    formInputs.forEach((input, index) => {
        input.addEventListener('focus', () => {
            if (progressContainer && progressContainer.style.display === 'none') {
                progressContainer.style.display = 'block';
            }
        });

        input.addEventListener('blur', () => {
            if (input.value.trim() !== '') {
                // Show sparkle
                const sparkle = input.parentElement.querySelector('.sparkle');
                if (sparkle) {
                    sparkle.style.display = 'inline';
                    setTimeout(() => {
                        sparkle.style.display = 'none';
                    }, 600);
                }
                
                // Update progress
                updateProgress();
            }
        });
    });

    function updateProgress() {
        let filledCount = 0;
        formInputs.forEach(input => {
            if (input.value.trim() !== '') {
                filledCount++;
            }
        });
        
        const percentage = (filledCount / formInputs.length) * 100;
        if (progressFill) {
            progressFill.style.width = percentage + '%';
        }
        
        const messageIndex = Math.min(Math.floor((filledCount / formInputs.length) * encouragingMessages.length), encouragingMessages.length - 1);
        if (progressText) {
            progressText.textContent = encouragingMessages[messageIndex];
        }
    }

    // Signup form handling
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const messageDiv = document.getElementById('message');
        const submitBtn = e.target.querySelector('button[type="submit"]');
        
        submitBtn.disabled = true;
        
        // Multi-stage button text
        submitBtn.textContent = '🎅 Signing you up...';
        
        setTimeout(() => {
            submitBtn.textContent = '✨ Sprinkling Christmas magic...';
        }, 1000);
        
        setTimeout(() => {
            submitBtn.textContent = '🎄 Adding you to Santa\'s list...';
        }, 2000);
        
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
                // Success! Trigger confetti and redirect
                setTimeout(() => {
                    window.location.href = '/thankyou.html';
                }, 2500);
            } else {
                messageDiv.textContent = data.error || 'Something went wrong. Please try again!';
                messageDiv.className = 'message error';
                submitBtn.disabled = false;
                submitBtn.textContent = '🎄 Join the Secret Santa! 🎄';
            }
        } catch (error) {
            messageDiv.textContent = 'Network error. Please check your connection and try again.';
            messageDiv.className = 'message error';
            submitBtn.disabled = false;
            submitBtn.textContent = '🎄 Join the Secret Santa! 🎄';
        }
    });
}
