const PASSWORD = 'I90.SS2025';

// Create GAME-LIKE interactive snow - push them away!
function createInteractiveSnow() {
    const snowflakes = [];
    
    // Create 60 snowflakes
    for (let i = 0; i < 60; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.textContent = ['❄', '❅', '❆'][Math.floor(Math.random() * 3)];
        
        document.body.appendChild(snowflake);
        
        const snow = {
            element: snowflake,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight - window.innerHeight,
            velocityX: 0,
            velocityY: Math.random() * 1 + 0.5,
            size: Math.random() * 10 + 15
        };
        
        snowflake.style.fontSize = snow.size + 'px';
        snowflakes.push(snow);
    }
    
    let mouseX = -1000;
    let mouseY = -1000;
    
    // Track mouse position
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Animation loop - GAME STYLE
    function animate() {
        snowflakes.forEach(function(snow) {
            // Apply gravity (falling)
            snow.velocityY += 0.05;
            
            // Calculate distance from mouse
            const dx = snow.x - mouseX;
            const dy = snow.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // PUSH AWAY from cursor like WIND - stronger force!
            if (distance < 150 && distance > 0) {
                const force = (150 - distance) / 150;
                const pushStrength = force * 15; // Strong push!
                
                // Push in direction away from mouse
                snow.velocityX += (dx / distance) * pushStrength;
                snow.velocityY += (dy / distance) * pushStrength;
            }
            
            // Apply friction to slow down over time
            snow.velocityX *= 0.95;
            snow.velocityY *= 0.98;
            
            // Update position
            snow.x += snow.velocityX;
            snow.y += snow.velocityY;
            
            // Bounce off edges (so they don't disappear forever)
            if (snow.x < 0) {
                snow.x = 0;
                snow.velocityX *= -0.5;
            }
            if (snow.x > window.innerWidth) {
                snow.x = window.innerWidth;
                snow.velocityX *= -0.5;
            }
            
            // Reset when off bottom of screen - KEEP FALLING FROM TOP
            if (snow.y > window.innerHeight + 50) {
                snow.y = -20;
                snow.x = Math.random() * window.innerWidth;
                snow.velocityX = 0;
                snow.velocityY = Math.random() * 1 + 0.5;
            }
            
            // If pushed off top, bring back from top
            if (snow.y < -50) {
                snow.y = -20;
                snow.velocityY = Math.random() * 1 + 0.5;
            }
            
            // Update DOM position
            snow.element.style.left = snow.x + 'px';
            snow.element.style.top = snow.y + 'px';
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
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
