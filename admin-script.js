/* ============================================
   SHIMOGY ADMIN DASHBOARD - MAIN SCRIPT
   With Password Authentication (shimogy123)
   ============================================ */

// Admin credentials
let adminCredentials = {
    username: "admin@shimogy.com",
    password: "shimogy123"
};

// Initialize data store
let adminData = {
    members: [],
    investments: [],
    cycles: [],
    investmentSlots: {},
    groups: [],
    notifications: [],
    pendingRequests: []
};

// Load admin credentials from localStorage
function loadAdminCredentials() {
    const saved = localStorage.getItem('shimogy_admin_credentials');
    if (saved) {
        adminCredentials = JSON.parse(saved);
    } else {
        localStorage.setItem('shimogy_admin_credentials', JSON.stringify(adminCredentials));
    }
}

// Save admin credentials
function saveAdminCredentials() {
    localStorage.setItem('shimogy_admin_credentials', JSON.stringify(adminCredentials));
}

// Login function
function login() {
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value.trim();
    
    if (username === adminCredentials.username && password === adminCredentials.password) {
        localStorage.setItem('shimogy_admin_logged_in', 'true');
        showDashboard();
        addNotification("Admin logged in successfully");
    } else {
        alert("❌ Invalid credentials! Please check your username and password.");
    }
}

// Logout function
function logout() {
    localStorage.removeItem('shimogy_admin_logged_in');
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('dashboardContent').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'none';
    document.getElementById('adminUsername').value = adminCredentials.username;
    document.getElementById('adminPassword').value = '';
}

// Show dashboard after login
function showDashboard() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('dashboardContent').style.display = 'block';
    document.getElementById('logoutBtn').style.display = 'flex';
    loadAdminData();
    updateStats();
    renderMembers();
    renderInvestments();
    renderCycles();
    renderSlots();
    renderGroups();
    renderNotifications();
    populateSelectors();
    
    // Set current username in settings
    const currentUsernameField = document.getElementById('currentUsername');
    if (currentUsernameField) {
        currentUsernameField.value = adminCredentials.username;
    }
}

// Update admin credentials
function updateAdminCredentials() {
    const currentPassword = document.getElementById('verifyCurrentPassword').value;
    const newUsername = document.getElementById('newUsername').value.trim();
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    // Verify current password
    if (currentPassword !== adminCredentials.password) {
        alert("❌ Current password is incorrect!");
        return;
    }
    
    // Update username if provided
    if (newUsername) {
        adminCredentials.username = newUsername;
    }
    
    // Update password if provided
    if (newPassword) {
        if (newPassword !== confirmPassword) {
            alert("❌ New passwords do not match!");
            return;
        }
        if (newPassword.length < 6) {
            alert("❌ Password must be at least 6 characters long!");
            return;
        }
        adminCredentials.password = newPassword;
    }
    
    saveAdminCredentials();
    alert("✅ Admin credentials updated successfully! Please login again.");
    
    // Clear form
    document.getElementById('verifyCurrentPassword').value = '';
    document.getElementById('newUsername').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';
    
    // Logout and require re-login
    setTimeout(() => {
        logout();
    }, 2000);
}

// Show change password modal
function showChangePasswordModal() {
    document.getElementById('modalCurrentPassword').value = '';
    document.getElementById('modalNewPassword').value = '';
    document.getElementById('modalConfirmPassword').value = '';
    document.getElementById('changePasswordModal').classList.add('active');
}

// Close password modal
function closePasswordModal() {
    document.getElementById('changePasswordModal').classList.remove('active');
}

// Update password from modal
function updatePasswordFromModal() {
    const currentPassword = document.getElementById('modalCurrentPassword').value;
    const newPassword = document.getElementById('modalNewPassword').value;
    const confirmPassword = document.getElementById('modalConfirmPassword').value;
    
    if (currentPassword !== adminCredentials.password) {
        alert("❌ Current password is incorrect!");
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert("❌ New passwords do not match!");
        return;
    }
    
    if (newPassword.length < 6) {
        alert("❌ Password must be at least 6 characters long!");
        return;
    }
    
    adminCredentials.password = newPassword;
    saveAdminCredentials();
    alert("✅ Password changed successfully! Please login again.");
    closePasswordModal();
    
    setTimeout(() => {
        logout();
    }, 2000);
}

// Toggle password visibility
function togglePassword() {
    const passwordField = document.getElementById('adminPassword');
    const icon = document.querySelector('.toggle-password i');
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordField.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Load data from localStorage
function loadAdminData() {
    const saved = localStorage.getItem('shimogy_admin_data');
    if (saved) {
        adminData = JSON.parse(saved);
    } else {
        // Initialize with demo data
        adminData = {
            members: [
                { id: 1, name: "John Mukasa", phone: "0752259416", email: "john@example.com", status: "active", joined: "2026-01-15", group: "Group A", balance: 500000, totalInvested: 500000 },
                { id: 2, name: "Sarah Namukasa", phone: "0746788042", email: "sarah@example.com", status: "active", joined: "2026-02-01", group: "Group B", balance: 750000, totalInvested: 750000 }
            ],
            investments: [
                { id: 1, memberId: 1, memberName: "John Mukasa", name: "MEN'S HAIR SALON", amount: 200000, expectedReturn: 250000, status: "active", date: "2026-03-01" },
                { id: 2, memberId: 2, memberName: "Sarah Namukasa", name: "POULTRY FARM", amount: 500000, expectedReturn: 700000, status: "active", date: "2026-03-05" }
            ],
            cycles: [
                { id: 1, name: "GROUP 1", contribution: 3000, members: 5, maxMembers: 10 },
                { id: 2, name: "GROUP 2", contribution: 5000, members: 8, maxMembers: 10 },
                { id: 3, name: "GROUP 3", contribution: 10000, members: 12, maxMembers: 20 },
                { id: 4, name: "GROUP 4", contribution: 50000, members: 6, maxMembers: 15 }
            ],
            investmentSlots: {
                "MEN'S HAIR SALON": 5,
                "POULTRY FARM": 3,
                "RESTAURANT": 4,
                "MODERN STALL": 8,
                "CLASSIC BOUTIQUE": 6,
                "GROCERY STORE": 2,
                "TRANSPORT BUSINESS": 1,
                "MODERN CONSTRUCTION": 2
            },
            groups: [
                { id: 1, name: "Group A", members: [], maxSize: 20 },
                { id: 2, name: "Group B", members: [], maxSize: 15 }
            ],
            notifications: [
                { id: 1, message: "Welcome to Admin Dashboard", time: new Date().toLocaleString() }
            ],
            pendingRequests: []
        };
        saveAdminData();
    }
}

// Save admin data to localStorage
function saveAdminData() {
    localStorage.setItem('shimogy_admin_data', JSON.stringify(adminData));
    localStorage.setItem('shimogy_members', JSON.stringify(adminData.members));
    localStorage.setItem('shimogy_investments', JSON.stringify(adminData.investments));
}

// Update statistics
function updateStats() {
    document.getElementById('totalMembers').textContent = adminData.members.length;
    document.getElementById('activeInvestments').textContent = adminData.investments.filter(i => i.status === 'active').length;
    const totalInvested = adminData.investments.reduce((sum, inv) => sum + inv.amount, 0);
    document.getElementById('totalInvested').textContent = `UGX ${totalInvested.toLocaleString()}`;
    document.getElementById('pendingRequests').textContent = adminData.pendingRequests.length;
}

// Render members table
function renderMembers() {
    const tbody = document.getElementById('membersTableBody');
    tbody.innerHTML = adminData.members.map(member => `
        <tr>
            <td>${member.id}</td>
            <td>${member.name}</td>
            <td>${member.phone}</td>
            <td><span class="status-badge status-active">${member.status}</span></td>
            <td>${member.joined}</td>
            <td>
                <button class="btn-sm btn-gold" onclick="viewMember(${member.id})">View</button>
                <button class="btn-sm btn-danger" onclick="deleteMember(${member.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Render investments table
function renderInvestments() {
    const tbody = document.getElementById('investmentsTableBody');
    tbody.innerHTML = adminData.investments.map(inv => `
        <tr>
            <td>${inv.memberName}</td>
            <td>${inv.name}</td>
            <td>UGX ${inv.amount.toLocaleString()}</td>
            <td>UGX ${inv.expectedReturn.toLocaleString()}</td>
            <td><span class="status-badge status-active">${inv.status}</span></td>
            <td>${inv.date}</td>
        </tr>
    `).join('');
}

// Render cycles
function renderCycles() {
    const container = document.getElementById('cyclesList');
    container.innerHTML = adminData.cycles.map(cycle => `
        <div class="slot-item">
            <div><strong>${cycle.name}</strong> - UGX ${cycle.contribution.toLocaleString()} - ${cycle.members}/${cycle.maxMembers} members</div>
            <div>
                <button class="btn-sm btn-gold" onclick="editCycle(${cycle.id})">Edit</button>
                <button class="btn-sm btn-danger" onclick="deleteCycle(${cycle.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Render slots
function renderSlots() {
    const container = document.getElementById('slotsList');
    container.innerHTML = Object.entries(adminData.investmentSlots).map(([name, slots]) => `
        <div class="slot-item">
            <div><strong>${name}</strong> - ${slots} slots available</div>
            <div>
                <button class="btn-sm btn-gold" onclick="editSlots('${name}')">Edit</button>
            </div>
        </div>
    `).join('');
}

// Render groups
function renderGroups() {
    const container = document.getElementById('groupsList');
    container.innerHTML = adminData.groups.map(group => `
        <div class="group-item">
            <div><strong>${group.name}</strong> - ${group.members.length}/${group.maxSize} members</div>
            <div>
                <button class="btn-sm btn-gold" onclick="viewGroup(${group.id})">View</button>
                <button class="btn-sm btn-danger" onclick="deleteGroup(${group.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Render notifications
function renderNotifications() {
    const container = document.getElementById('notificationsList');
    if (adminData.notifications.length === 0) {
        container.innerHTML = '<div style="text-align:center; opacity:0.6;">No new notifications</div>';
        return;
    }
    container.innerHTML = adminData.notifications.slice().reverse().map(notif => `
        <div class="notification-item">
            <div><i class="fas fa-bell"></i> ${notif.message}</div>
            <div class="notification-time">${notif.time}</div>
        </div>
    `).join('');
}

// Add notification
function addNotification(message) {
    adminData.notifications.push({
        id: Date.now(),
        message: message,
        time: new Date().toLocaleString()
    });
    saveAdminData();
    renderNotifications();
}

// Refresh data
function refreshData() {
    loadAdminData();
    updateStats();
    renderMembers();
    renderInvestments();
    renderCycles();
    renderSlots();
    renderGroups();
    renderNotifications();
    addNotification("Admin manually refreshed all data");
    alert("Data refreshed successfully!");
}

// Export data
function exportData() {
    const exportData = {
        members: adminData.members,
        investments: adminData.investments,
        cycles: adminData.cycles,
        totalInvested: adminData.investments.reduce((sum, inv) => sum + inv.amount, 0),
        exportDate: new Date().toLocaleString()
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shimogy_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addNotification("Report exported successfully");
}

// Clear all notifications
function clearAllNotifications() {
    adminData.notifications = [];
    saveAdminData();
    renderNotifications();
    addNotification("All notifications cleared");
}

// Add cycle
function addCycle() {
    const name = document.getElementById('newCycleGroupName').value;
    const contribution = parseInt(document.getElementById('newCycleContribution').value);
    if (!name || !contribution) {
        alert("Please fill all fields");
        return;
    }
    adminData.cycles.push({
        id: Date.now(),
        name: name,
        contribution: contribution,
        members: 0,
        maxMembers: 10
    });
    saveAdminData();
    renderCycles();
    addNotification(`New cycle "${name}" created with contribution UGX ${contribution}`);
    document.getElementById('newCycleGroupName').value = '';
    document.getElementById('newCycleContribution').value = '';
}

// Delete cycle
function deleteCycle(id) {
    if (confirm("Are you sure you want to delete this cycle?")) {
        adminData.cycles = adminData.cycles.filter(c => c.id !== id);
        saveAdminData();
        renderCycles();
        addNotification("Cycle deleted");
    }
}

// Edit cycle
function editCycle(id) {
    const cycle = adminData.cycles.find(c => c.id === id);
    const newName = prompt("Enter new cycle name:", cycle.name);
    const newContribution = prompt("Enter new contribution amount:", cycle.contribution);
    if (newName) cycle.name = newName;
    if (newContribution) cycle.contribution = parseInt(newContribution);
    saveAdminData();
    renderCycles();
    addNotification(`Cycle "${cycle.name}" updated`);
}

// Add slots
function addSlots() {
    const investmentName = document.getElementById('slotInvestmentSelect').value;
    const slotsToAdd = parseInt(document.getElementById('slotCount').value);
    if (!investmentName || !slotsToAdd) {
        alert("Please select investment and enter number of slots");
        return;
    }
    adminData.investmentSlots[investmentName] = (adminData.investmentSlots[investmentName] || 0) + slotsToAdd;
    saveAdminData();
    renderSlots();
    addNotification(`Added ${slotsToAdd} slots to ${investmentName}`);
    document.getElementById('slotCount').value = '';
}

// Edit slots
function editSlots(investmentName) {
    const newSlots = prompt(`Enter new slot count for ${investmentName}:`, adminData.investmentSlots[investmentName]);
    if (newSlots !== null) {
        adminData.investmentSlots[investmentName] = parseInt(newSlots);
        saveAdminData();
        renderSlots();
        addNotification(`Updated slots for ${investmentName} to ${newSlots}`);
    }
}

// Create group
function createGroup() {
    const name = document.getElementById('newGroupName').value;
    const maxSize = parseInt(document.getElementById('newGroupSize').value);
    if (!name || !maxSize) {
        alert("Please fill all fields");
        return;
    }
    adminData.groups.push({
        id: Date.now(),
        name: name,
        members: [],
        maxSize: maxSize
    });
    saveAdminData();
    renderGroups();
    populateSelectors();
    addNotification(`New group "${name}" created`);
    document.getElementById('newGroupName').value = '';
    document.getElementById('newGroupSize').value = '';
}

// Delete group
function deleteGroup(id) {
    if (confirm("Are you sure you want to delete this group?")) {
        adminData.groups = adminData.groups.filter(g => g.id !== id);
        saveAdminData();
        renderGroups();
        populateSelectors();
        addNotification("Group deleted");
    }
}

// Create user account
function createUserAccount() {
    const name = document.getElementById('newUserName').value.trim();
    const phone = document.getElementById('newUserPhone').value.trim();
    const email = document.getElementById('newUserEmail').value.trim();
    const deposit = parseInt(document.getElementById('newUserDeposit').value);
    const groupId = parseInt(document.getElementById('newUserGroup').value);
    
    if (!name || !phone || !deposit) {
        alert("Please fill all required fields (Name, Phone, Deposit)");
        return;
    }
    
    const newMember = {
        id: Date.now(),
        name: name,
        phone: phone,
        email: email,
        status: "active",
        joined: new Date().toISOString().split('T')[0],
        group: adminData.groups.find(g => g.id === groupId)?.name || "Unassigned",
        balance: deposit,
        totalInvested: deposit,
        password: phone.slice(-4) // Simple password using last 4 digits of phone
    };
    
    adminData.members.push(newMember);
    
    if (deposit > 0) {
        adminData.investments.push({
            id: Date.now(),
            memberId: newMember.id,
            memberName: name,
            name: "Initial Deposit",
            amount: deposit,
            expectedReturn: deposit,
            status: "active",
            date: new Date().toISOString().split('T')[0]
        });
    }
    
    const group = adminData.groups.find(g => g.id === groupId);
    if (group) {
        group.members.push(newMember.id);
    }
    
    saveAdminData();
    addNotification(`New member "${name}" created with password: ${newMember.password}`);
    
    alert(`✅ Member Account Created!\n\nName: ${name}\nPhone: ${phone}\nPassword: ${newMember.password}\n\nShare these credentials with the member to access their dashboard.`);
    
    document.getElementById('newUserName').value = '';
    document.getElementById('newUserPhone').value = '';
    document.getElementById('newUserEmail').value = '';
    document.getElementById('newUserDeposit').value = '';
    
    renderMembers();
    updateStats();
    populateSelectors();
}

// View member details
function viewMember(id) {
    const member = adminData.members.find(m => m.id === id);
    const memberInvestments = adminData.investments.filter(i => i.memberId === id);
    alert(`Member Details:\n\nName: ${member.name}\nPhone: ${member.phone}\nEmail: ${member.email}\nStatus: ${member.status}\nTotal Invested: UGX ${member.totalInvested.toLocaleString()}\nCurrent Balance: UGX ${member.balance.toLocaleString()}\nInvestments: ${memberInvestments.length}`);
}

// Delete member
function deleteMember(id) {
    if (confirm("Are you sure you want to delete this member?")) {
        adminData.members = adminData.members.filter(m => m.id !== id);
        adminData.investments = adminData.investments.filter(i => i.memberId !== id);
        saveAdminData();
        renderMembers();
        renderInvestments();
        updateStats();
        addNotification("Member deleted");
    }
}

// Populate selectors
function populateSelectors() {
    const investmentSelect = document.getElementById('slotInvestmentSelect');
    if (investmentSelect) {
        const investments = ["MEN'S HAIR SALON", "POULTRY FARM", "RESTAURANT", "MODERN STALL", "CLASSIC BOUTIQUE", "GROCERY STORE", "TRANSPORT BUSINESS", "MODERN CONSTRUCTION"];
        investmentSelect.innerHTML = investments.map(inv => `<option value="${inv}">${inv}</option>`).join('');
    }
    
    const groupSelect = document.getElementById('newUserGroup');
    if (groupSelect) {
        groupSelect.innerHTML = adminData.groups.map(g => `<option value="${g.id}">${g.name}</option>`).join('');
    }
}

// Tab switching
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${tabName}Tab`).classList.add('active');
    event.target.classList.add('active');
}

// View group
function viewGroup(id) {
    const group = adminData.groups.find(g => g.id === id);
    const members = adminData.members.filter(m => group.members.includes(m.id));
    alert(`Group: ${group.name}\nMembers: ${members.length}/${group.maxSize}\n\nMembers:\n${members.map(m => m.name).join('\n') || 'No members yet'}`);
}

// Check for existing session on load
document.addEventListener('DOMContentLoaded', () => {
    loadAdminCredentials();
    const isLoggedIn = localStorage.getItem('shimogy_admin_logged_in');
    if (isLoggedIn === 'true') {
        showDashboard();
    } else {
        document.getElementById('loginSection').style.display = 'block';
        document.getElementById('dashboardContent').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'none';
        document.getElementById('adminUsername').value = adminCredentials.username;
    }
});

function addMemberToCycle(memberId, cycleId) {
    const cycle = adminData.cycles.find(c => c.id === cycleId);
    if (cycle) {
        if (!cycle.members) cycle.members = [];
        if (!cycle.members.includes(memberId)) {
            cycle.members.push(memberId);
            saveAdminData();
            addNotification(`Member added to cycle ${cycle.name}`);
        }
    }
}

// Modify the createUserAccount function to also add to cycle if selected
// Add this line after creating the member:
// if (selectedCycleId) addMemberToCycle(newMember.id, selectedCycleId);

// Make functions global
window.login = login;
window.logout = logout;
window.togglePassword = togglePassword;
window.showChangePasswordModal = showChangePasswordModal;
window.closePasswordModal = closePasswordModal;
window.updatePasswordFromModal = updatePasswordFromModal;
window.updateAdminCredentials = updateAdminCredentials;
window.refreshData = refreshData;
window.exportData = exportData;
window.clearAllNotifications = clearAllNotifications;
window.addCycle = addCycle;
window.deleteCycle = deleteCycle;
window.editCycle = editCycle;
window.addSlots = addSlots;
window.editSlots = editSlots;
window.createGroup = createGroup;
window.deleteGroup = deleteGroup;
window.createUserAccount = createUserAccount;
window.viewMember = viewMember;
window.deleteMember = deleteMember;
window.viewGroup = viewGroup;
window.showTab = showTab;