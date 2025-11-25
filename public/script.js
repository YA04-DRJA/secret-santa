const SIGNUP_PASSWORD = 'I90.SS2025';

document.addEventListener('DOMContentLoaded', () => {
    const passwordScreen = document.getElementById('passwordScreen');
    const signupCard = document.getElementById('signupCard');
    const passwordForm = document.getElementById('passwordForm');
    const passwordInput = document.getElementById('accessPassword');
    const passwordError = document.getElementById('passwordError');
    const santaTransition = document.getElementById('santaTransition');
    const signupForm = document.getElementById('signupForm');
    const messageEl = document.getElementById('message'); // For signup form messages

    // Helper to show the signup card and load participant count
    function showSignupCard() {
        if (!passwordScreen || !signupCard) return;
        passwordScreen.style.display = 'none';
        signupCard.style.display = 'block';
        loadParticipantCount();
    }

    // Check if already authenticated via session storage
    if (sessionStorage.getItem('authenticated') === 'true') {
        showSignupCard();
    }

    // PASSWORD HANDLING ---------------------------------------------------
    if (passwordForm && passwordInput && passwordError) {
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const value = passwordInput.value.trim();

            passwordError.style.display = 'none'; // Hide any previous error
            passwordError.textContent = '';

            if (value === SIGNUP_PASSWORD) {
                // Trigger subtle sleigh animation
                if (santaTransition) {
                    santaTransition.classList.remove('fly'); // Reset animation state
                    void santaTransition.offsetWidth;        // Trigger reflow to restart animation
                    santaTransition.classList.add('fly');
                }

                sessionStorage.setItem('authenticated', 'true');
                // Delay showing signup card to allow sleigh animation to play
                setTimeout(showSignupCard, 1000); // (~1s for sleigh to pass)

            } else {
                passwordError.textContent = 'Incorrect password. Please try again.';
                passwordError.style.display = 'block';

                // Add shake animation to the password card
                if (passwordScreen) {
                    passwordScreen.classList.add('shake');
                    setTimeout(() => passwordScreen.classList.remove('shake'), 400);
                }

                passwordInput.value = ''; // Clear input
                passwordInput.focus(); // Keep focus for easy re-entry
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
            console.error('Failed to load participant count:', err);
            el.textContent = '0'; // Default to 0 on error
        }
    }

    // SIGNUP FORM HANDLING ------------------------------------------------
    if (signupForm && messageEl) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = signupForm.querySelector('button[type="submit"]');
            if (!submitBtn) return;

            // Prepare form data
            const formData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                preferences: {
                    collectOrReceive: document.getElementById('q1').value.trim(),
                    favoriteStore: document.getElementById('q2').value.trim(),
                    hobby: document.getElementById('q3').value.trim(),
                    // Optional field, provide a default if empty
                    wishlist:
                        document.getElementById('q4').value.trim() || 'No specific items'
                }
            };

            submitBtn.disabled = true; // Disable button to prevent multiple submissions
            submitBtn.textContent = 'Submitting...'; // Provide feedback
            
            messageEl.style.display = 'none'; // Hide previous messages
            messageEl.textContent = '';
            messageEl.className = 'message'; // Reset message class

            try {
                const res = await fetch('/.netlify/functions/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const data = await res.json();

                if (res.ok) {
                    // Redirect to the thank you page on success
                    window.location.href = '/thankyou.html';
                } else {
                    // Display error from server
                    messageEl.textContent =
                        data.error || 'Something went wrong. Please try again.';
                    messageEl.className = 'message message-error';
                    messageEl.style.display = 'block';
                    submitBtn.disabled = false; // Re-enable button
                    submitBtn.textContent = 'Join the Secret Santa'; // Reset button text
                }
            } catch (err) {
                // Display network/fetch error
                console.error('Signup fetch error:', err);
                messageEl.textContent =
                    'Network error. Please check your connection and try again.';
                messageEl.className = 'message message-error';
                messageEl.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Join the Secret Santa';
            }
        });
    }

    // COUNTDOWN (ONLY for thankyou.html) ----------------------------------
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
        // Update every minute (60,000 ms) for efficiency
        setInterval(updateCountdown, 60000); 
    }
});
