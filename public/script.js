const SIGNUP_PASSWORD = 'I90.SS2025';

document.addEventListener('DOMContentLoaded', () => {
    const passwordScreen = document.getElementById('passwordScreen');
    const signupCard = document.getElementById('signupCard');
    const passwordForm = document.getElementById('passwordForm');
    const passwordInput = document.getElementById('accessPassword');
    const passwordError = document.getElementById('passwordError');
    const santaTransition = document.getElementById('santaTransition');
    const signupForm = document.getElementById('signupForm');

    function showSignupCard() {
        if (!passwordScreen || !signupCard) return;
        passwordScreen.style.display = 'none';
        signupCard.style.display = 'block';
        loadParticipantCount();
    }

    // If already authenticated this session, skip password screen
    if (sessionStorage.getItem('authenticated') === 'true') {
        showSignupCard();
    }

    // PASSWORD HANDLING ---------------------------------------------------
    if (passwordForm && passwordInput && passwordError) {
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const value = passwordInput.value.trim();

            passwordError.style.display = 'none';
            passwordError.textContent = '';

            if (value === SIGNUP_PASSWORD) {
                // Play sleigh animation
                if (santaTransition) {
                    santaTransition.classList.remove('fly'); // reset
                    void santaTransition.offsetWidth;        // trigger reflow
                    santaTransition.classList.add('fly');
                }

                sessionStorage.setItem('authenticated', 'true');
                setTimeout(showSignupCard, 900);
            } else {
                passwordError.textContent = 'Incorrect password. Please try again.';
                passwordError.style.display = 'block';

                if (passwordScreen) {
                    passwordScreen.classList.add('shake');
                    setTimeout(() => passwordScreen.classList.remove('shake'), 400);
                }

                passwordInput.value = '';
                passwordInput.focus();
            }
        });
    }

    // PARTICIPANT COUNT ---------------------------------------------------
    async function loadParticipantCount() {
        const el = document.getElementById('participantCount');
        if (!el) return;

        try {
            const res = await fetch('/.netlify/functions/getParticipants');
            const data = await res.json();
            const count = Array.isArray(data.participants)
                ? data.participants.length
                : 0;
            el.textContent = count;
        } catch (err) {
            el.textContent = '0';
        }
    }

    // SIGNUP FORM ---------------------------------------------------------
    if (signupForm) {
        const messageEl = document.getElementById('message');

        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = signupForm.querySelector('button[type="submit"]');
            if (!submitBtn) return;

            const formData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                preferences: {
                    collectOrReceive: document.getElementById('q1').value.trim(),
                    favoriteStore: document.getElementById('q2').value.trim(),
                    hobby: document.getElementById('q3').value.trim(),
                    wishlist:
                        document.getElementById('q4').value.trim() || 'No specific items'
                }
            };

            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
            if (messageEl) {
                messageEl.style.display = 'none';
                messageEl.textContent = '';
                messageEl.className = 'message';
            }

            try {
                const res = await fetch('/.netlify/functions/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const data = await res.json();

                if (res.ok) {
                    window.location.href = '/thankyou.html';
                } else {
                    if (messageEl) {
                        messageEl.textContent =
                            data.error || 'Something went wrong. Please try again.';
                        messageEl.className = 'message message-error';
                        messageEl.style.display = 'block';
                    }
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Join the Secret Santa';
                }
            } catch (err) {
                if (messageEl) {
                    messageEl.textContent =
                        'Network error. Please check your connection and try again.';
                    messageEl.className = 'message message-error';
                    messageEl.style.display = 'block';
                }
                submitBtn.disabled = false;
                submitBtn.textContent = 'Join the Secret Santa';
            }
        });
    }

    // COUNTDOWN (used on thankyou.html only) ------------------------------
    const countdownEl = document.getElementById('countdown');
    if (countdownEl) {
        const updateCountdown = () => {
            const eventDate = new Date('December 19, 2025 13:00:00').getTime();
            const now = Date.now();
            const diff = eventDate - now;

            if (diff <= 0) {
                countdownEl.textContent = 'Today!';
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor(
                (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            const minutes = Math.floor(
                (diff % (1000 * 60 * 60)) / (1000 * 60)
            );

            countdownEl.textContent = `${days} days, ${hours} hours, ${minutes} minutes`;
        };

        updateCountdown();
        setInterval(updateCountdown, 60000);
    }
});
