const SIGNUP_PASSWORD = 'I90.SS2025';

// Countdown Timer
function updateCountdown() {
    const eventDate = new Date('December 19, 2025 13:00:00').getTime();
    const now = new Date().getTime();
    const distance = eventDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

    document.getElementById('countdown').textContent = `${days} days, ${hours} hours, ${minutes} minutes!`;
}

updateCountdown();
setInterval(updateCountdown, 60000);

// Check if already authenticated
if (sessionStorage.getItem('authenticated') === 'true') {
    document.getElementById('passwordScreen').style.display = 'none';
    document.getElementById('signupCard').style.display = 'block';
    loadParticipantCount();
}

// Password form handling
document.getElementById('passwordForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('accessPassword').value;
    const errorDiv = document.getElementById('passwordError');
    const hohohoDiv = document.getElementById('hohoho');
    const passwordScreen = document.getElementById('passwordScreen');
    
    if (password === SIGNUP_PASSWORD) {
        // Shake the screen
        document.body.classList.add('shake');
        setTimeout(() => document.body.classList.remove('shake'), 500);
        
        // Show HO HO HO message
        hohohoDiv.classList.add('show');
        
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

// Load participant count
async function loadParticipantCount() {
    try {
        const response = await fetch('/.netlify/functions/getParticipants-buttons {
            display: flex;
            gap: 15px;
            margin-top: 20px;
            flex-wrap: wrap;
        }

        .btn-action {
            flex: 1;
            min-width: 200px;
            padding: 15px;
            border: none;
            border-radius: 10px;
            font-size: 1.1em;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-draw {
            background: linear-gradient(135deg, #C41E3A, #8B0000);
            color: white;
        }

        .btn-draw:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(196, 30, 58, 0.4);
        }

        .btn-export {
            background: linear-gradient(135deg, #165B33, #0d3d1f);
            color: white;
        }

        .btn-export:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(22, 91, 51, 0.4);
        }

        .logout-btn {
            background: linear-gradient(135deg, #666, #444);
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="snowflakes" aria-hidden="true">
        <div class="snowflake">❅</div>
        <div class="snowflake">❆</div>
        <div class="snowflake">❅</div>
        <div class="snowflake">❆</div>
        <div class="snowflake">❅</div>
        <div class="snowflake">❆</div>
        <div class="snowflake">❅</div>
        <div class="snowflake">❆</div>
        <div class="snowflake">❅</div>
        <div class="snowflake">❆</div>
    </div>

    <div class="tree-left"></div>
    <div class="tree-right"></div>

    <div class="countdown-timer" id="countdownTimer">
        🎅 Gift Exchange in <span id="countdown">calculating...</span>
    </div>

    <div class="container">
        <!-- Password Screen -->
        <div class="card" id="passwordScreen">
            <div class="header">
                <h1 style="color: #C41E3A;">🎅 Admin Panel</h1>
                <p class="subtitle">Enter admin password</p>
            </div>

            <form id="adminPasswordForm">
                <div class="form-group">
                    <label for="adminPassword">Admin Password</label>
                    <input type="password" id="adminPassword" placeholder="Enter admin password" required>
                </div>
                <button type="submit" class="btn-submit">🔓 Access Admin Panel</button>
            </form>

            <div id="passwordError" class="message error" style="display: none;"></div>
        </div>

        <!-- Admin Dashboard -->
        <div id="adminDashboard" style="display: none;">
            <div class="admin-header">
                <h1>🎄 I90 Deep Creek - Aecon Secret Santa 2025 🎄</h1>
                <p>Admin Control Panel</p>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number" id="totalParticipants">0</div>
                    <div class="stat-label">Total Participants</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="daysUntil">0</div>
                    <div class="stat-label">Days Until Event</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="daysUntilDeadline">0</div>
                    <div class="stat-label">Days Until Deadline</div>
                </div>
            </div>

            <div class="action-buttons">
                <button class="btn-action btn-draw" onclick="drawNames()">🎲 Draw Names & Send Emails</button>
                <button class="btn-action btn-export" onclick="exportData()">📥 Export Participant List</button>
            </div>

            <div class="participant-list">
                <h2 style="color: #C41E3A; margin-bottom: 20px;">👥 Registered Participants</h2>
                <div id="participantsList">Loading...</div>
            </div>

            <button class="logout-btn" onclick="logout()">🚪 Logout</button>
        </div>
    </div>

    <script>
        const ADMIN_PASSWORD = 'Aecon.Christmas2025';

        // Countdown Timer
        function updateCountdown() {
            const eventDate = new Date('December 19, 2025 13:00:00').getTime();
            const now = new Date().getTime();
            const distance = eventDate - now;

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

            document.getElementById('countdown').textContent = `${days} days, ${hours} hours, ${minutes} minutes!`;
            document.getElementById('daysUntil').textContent = days;

            // Days until deadline (Dec 5)
            const deadlineDate = new Date('December 5, 2025 23:59:59').getTime();
            const deadlineDays = Math.floor((deadlineDate - now) / (1000 * 60 * 60 * 24));
            document.getElementById('daysUntilDeadline').textContent = deadlineDays > 0 ? deadlineDays : 0;
        }

        updateCountdown();
        setInterval(updateCountdown, 60000);

        // Check if already authenticated
        if (sessionStorage.getItem('adminAuth') === 'true') {
            document.getElementById('passwordScreen').style.display = 'none';
            document.getElementById('adminDashboard').style.display = 'block';
            loadParticipants();
        }

        // Admin password form
        document.getElementById('adminPasswordForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const password = document.getElementById('adminPassword').value;
            const errorDiv = document.getElementById('passwordError');

            if (password === ADMIN_PASSWORD) {
                sessionStorage.setItem('adminAuth', 'true');
                document.getElementById('passwordScreen').style.display = 'none';
                document.getElementById('adminDashboard').style.display = 'block';
                loadParticipants();
            } else {
                errorDiv.textContent = '❌ Incorrect admin password.';
                errorDiv.style.display = 'block';
                document.getElementById('adminPassword').value = '';
            }
        });

        // Load participants
        async function loadParticipants() {
            try {
                const response = await fetch('/.netlify/functions/getParticipants');
                const data = await response.json();
                const participants = data.participants || [];

                document.getElementById('totalParticipants').textContent = participants.length;

                const listDiv = document.getElementById('participantsList');
                if (participants.length === 0) {
                    listDiv.innerHTML = '<p style="text-align: center; color: #666;">No participants yet.</p>';
                } else {
                    listDiv.innerHTML = participants.map(p => `
                        <div class="participant-card">
                            <div class="participant-name">${p.name}</div>
                            <div class="participant-email">📧 ${p.email}</div>
                            <div class="preferences">
                                <div class="preference-item">
                                    <span class="preference-label">Loves to receive:</span> ${p.preferences.collectOrReceive}
                                </div>
                                <div class="preference-item">
                                    <span class="preference-label">Favorite store:</span> ${p.preferences.favoriteStore}
                                </div>
                                <div class="preference-item">
                                    <span class="preference-label">Hobbies:</span> ${p.preferences.hobby}
                                </div>
                                <div class="preference-item">
                                    <span class="preference-label">Wishlist:</span> ${p.preferences.wishlist}
                                </div>
                            </div>
                        </div>
                    `).join('');
                }
            } catch (error) {
                document.getElementById('participantsList').innerHTML = '<p style="color: red;">Error loading participants.</p>';
            }
        }

        // Draw names
        async function drawNames() {
            if (!confirm('Are you sure you want to draw names and send emails to all participants?')) {
                return;
            }

            try {
                const response = await fetch('/.netlify/functions/drawNames', {
                    method: 'POST'
                });
                const data = await response.json();

                if (response.ok) {
                    alert('✅ Names drawn and emails sent successfully!');
                } else {
                    alert('❌ Error: ' + (data.error || 'Something went wrong'));
                }
            } catch (error) {
                alert('❌ Network error. Please try again.');
            }
        }

        // Export data
        function exportData() {
            fetch('/.netlify/functions/getParticipants')
                .then(res => res.json())
                .then(data => {
                    const participants = data.participants || [];
                    let csv = 'Name,Email,Loves to Receive,Favorite Store,Hobbies,Wishlist\n';
                    
                    participants.forEach(p => {
                        csv += `"${p.name}","${p.email}","${p.preferences.collectOrReceive}","${p.preferences.favoriteStore}","${p.preferences.hobby}","${p.preferences.wishlist}"\n`;
                    });

                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'secret-santa-participants.csv';
                    a.click();
                });
        }

        // Logout
        function logout() {
            sessionStorage.removeItem('adminAuth');
            location.reload();
        }
    </script>
</body>
</html>
