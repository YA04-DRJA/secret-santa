const SIGNUP_PASSWORD = 'I90.SS2025'; // Keep the password consistent

document.addEventListener('DOMContentLoaded', () => {
    const passwordScreen = document.getElementById('passwordScreen');
    const signupCard = document.getElementById('signupCard');
    const passwordForm = document.getElementById('passwordForm');
    const passwordInput = document.getElementById('accessPassword');
    const passwordError = document.getElementById('passwordError');
    const santaTransition = document.getElementById('santaTransition');
    const signupForm = document.getElementById('signupForm');
    const messageEl = document.getElementById('message'); // For signup form messages

    // Helper function to display the signup card
    function showSignupCard() {
        if (!passwordScreen || !signupCard) return;
        passwordScreen.style.display = 'none';
        signupCard.style.display = 'block';
        loadParticipantCount(); // Load participant count when signup card is shown
    }

    // Check session storage for authentication status on page load
    if (sessionStorage.getItem('authenticated') === 'true') {
        showSignupCard();
    }

    // PASSWORD FORM HANDLING ----------------------------------------------
    if (passwordForm && passwordInput && passwordError) {
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent default form submission
            const enteredPassword = passwordInput.value.trim();

            passwordError.style.display = 'none'; // Hide any previous error messages
            passwordError.textContent = '';

            if (enteredPassword === SIGNUP_PASSWORD) {
                // If password is correct, trigger the Santa sleigh animation
                if (santaTransition) {
                    santaTransition.classList.remove('fly'); // Reset animation state
                    void santaTransition.offsetWidth;        // Trigger a reflow to restart animation
                    santaTransition.classList.add('fly');    // Add 'fly' class to start animation
                }

                sessionStorage.setItem('authenticated', 'true'); // Store authentication status
                // Delay showing the signup card to allow the sleigh animation to play through
                setTimeout(showSignupCard, 1000); // (~1 second for the sleigh to pass)

            } else {
                // If password is incorrect, display an error and shake the card
                passwordError.textContent = 'Incorrect password. Please try again.';
                passwordError.style.display = 'block';

                if (passwordScreen) {
                    passwordScreen.classList.add('shake'); // Apply shake animation to the card
                    setTimeout(() => passwordScreen.classList.remove('shake'), 400); // Remove after animation
                }

                passwordInput.value = ''; // Clear the password input
                passwordInput.focus();    // Keep focus for easy re-entry
            }
        });
    }

    // PARTICIPANT COUNT LOADING -------------------------------------------
    async function loadParticipantCount() {
        const el = document.getElementById('participantCount');
        if (!el) return;

        try {
            // Fetch participant count from Netlify function (ensure this is configured)
            const response = await fetch('/.netlify/functions/getParticipants');
            const data = await response.json();
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
            e.preventDefault(); // Prevent default form submission

            const submitBtn = signupForm.querySelector('.btn-primary');
            if (!submitBtn) return;

            // Gather form data
            const formData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                preferences: {
                    collectOrReceive: document.getElementById('q1').value.trim(),
                    favoriteStore: document.getElementById('q2').value.trim(),
                    hobby: document.getElementById('q3').value.trim(),
                    // Optional wishlist field, provide a default if left empty
                    wishlist:
                        document.getElementById('q4').value.trim() || 'No specific items'
                }
            };

            submitBtn.disabled = true; // Disable button to prevent multiple submissions
            submitBtn.textContent = 'Sending your wishes to Santa...'; // Provide feedback

            messageEl.style.display = 'none'; // Hide any previous messages
            messageEl.textContent = '';
            messageEl.className = 'message'; // Reset message styling

            try {
                // Submit form data to Netlify function (ensure this is configured)
                const response = await fetch('/.netlify/functions/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (response.ok) {
                    // On successful signup, redirect to the thank you page
                    window.location.href = '/thankyou.html';
                } else {
                    // Display error message from the server
                    messageEl.textContent =
                        data.error || 'Something went wrong. Please try again.';
                    messageEl.className = 'message message-error';
                    messageEl.style.display = 'block';
                    submitBtn.disabled = false; // Re-enable button
                    submitBtn.textContent = 'Join the Secret Santa Fun!'; // Reset button text
                }
            } catch (err) {
                // Display network or other fetch-related errors
                console.error('Signup fetch error:', err);
                messageEl.textContent =
                    'Network error. Please check your connection and try again.';
                messageEl.className = 'message message-error';
                messageEl.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Join the Secret Santa Fun!';
            }
        });
    }

    // COUNTDOWN TIMER (ONLY for thankyou.html) ----------------------------
    const countdownEl = document.getElementById('countdown');
    if (countdownEl) {
        const updateCountdown = () => {
            // Set the event date (December 19, 2025, 1:00 PM)
            const eventDate = new Date('December 19, 2025 13:00:00').getTime();
            const now = Date.now();
            const difference = eventDate - now;

            if (difference <= 0) {
                countdownEl.textContent = 'Today!'; // Event has passed or is today
                return;
            }

            // Calculate days, hours, and minutes remaining
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor(
                (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            const minutes = Math.floor(
                (difference % (1000 * 60 * 60)) / (1000 * 60)
            );

            countdownEl.textContent = `${days} days, ${hours} hours, ${minutes} minutes`;
        };

        updateCountdown(); // Call immediately on load
        // Update every minute (60,000 ms) for efficiency
        setInterval(updateCountdown, 60000); 
    }
});
