let currentMember = null;
let earningsInterval = null;
let memberInvestments = [];
let memberCycles = [];

// Client login function - FIXED
function clientLogin() {
    console.log("Login function called");
    
    const phone = document.getElementById('clientPhone').value.trim();
    const password = document.getElementById('clientPassword').value.trim();
    
    console.log("Phone entered:", phone);
    console.log("Password entered:", password);
    
    if (!phone || !password) {
        alert("❌ Please enter both phone number and password");
        return;
    }
    
    // Get admin data from localStorage
    const adminData = JSON.parse(localStorage.getItem('shimogy_admin_data') || '{"members":[],"investments":[]}');
    const members = adminData.members || [];
    
    console.log("Total members found:", members.length);
    
    // Find member by phone
    const member = members.find(m => {
        const phoneMatch = m.phone === phone;
        const passwordMatch = (m.password === password) || (password === phone.slice(-4));
        return phoneMatch && passwordMatch;
    });
    
    if (member) {
        console.log("Member found:", member.name);
        currentMember = member;
        localStorage.setItem('shimogy_current_member', JSON.stringify(member));
        showClientDashboard();
        startLiveEarnings();
        addClientActivity("Logged into dashboard");
    } else {
        console.log("No member found with those credentials");
        alert("❌ Invalid credentials! Please check your phone number and password.\n\nDefault password is the last 4 digits of your phone number.\nContact admin if you don't have an account.");
    }
}

// Logout function
function logout() {
    if (earningsInterval) clearInterval(earningsInterval);
    localStorage.removeItem('shimogy_current_member');
    currentMember = null;
    document.getElementById('loginSection').style.display = 'flex';
    document.getElementById('dashboardContent').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'none';
    document.getElementById('clientPhone').value = '';
    document.getElementById('clientPassword').value = '';
}

// Show client dashboard
function showClientDashboard() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('dashboardContent').style.display = 'block';
    document.getElementById('logoutBtn').style.display = 'flex';
    document.getElementById('memberName').textContent = currentMember.name;
    document.getElementById('memberSince').textContent = currentMember.joined || new Date().toISOString().split('T')[0];
    loadClientData();
}

// Load client data from storage
function loadClientData() {
    const adminData = JSON.parse(localStorage.getItem('shimogy_admin_data') || '{"members":[],"investments":[],"cycles":[]}');
    const members = adminData.members || [];
    const investments = adminData.investments || [];
    const cycles = adminData.cycles || [];
    
    currentMember = members.find(m => m.id === currentMember.id);
    if (!currentMember) return;
    
    memberInvestments = investments.filter(inv => inv.memberId === currentMember.id);
    memberCycles = cycles.filter(cycle => cycle.members && cycle.members.includes(currentMember.id));
    
    updateClientStats();
    renderClientInvestments();
    renderClientCycles();
    renderClientActivity();
}

// Calculate daily earnings from active investments
function calculateDailyEarnings() {
    let totalDailyEarnings = 0;
    const now = new Date();
    
    memberInvestments.forEach(inv => {
        if (inv.status === 'active' && inv.expectedReturn && inv.amount) {
            const startDate = new Date(inv.startDate || inv.date);
            const daysElapsed = (now - startDate) / (1000 * 60 * 60 * 24);
            const totalDays = inv.name.includes("30") ? 30 : inv.name.includes("60") ? 60 : inv.name.includes("90") ? 90 : 45;
            
            if (daysElapsed < totalDays) {
                const dailyRate = (inv.expectedReturn - inv.amount) / totalDays;
                if (dailyRate > 0) {
                    totalDailyEarnings += dailyRate;
                }
            }
        }
    });
    
    return totalDailyEarnings;
}

// Update client statistics
function updateClientStats() {
    const totalInvested = memberInvestments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalExpectedReturns = memberInvestments.reduce((sum, inv) => sum + (inv.expectedReturn || inv.amount), 0);
    const roi = totalInvested > 0 ? ((totalExpectedReturns - totalInvested) / totalInvested * 100).toFixed(1) : 0;
    
    document.getElementById('totalInvested').textContent = `UGX ${totalInvested.toLocaleString()}`;
    document.getElementById('totalReturns').textContent = `UGX ${totalExpectedReturns.toLocaleString()}`;
    document.getElementById('roi').textContent = `${roi}%`;
    document.getElementById('activeCount').textContent = memberInvestments.filter(i => i.status === 'active').length;
    
    if (currentMember) {
        currentMember.balance = totalInvested;
        currentMember.totalInvested = totalInvested;
    }
}

// Start live earnings simulation
function startLiveEarnings() {
    if (earningsInterval) clearInterval(earningsInterval);
    
    let accumulatedEarnings = 0;
    let lastUpdate = Date.now();
    
    // Load saved earnings
    const savedEarnings = localStorage.getItem(`daily_earnings_${currentMember?.id}`);
    if (savedEarnings) {
        accumulatedEarnings = parseFloat(savedEarnings);
    }
    
    const updateEarnings = () => {
        if (!currentMember) return;
        
        const now = Date.now();
        const secondsPassed = (now - lastUpdate) / 1000;
        const dailyRate = calculateDailyEarnings();
        const increment = (dailyRate / 86400) * secondsPassed;
        
        if (increment > 0 && increment < 10000) {
            accumulatedEarnings += increment;
        }
        lastUpdate = now;
        
        // Store earnings
        localStorage.setItem(`daily_earnings_${currentMember.id}`, accumulatedEarnings.toString());
        
        // Update display
        const earningsElement = document.getElementById('liveEarnings');
        if (earningsElement) {
            earningsElement.textContent = `UGX ${Math.floor(accumulatedEarnings).toLocaleString()}`;
        }
        
        const lastUpdatedElement = document.getElementById('lastUpdated');
        if (lastUpdatedElement) {
            lastUpdatedElement.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
        }
        
        // Update admin data
        const adminData = JSON.parse(localStorage.getItem('shimogy_admin_data') || '{"members":[]}');
        const memberIndex = adminData.members.findIndex(m => m.id === currentMember.id);
        if (memberIndex !== -1) {
            adminData.members[memberIndex].dailyEarnings = Math.floor(accumulatedEarnings);
            adminData.members[memberIndex].balance = (adminData.members[memberIndex].totalInvested || 0) + Math.floor(accumulatedEarnings);
            localStorage.setItem('shimogy_admin_data', JSON.stringify(adminData));
        }
    };
    
    updateEarnings();
    earningsInterval = setInterval(updateEarnings, 1000);
}

// Render client investments
function renderClientInvestments() {
    const container = document.getElementById('investmentsList');
    
    if (!memberInvestments || memberInvestments.length === 0) {
        container.innerHTML = '<div style="text-align:center; opacity:0.6;">No active investments yet. <a href="investments.html">Start Investing</a></div>';
        return;
    }
    
    container.innerHTML = memberInvestments.map(inv => {
        const expectedReturn = inv.expectedReturn || inv.amount;
        const profit = expectedReturn - inv.amount;
        const profitPercent = inv.amount > 0 ? (profit / inv.amount * 100).toFixed(1) : 0;
        
        const startDate = new Date(inv.startDate || inv.date);
        const today = new Date();
        const daysElapsed = Math.max(0, Math.floor((today - startDate) / (1000 * 60 * 60 * 24)));
        const totalDays = inv.name.includes("30") ? 30 : inv.name.includes("60") ? 60 : inv.name.includes("90") ? 90 : 45;
        const daysProgress = Math.min(100, (daysElapsed / totalDays) * 100);
        
        const dailyRate = profit / totalDays;
        const earnedSoFar = dailyRate * daysElapsed;
        
        return `
            <div class="investment-item">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                    <div>
                        <strong>${inv.name}</strong><br>
                        <small>Invested: UGX ${inv.amount.toLocaleString()}</small>
                    </div>
                    <div>
                        <span class="return-badge">Target: UGX ${expectedReturn.toLocaleString()} (+${profitPercent}%)</span>
                    </div>
                </div>
                <div style="margin-top: 0.8rem;">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${daysProgress}%;"></div>
                    </div>
                    <small>${Math.floor(daysProgress)}% complete (Day ${daysElapsed}/${totalDays}) | Earned: UGX ${Math.max(0, Math.floor(earnedSoFar)).toLocaleString()}</small>
                </div>
            </div>
        `;
    }).join('');
}

// Render client cycles
function renderClientCycles() {
    const container = document.getElementById('cyclesList');
    
    if (!memberCycles || memberCycles.length === 0) {
        container.innerHTML = '<div style="text-align:center; opacity:0.6;">No cycles joined yet. <a href="cycles.html">Join a Cycle</a></div>';
        return;
    }
    
    container.innerHTML = memberCycles.map(cycle => `
        <div class="investment-item">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                <div>
                    <strong>${cycle.name}</strong><br>
                    <small>Contribution: UGX ${cycle.contribution.toLocaleString()}</small>
                </div>
                <div>
                    <span class="return-badge">Status: Active Member</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Render client activity
function renderClientActivity() {
    const container = document.getElementById('activityList');
    let activities = JSON.parse(localStorage.getItem(`shimogy_activity_${currentMember?.id}`) || '[]');
    
    if ((!activities || activities.length === 0) && currentMember) {
        activities = [
            { action: "Account created", date: currentMember.joined || new Date().toISOString().split('T')[0] },
            { action: `Initial deposit of UGX ${currentMember.totalInvested?.toLocaleString() || 0}`, date: currentMember.joined || new Date().toISOString().split('T')[0] }
        ];
        if (memberInvestments) {
            memberInvestments.forEach(inv => {
                activities.push({ action: `Invested in ${inv.name}`, date: inv.date });
            });
        }
        localStorage.setItem(`shimogy_activity_${currentMember.id}`, JSON.stringify(activities));
    }
    
    if (!activities || activities.length === 0) {
        container.innerHTML = '<div style="text-align:center; opacity:0.6;">No recent activity</div>';
        return;
    }
    
    container.innerHTML = activities.slice().reverse().slice(0, 10).map(act => `
        <div class="activity-item">
            <div><i class="fas fa-clock"></i> ${act.action}</div>
            <div><small>${act.date}</small></div>
        </div>
    `).join('');
}

// Add client activity
function addClientActivity(action) {
    if (!currentMember) return;
    const activities = JSON.parse(localStorage.getItem(`shimogy_activity_${currentMember.id}`) || '[]');
    activities.push({
        action: action,
        date: new Date().toLocaleString()
    });
    while (activities.length > 50) activities.shift();
    localStorage.setItem(`shimogy_activity_${currentMember.id}`, JSON.stringify(activities));
    renderClientActivity();
}

// Change client password
function changeClientPassword() {
    const newPassword = document.getElementById('newClientPassword').value;
    const confirmPassword = document.getElementById('confirmClientPassword').value;
    
    if (!newPassword) {
        alert("Please enter a new password");
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert("❌ Passwords do not match!");
        return;
    }
    
    if (newPassword.length < 4) {
        alert("❌ Password must be at least 4 characters long!");
        return;
    }
    
    const adminData = JSON.parse(localStorage.getItem('shimogy_admin_data') || '{"members":[]}');
    const memberIndex = adminData.members.findIndex(m => m.id === currentMember.id);
    
    if (memberIndex !== -1) {
        adminData.members[memberIndex].password = newPassword;
        localStorage.setItem('shimogy_admin_data', JSON.stringify(adminData));
        currentMember.password = newPassword;
        localStorage.setItem('shimogy_current_member', JSON.stringify(currentMember));
        
        alert("✅ Password changed successfully! Please login again with your new password.");
        addClientActivity("Changed password");
        
        setTimeout(() => logout(), 2000);
    } else {
        alert("❌ Error updating password. Please contact admin.");
    }
    
    document.getElementById('newClientPassword').value = '';
    document.getElementById('confirmClientPassword').value = '';
}

// Toggle password visibility
function toggleClientPassword() {
    const passwordField = document.getElementById('clientPassword');
    const toggleIcon = document.querySelector('.password-toggle i');
    
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordField.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

// Check for existing session on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log("Dashboard page loaded");
    
    const savedMember = localStorage.getItem('shimogy_current_member');
    if (savedMember) {
        try {
            currentMember = JSON.parse(savedMember);
            const adminData = JSON.parse(localStorage.getItem('shimogy_admin_data') || '{"members":[]}');
            const validMember = adminData.members.find(m => m.id === currentMember.id);
            if (validMember) {
                currentMember = validMember;
                showClientDashboard();
                startLiveEarnings();
            } else {
                localStorage.removeItem('shimogy_current_member');
            }
        } catch(e) {
            console.error("Error parsing saved member:", e);
            localStorage.removeItem('shimogy_current_member');
        }
    }
    
    // Make sure login section is visible if not logged in
    if (!currentMember) {
        document.getElementById('loginSection').style.display = 'flex';
        document.getElementById('dashboardContent').style.display = 'none';
    }
});

// Make functions global
window.clientLogin = clientLogin;
window.logout = logout;
window.toggleClientPassword = toggleClientPassword;
window.changeClientPassword = changeClientPassword;