const PASSWORD = 'I90.SS2025';

// Create snow that FALLS and responds to cursor - WORKING VERSION
function createInteractiveSnow() {
    const snowflakes = [];
    
    // Create 50 snowflakes
    for (let i = 0; i < 50; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.textContent = ['❄', '❅', '❆'][Math.floor(Math.random() * 3)];
        
        document.body.appendChild(snowflake);
        
        const snow = {
            element: snowflake,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight - window.innerHeight,
            speedY: Math.random() * 1 + 0.5,
            speedX: Math.random() * 0.5 - 0.25,
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
    
    // Animation loop
    function animate() {
        snowflakes.forEach(function(snow) {
            // Fall down
            snow.y += snow.speedY;
            snow.x += snow.speedX;
            
            // Reset when off screen
            if (snow.y > window.innerHeight) {
                snow.y = -20;
                snow.x = Math.random() * window.innerWidth;
            }
            
            if (snow.x > window.innerWidth) {
                snow.x = 0;
            } else if (snow.x < 0) {
                snow.x = window.innerWidth;
            }
            
            // Calculate distance from mouse
            const dx = snow.x - mouseX;
            const dy = snow.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            let finalX = snow.x;
            let finalY = snow.y;
            
            // Push away from cursor if close
            if (distance < 100) {
                const force = (100 - distance) / 100;
                const pushX = (dx / distance) * force * 50;
                const pushY = (dy / distance) * force * 50;
                
                finalX += pushX;
                finalY += pushY;
            }
            
            // Update position
            snow.element.style.left = finalX + 'px';
            snow.element.style.top = finalY + 'px';
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
