const PASSWORD = 'I90.SS2025';

// Create CONTINUOUS interactive snow - always falling!
function createInteractiveSnow() {
    const snowflakes = [];
    const maxSnowflakes = 80;
    
    // Create ALL snowflakes immediately at random positions
    for (let i = 0; i < maxSnowflakes; i++) {
        createSingleSnowflake(snowflakes, true);
    }
    
    let mouseX = -1000;
    let mouseY = -1000;
    
    // Track mouse position
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Animation loop - REALISTIC physics
    function animate() {
        snowflakes.forEach(function(snow) {
            // Natural falling - gentle gravity
            snow.velocityY += 0.02;
            
            // Gentle side-to-side drift
            snow.x += Math.sin(snow.y * 0.01 + snow.offset) * 0.3;
            
            // Calculate distance from mouse
            const dx = snow.x - mouseX;
            const dy = snow.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // SMOOTH wind push - like real wind
            if (distance < 120 && distance > 0) {
                const force = (120 - distance) / 120;
                const pushStrength = force * force * 8;
                
                snow.velocityX += (dx / distance) * pushStrength * 0.3;
                snow.velocityY += (dy / distance) * pushStrength * 0.2;
            }
            
            // Smooth friction - gradual slowdown
            snow.velocityX *= 0.92;
            snow.velocityY *= 0.98;
            
            // Keep vertical speed reasonable
            if (snow.velocityY > 3) snow.velocityY = 3;
            if (snow.velocityY < 0.3) snow.velocityY = 0.3;
            
            // Update position
            snow.x += snow.velocityX;
            snow.y += snow.velocityY;
            
            // Wrap around sides smoothly
            if (snow.x < -20) {
                snow.x = window.innerWidth + 20;
            }
            if (snow.x > window.innerWidth + 20) {
                snow.x = -20;
            }
            
            // Reset when off bottom - IMMEDIATELY create new at top
            if (snow.y > window.innerHeight + 20) {
                resetSnowflake(snow);
            }
            
            // If pushed too far up, reset gently
            if (snow.y < -100) {
                resetSnowflake(snow);
            }
            
            // Update DOM position
            snow.element.style.left = snow.x + 'px';
            snow.element.style.top = snow.y + 'px';
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Create a single snowflake
function createSingleSnowflake(snowflakes, randomStart) {
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    snowflake.textContent = ['❄', '❅', '❆'][Math.floor(Math.random() * 3)];
    
    document.body.appendChild(snowflake);
    
    const snow = {
        element: snowflake,
        x: Math.random() * window.innerWidth,
        // If randomStart, place anywhere on screen, otherwise start at top
        y: randomStart ? Math.random() * window.innerHeight : (-20 - Math.random() * 100),
        velocityX: 0,
        velocityY: Math.random() * 0.5 + 0.5,
        size: Math.random() * 10 + 15,
        offset: Math.random() * 1000
    };
    
    snowflake.style.fontSize = snow.size + 'px';
    snowflake.style.opacity = Math.random() * 0.4 + 0.6;
    snowflakes.push(snow);
}

// Reset snowflake to top
function resetSnowflake(snow) {
    snow.x = Math.random() * window.innerWidth;
    snow.y = -20 - Math.random() * 50;
    snow.velocityX = 0;
    snow.velocityY = Math.random() * 0.5 + 0.5;
    snow.offset = Math.random() * 1000;
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

    // Password form - INSTANT SWITCH
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
                shirtSize: document.getElementById('shirtSize').value || 'Not provided',
                shoeSize: document.getElementById('shoeSize').value || 'Not provided',
                wishlist: document.getElementById('q4').value || 'No specific items'
            }
        };
        
        try {
            const response = await fetch('/.netlify/functions/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (response.ok && result.message) {
                // Success! Redirect to thank you page
                window.location.href = '/thankyou.html';
            } else {
                // Show error message
                signupError.textContent = result.error || 'Error! Try again.';
                signupError.style.display = 'block';
                btn.disabled = false;
                btn.textContent = '🎄 JOIN THE CHRISTMAS FUN! 🎄';
            }
        } catch (error) {
            signupError.textContent = 'Network error! Try again.';
            signupError.style.display = 'block';
            btn.disabled = false;
            btn.textContent = '🎄 JOIN THE CHRISTMAS FUN! 🎄';
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
