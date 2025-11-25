const SIGNUP_PASSWORD = 'I90.SS2025';

// -------- Countdown (used on thankyou.html only) --------
function updateCountdown() {
    const el = document.getElementById('countdown');
    if (!el) return;

    const eventDate = new Date('December 19, 2025 13:00:00').getTime();
    const now = Date.now();
    const diff = eventDate - now;

    if (diff <= 0) {
        el.textContent = 'Today!';
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    el.textContent = `${days} days, ${hours} hours, ${minutes} minutes`;
}

if (document.getElementById('countdown')) {
    updateCountdown();
    setInterval(updateCountdown, 60000);
}

// -------- Shared helpers --------
function showSignupCard() {
    const passwordScreen = document.getElementById('passwordScreen');
    const signupCard = document.getElementById('signupCard');
    if (!passwordScreen || !signupCard) return;

    passwordScreen.style.display = 'none';
    signupCard.style.display = 'block';
    loadParticipantCount();
}

// Restore session if already authenticated before
if (sessionStorage.getItem('authenticated') === 'true') {
    showSignupCard();
}

// -------- Password form handling --------
const passwordForm = document.getElementById('passwordForm');
if (passwordForm) {
    const passwordInput = document.getElementById('accessPassword');
    const errorDiv = document.getElementById('passwordError');
    const santaTransition = document.getElementById('santaTransition');
    const passwordCard = document.getElementById('passwordScreen');

    passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const value = passwordInput.value.trim();
        errorDiv.style.display = 'none';

        if (value === SIGNUP_PASSWORD) {
            // Play subtle sleigh animation
            if (santaTransition) {
                santaTransition.classList.remove('fly'); // reset
                void santaTransition.offsetWidth;        // reflow
                santaTransition.classList.add('fly');
            }

            // After a short delay, reveal signup card
            setTimeout(() => {
                sessionStorage.setItem('authenticated', 'true');
                showSignupCard();
            }, 1200);
        } else {
            errorDiv.textContent = 'Incorrect password. Please try again.';
            errorDiv.style.display = 'block';
            passwordInput.value = '';

            if (passwordCard) {
                passwordCard.classList.add('shake');
                setTimeout(() => passwordCard.classList.remove('shake'), 500);
            }
        }
    });
}

// -------- Participant count --------
async function loadParticipantCount() {
    const el = document.getElementById('participantCount');
    if (!el) return;

    try {
        const res = await fetch('/.netlify/functions/getParticipants');
        const data = await res.json();
        const count = Array.isArray(data.participants) ? data.participants.length : 0;
        el.textContent = count;
    } catch (err) {
        el.textContent = '0';
    }
}

// -------- Signup form & progress bar --------
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    const formInputs = signupForm.querySelectorAll('input[required]');
    const progressContainer = document.getElementById('progressContainer');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    const messages = [
        "Let's get started! 🎅",
        "Nice start, keep going ✨",
        "Looking good so far 🎄",
        "Almost halfway there 🎁",
        "Great details, thank you ⭐",
        "You're nearly done 🎉",
        "Just a bit more 💫",
        "Last step, you're in! 🚀"
    ];

    function updateProgress() {
        let filled = 0;
        formInputs.forEach(input => {
            if (input.value.trim() !== '') filled++;
        });

        const pct = (filled / formInputs.length) * 100;
        if (progressFill) progressFill.style.width = `${pct}%`;

        if (progressText) {
            const idx = Math.min(
                Math.floor((filled / formInputs.length) * messages.length),
                messages.length - 1
            );
            progressText.textContent = messages[idx];
        }
    }

    formInputs.forEach(input => {
        input.addEventListener('focus', () => {
            if (progressContainer && progressContainer.style.display !== 'block') {
                progressContainer.style.display = 'block';
            }
        });

        input.addEventListener('blur', () => {
            if (input.value.trim() !== '') {
                const sparkle = input.parentElement.querySelector('.sparkle');
                if (sparkle) {
                    sparkle.style.display = 'inline';
                    setTimeout(() => { sparkle.style.display = 'none'; }, 500);
                }
            }
            updateProgress();
        });
    });

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const messageDiv = document.getElementById('message');
        const submitBtn = signupForm.querySelector('button[type="submit"]');

        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            preferences: {
                collectOrReceive: document.getElementById('q1').value.trim(),
                favoriteStore: document.getElementById('q2').value.trim(),
                hobby: document.getElementById('q3').value.trim(),
                wishlist: document.getElementById('q4').value.trim() || 'No specific items'
            }
        };

        try {
            const res = await fetch('/.netlify/functions/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                // Go to the Thank You page (which will show Mark Your Calendar + countdown)
                window.location.href = '/thankyou.html';
            } else {
                messageDiv.textContent = data.error || 'Something went wrong. Please try again.';
                messageDiv.className = 'message error';
                submitBtn.disabled = false;
                submitBtn.textContent = '🎄 Join the Secret Santa 🎄';
            }
        } catch (err) {
            messageDiv.textContent = 'Network error. Please try again.';
            messageDiv.className = 'message error';
            submitBtn.disabled = false;
            submitBtn.textContent = '🎄 Join the Secret Santa 🎄';
        }
    });
}
