const PASSWORD = 'I90.SS2025';

// Create snow that FALLS and responds to cursor
function createInteractiveSnow() {
    const container = document.getElementById('snowContainer');
    const snowflakes = [];
    
    // Create 40 snowflakes
    for (let i = 0; i < 40; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.textContent = ['❄', '❅', '❆'][Math.floor(Math.random() * 3)];
        
        const startX = Math.random() * 100;
        snowflake.style.left = startX + '%';
        snowflake.style.top = '-20px';
        snowflake.style.fontSize = (Math.random() * 10 + 15) + 'px';
        snowflake.style.animationDuration = (Math.random() * 5 + 8) + 's';
        snowflake.style.animationDelay = (Math.random() * 5) + 's';
        
        container.appendChild(snowflake);
        
        snowflakes.push({
            element: snowflake,
            startX: startX,
            currentPushX: 0,
            currentPushY: 0
        });
    }
    
    // Track mouse movement and push snow away
    let mouseX = 50;
    let mouseY = 50;
    
    document.addEventListener('mousemove', function(e) {
        mouseX = (e.clientX / window.innerWidth) * 100;
        mouseY = (e.clientY / window.innerHeight) * 100;
    });
    
    // Update snow positions continuously
    function updateSnow() {
        snowflakes.forEach(function(snow) {
            const rect = snow.element.getBoundingClientRect();
            const snowX = (rect.left + rect.width / 2) / window.innerWidth * 100;
            const snowY = (rect.top + rect.height / 2) / window.innerHeight * 100;
            
            const dx = snowX - mouseX;
            const dy = snowY - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If cursor is within 15% distance, push snow away
            if (distance < 15) {
                const force = (15 - distance) / 15;
                snow.currentPushX = dx * force * 80;
                snow.currentPushY = dy * force * 80;
            } else {
                // Gradually return to normal position
                snow.currentPushX *= 0.95;
                snow.currentPushY *= 0.95;
            }
            
            snow.element.style.transform = `translate(${snow.currentPushX}px, ${snow.currentPushY}px)`;
        });
        
        requestAnimationFrame(updateSnow);
    }
    
    updateSnow();
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize interactive snow
    createInteractiveSnow();
    
    const passwordCard = document.getElementById('passwordCard');
    const signupCard = document.getElementById('signupCard');
    const passwordForm = document.getElementById('passwordForm');
    const passwordInput = document.getElementById('passwordInput');
    const passwordError = document.getElementById('passwordError');
    const signupForm = document.getElementById('signupForm');
    const signupError = document.getElementById('signupError');

    // Check if already logged in
    if (sessionStorage.getItem('authenticated') === 'true') {
        showSignup();
    }

    // Password form - NO ANIMATION, INSTANT SWITCH
    passwordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (passwordInput.value === PASSWORD) {
            sessionStorage.setItem('authenticated', 'true');
            showSignup();
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
