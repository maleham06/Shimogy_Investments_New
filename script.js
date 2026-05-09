/* ============================================
   SHIMOGY INVESTMENT GROUP - MAIN JAVASCRIPT
   With Original Demo Images for All Slots
   ============================================ */

window.ShimogyData = {
    investments: [
        { id: 1, name: "MEN'S HAIR SALON", price: 200000, return: 250000, duration: "30 DAYS", risk: "Low", cta: "Upgrade your future. Invest in style.", img: "images/saloon.jpg", slotsLeft: 5, status: "available" },
        { id: 2, name: "POULTRY FARM", price: 500000, return: 700000, duration: "60 DAYS", risk: "Low", cta: "Grow steady income with smart farming.", img: "images/poultry.jpg", slotsLeft: 3, status: "available" },
        { id: 3, name: "RESTAURANT", price: 500000, return: 700000, duration: "45 DAYS", risk: "Medium", cta: "Turn daily demand into daily profit.", img: "images/restaurant.jpg", slotsLeft: 4, status: "available" },
        { id: 4, name: "MODERN STALL", price: 50000, return: 62000, duration: "30 DAYS", risk: "Low", cta: "Start small, grow big.", img: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop", slotsLeft: 8, status: "available" },
        { id: 5, name: "CLASSIC BOUTIQUE", price: 100000, return: 120000, duration: "30 DAYS", risk: "Low", cta: "Fashion meets profit.", img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop", slotsLeft: 6, status: "available" },
        { id: 6, name: "GROCERY STORE", price: 800000, return: 1200000, duration: "60 DAYS", risk: "Medium", cta: "Essential business, stable returns.", img: "https://images.unsplash.com/photo-1515169067868-5387ec356754?w=600&h=400&fit=crop", slotsLeft: 2, status: "available" },
        { id: 7, name: "TRANSPORT BUSINESS", price: 1000000, return: 1500000, duration: "90 DAYS", risk: "High", cta: "Move people, move profits.", img: "images/transport.jpg", slotsLeft: 1, status: "available" },
        { id: 8, name: "MODERN CONSTRUCTION", price: 2500000, return: 3500000, duration: "120 DAYS", risk: "Low", cta: "Build wealth with construction.", img: "images/construction.jpg", slotsLeft: 2, status: "available" }
    ],
    cycles: [],
    userSavings: [],
    userLoans: []
};

let currentInvestmentId = null;
let currentCycleId = null;

// Function to send notification to admin dashboard
function sendAdminNotification(type, data, userName, userPhone) {
    let adminData = JSON.parse(localStorage.getItem('shimogy_admin_data') || '{"notifications":[],"pendingRequests":[],"members":[],"investments":[]}');
    
    if (!adminData.notifications) adminData.notifications = [];
    if (!adminData.pendingRequests) adminData.pendingRequests = [];
    
    const notification = {
        id: Date.now(),
        type: type,
        message: `🔔 ${type.toUpperCase()}: ${userName} (${userPhone}) requested ${data.name || data.investment || data.cycle || ''}`,
        details: data,
        userName: userName,
        userPhone: userPhone,
        time: new Date().toLocaleString(),
        read: false
    };
    
    adminData.notifications.unshift(notification);
    
    adminData.pendingRequests.push({
        id: Date.now(),
        type: type,
        userName: userName,
        userPhone: userPhone,
        details: data,
        time: new Date().toLocaleString(),
        status: 'pending'
    });
    
    localStorage.setItem('shimogy_admin_data', JSON.stringify(adminData));
    
    console.log(`📢 Admin notification sent: ${notification.message}`);
}

// Load saved data
function loadSavedData() {
    const saved = localStorage.getItem('shimogy_savings');
    if (saved) window.ShimogyData.userSavings = JSON.parse(saved);
}

loadSavedData();

// Render Investments
function renderInvestments() {
    const grid = document.getElementById('investmentsGrid');
    if (!grid) return;
    
    grid.innerHTML = window.ShimogyData.investments.map(inv => {
        let slotClass = '', slotText = '', buttonHtml = '';
        if (inv.status === 'booked') {
            slotClass = 'slot-booked';
            slotText = '🔒 Slot booked';
            buttonHtml = '<button class="btn-outline" disabled style="opacity:0.5;">Not Available</button>';
        } else if (inv.status === 'ready') {
            slotClass = 'slot-ready';
            slotText = '✅ Slot ready';
            buttonHtml = '<button class="btn-outline" disabled style="opacity:0.5;">Returns Ready</button>';
        } else {
            slotClass = 'slot-available';
            slotText = `${inv.slotsLeft} slots left`;
            buttonHtml = `<button class="btn-gold" style="margin-top:16px; width:100%;" onclick="openInvestModal(${inv.id})">Invest Now</button>`;
        }
        
        return `
            <div class="invest-card">
                <div class="card-img" style="background-image: url('${inv.img}');"></div>
                <div class="card-body">
                    <span class="new-badge" style="color:#00ff66; font-size:14px;">NEW</span>
                    <h3>${inv.name}</h3>
                    <div class="price">UGX ${inv.price.toLocaleString()}</div>
                    <p>📈 Est. Returns: UGX ${inv.return.toLocaleString()} | ⏱️ ${inv.duration}</p>
                    <p>⚠️ Risk: ${inv.risk}</p>
                    <p>${inv.cta || ''}</p>
                    <span class="${slotClass}">${slotText}</span>
                    ${buttonHtml}
                </div>
            </div>
        `;
    }).join('');
}

// Open Investment Modal
window.openInvestModal = function(id) {
    const inv = window.ShimogyData.investments.find(i => i.id === id);
    if (inv && inv.slotsLeft > 0 && inv.status !== 'booked') {
        currentInvestmentId = id;
        const modal = document.getElementById('investModal');
        if (modal) {
            document.getElementById('modalTitle').innerHTML = `<i class="fas fa-pen-alt"></i> Investment Request: ${inv.name}`;
            document.getElementById('investName').value = '';
            document.getElementById('investPhone').value = '';
            modal.classList.add('active');
        } else {
            console.error('investModal not found in DOM');
            alert('Form error. Please refresh the page.');
        }
    }
};

// Submit Investment
window.submitInvestment = function() {
    const name = document.getElementById('investName').value.trim();
    const phone = document.getElementById('investPhone').value.trim();
    
    if (!name || !phone) { 
        alert("Please fill in both name and phone number"); 
        return;
    }
    
    const inv = window.ShimogyData.investments.find(i => i.id === currentInvestmentId);
    if (inv && inv.slotsLeft > 0 && inv.status !== 'booked') {
        inv.slotsLeft--;
        inv.status = 'booked';
        
        // Save investment to admin data for member tracking
        let adminData = JSON.parse(localStorage.getItem('shimogy_admin_data') || '{"members":[],"investments":[]}');
        
        // Find or create member
        let member = adminData.members.find(m => m.phone === phone);
        if (!member) {
            member = {
                id: Date.now(),
                name: name,
                phone: phone,
                email: "",
                status: "active",
                joined: new Date().toISOString().split('T')[0],
                balance: 0,
                totalInvested: 0,
                dailyEarnings: 0,
                investments: []
            };
            adminData.members.push(member);
        }
        
        // Add investment to member
        const newInvestment = {
            id: Date.now(),
            memberId: member.id,
            memberName: name,
            name: inv.name,
            amount: inv.price,
            expectedReturn: inv.return,
            dailyRate: (inv.return - inv.price) / 30,
            status: "active",
            date: new Date().toISOString().split('T')[0],
            startDate: new Date().toISOString()
        };
        
        adminData.investments.push(newInvestment);
        member.totalInvested += inv.price;
        member.balance += inv.price;
        
        localStorage.setItem('shimogy_admin_data', JSON.stringify(adminData));
        
        // SEND NOTIFICATION TO ADMIN
        sendAdminNotification('investment', {
            name: inv.name,
            amount: inv.price,
            expectedReturn: inv.return,
            duration: inv.duration
        }, name, phone);
        
        alert(`✅ Investment request submitted! Admin has been notified and will call ${phone} to confirm payment for ${inv.name}.`);
        renderInvestments();
        
        // Countdown simulation
        setTimeout(() => {
            if (inv.status === 'booked') {
                inv.status = 'ready';
                renderInvestments();
                sendAdminNotification('investment_ready', {
                    name: inv.name,
                    amount: inv.price,
                    expectedReturn: inv.return
                }, name, phone);
                alert(`✅ ${inv.name} is now READY for returns! Your returns of UGX ${inv.return.toLocaleString()} are available.`);
            }
        }, 10000);
    }
    
    const modal = document.getElementById('investModal');
    if (modal) modal.classList.remove('active');
    currentInvestmentId = null;
};

// Render Cycles
function renderCycles() {
    const grid = document.getElementById('cyclesGrid');
    if (!grid) return;
    
    const cyclesData = [
        { id: 1, name: "GROUP 1", contribution: "3000", members: 5, img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop" },
        { id: 2, name: "GROUP 2", contribution: "5000", members: 8, img: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&h=400&fit=crop" },
        { id: 3, name: "GROUP 3", contribution: "10000", members: 12, img: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&h=400&fit=crop" },
        { id: 4, name: "GROUP 4", contribution: "50000", members: 6, img: "https://images.unsplash.com/photo-1557425529-b1ae9c141e7d?w=600&h=400&fit=crop" }
    ];
    
    grid.innerHTML = cyclesData.map(cycle => `
        <div class="cycle-card-with-image">
            <div class="cycle-img" style="background-image: url('${cycle.img}');"></div>
            <div class="cycle-body">
                <h3>${cycle.name}</h3>
                <div class="price">UGX ${parseInt(cycle.contribution).toLocaleString()}</div>
                <p>👥 Members: ${cycle.members}</p>
                <button class="btn-gold" onclick="openCycleModal(${cycle.id})">Join Cycle</button>
            </div>
        </div>
    `).join('');
}

// Open Cycle Modal
window.openCycleModal = function(id) {
    currentCycleId = id;
    const modal = document.getElementById('cycleModal');
    if (modal) {
        document.getElementById('cycleModalTitle').innerHTML = `<i class="fas fa-pen-alt"></i> Cycle Request`;
        document.getElementById('cycleName').value = '';
        document.getElementById('cyclePhone').value = '';
        modal.classList.add('active');
    }
};

// Submit Cycle Join
window.submitCycleJoin = function() {
    const name = document.getElementById('cycleName').value.trim();
    const phone = document.getElementById('cyclePhone').value.trim();
    
    if (!name || !phone) { 
        alert("Please fill in both name and phone number"); 
        return;
    }
    
    sendAdminNotification('cycle_join', {
        cycleName: "GROUP " + currentCycleId,
        contribution: "UGX " + [3000, 5000, 10000, 50000][currentCycleId - 1]
    }, name, phone);
    
    alert(`✅ Cycle request submitted! Admin has been notified and will call ${phone} to confirm.`);
    
    const modal = document.getElementById('cycleModal');
    if (modal) modal.classList.remove('active');
    currentCycleId = null;
};

// Create Cycle
window.createCycle = function() {
    const name = document.getElementById('newCycleName').value.trim();
    const amount = document.getElementById('newCycleAmount').value.trim();
    if (!name || !amount) { alert("Please enter cycle name and contribution amount"); return; }
    
    alert(`✅ Cycle "${name}" created successfully! Admin will review.`);
    document.getElementById('newCycleName').value = '';
    document.getElementById('newCycleAmount').value = '';
};

// Render Savings
function loadSavings() {
    const container = document.getElementById('savingsStatus');
    if (!container) return;
    
    if (window.ShimogyData.userSavings.length > 0) {
        container.innerHTML = `<div class="glass-card" style="padding:1rem;">✅ Active Account: ${window.ShimogyData.userSavings[0].type} (Welcome ${window.ShimogyData.userSavings[0].name})</div>`;
    } else {
        container.innerHTML = `<div class="glass-card" style="padding:1rem;">✨ No active accounts. Create an account to get started.</div>`;
    }
}

// Open Savings Modal
window.openSavingsModal = function(type) {
    window.currentAccountType = type;
    const modal = document.getElementById('savingsModal');
    if (modal) {
        document.getElementById('savingsModalTitle').innerHTML = `<i class="fas fa-pen-alt"></i> Account Opening: ${type}`;
        document.getElementById('savingsName').value = '';
        document.getElementById('savingsPhone').value = '';
        modal.classList.add('active');
    }
};

// Submit Savings
window.submitSavings = function() {
    const name = document.getElementById('savingsName').value.trim();
    const phone = document.getElementById('savingsPhone').value.trim();
    
    if (!name || !phone) { 
        alert("Please fill in both name and phone number"); 
        return;
    }
    
    window.ShimogyData.userSavings.push({ type: window.currentAccountType, name: name, phone: phone });
    localStorage.setItem('shimogy_savings', JSON.stringify(window.ShimogyData.userSavings));
    
    sendAdminNotification('savings_account', {
        accountType: window.currentAccountType
    }, name, phone);
    
    alert(`✅ ${window.currentAccountType} account request submitted! Admin has been notified and will call ${phone} to confirm activation.`);
    loadSavings();
    
    const modal = document.getElementById('savingsModal');
    if (modal) modal.classList.remove('active');
};

// Render Updates
function renderUpdates() {
    const container = document.getElementById('updatesList');
    if (!container) return;
    
    const updates = [
        { img: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=120&h=120&fit=crop", title: "Client of the Year", desc: "We proudly celebrate our top-performing investor who has shown consistency and discipline.", detail: "John Mukasa achieved 150% returns on his investment portfolio this year, setting a new record for our community." },
        { img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=120&h=120&fit=crop", title: "Self Employment Success", desc: "Members are building independent income streams through our investment opportunities.", detail: "Over 200 members have started successful businesses using our investment returns as seed capital." },
        { img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=120&h=120&fit=crop", title: "New Marketing Strategy", desc: "We launched a digital campaign reaching more investors globally.", detail: "Our social media reach has grown by 300% in the last quarter." },
        { img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=120&h=120&fit=crop", title: "Business Expansion", desc: "We are expanding into new sectors for more opportunities.", detail: "New investment opportunities in real estate and technology sectors available next month." },
        { img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=120&h=120&fit=crop", title: "Entrepreneur Training", desc: "Training programs help members gain business skills.", detail: "Weekly workshops on financial literacy are now available to all members." },
        { img: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=120&h=120&fit=crop", title: "Record Investments", desc: "We achieved record-breaking investments this month.", detail: "Total investments exceeded UGX 500 million this month, a new milestone." },
        { img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=120&h=120&fit=crop", title: "Online Growth", desc: "Our online presence continues to grow globally.", detail: "Website traffic has doubled, and we've launched a mobile app for easier tracking." },
        { img: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=120&h=120&fit=crop", title: "Partnerships", desc: "New partnerships are opening more investment opportunities.", detail: "Strategic partnerships with 5 major companies will provide exclusive opportunities." },
        { img: "https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=120&h=120&fit=crop", title: "Community Impact", desc: "We continue empowering individuals financially.", detail: "Our community now has over 1,000 active investors across Uganda." },
        { img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=120&h=120&fit=crop", title: "Better Returns", desc: "Improved strategies are delivering better profits.", detail: "Average returns have increased by 15% across all investment categories." }
    ];
    
    let html = '';
    updates.forEach((update, index) => {
        html += `
            <div class="update-card" onclick="toggleUpdateDetail(${index})">
                <img src="${update.img}" alt="${update.title}" style="width:80px; height:80px; border-radius:12px; object-fit:cover;">
                <div>
                    <h4>📢 ${update.title}</h4>
                    <p><strong>Big bold text:</strong> ${update.desc}</p>
                    <div id="update-detail-${index}" class="update-detail">
                        <p>✨ Full details: ${update.detail}</p>
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

window.toggleUpdateDetail = function(index) {
    const detail = document.getElementById(`update-detail-${index}`);
    if (detail) {
        if (detail.style.display === 'none' || detail.style.display === '') {
            detail.style.display = 'block';
        } else {
            detail.style.display = 'none';
        }
    }
};

// Home Slider with Original Images
function renderHomeSlider() {
    const track = document.getElementById('sliderTrack');
    if (!track) return;
    
    const slides = [
        { img: "images/saloon.jpg", title: "MEN'S HAIR SALON", price: "200,000 → 250,000" },
        { img: "images/poultry.jpg", title: "POULTRY FARM", price: "500,000 → 700,000" },
        { img: "images/restaurant.jpg", title: "RESTAURANT", price: "500,000 → 700,000" },
        { img: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=250&fit=crop", title: "MODERN STALL", price: "50,000 → 62,000" },
        { img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=250&fit=crop", title: "CLASSIC BOUTIQUE", price: "100,000 → 120,000" },
        { img: "images/grocery.png", title: "GROCERY STORE", price: "800,000 → 1,200,000" }
    ];
    // Duplicate for seamless infinite scroll
    const allSlides = [...slides, ...slides];
    
    track.innerHTML = allSlides.map(slide => `
        <div class="slider-card">
            <div class="card-img" style="background-image: url('${slide.img}');"></div>
            <div class="card-body">
                <h3>${slide.title}</h3>
                <div class="price">UGX ${slide.price}</div>
                <a href="investments.html" class="btn-gold" style="display: inline-block; margin-top: 0.5rem; padding: 8px 20px; font-size: 0.8rem;">Invest Now</a>
            </div>
        </div>
    `).join('');
}

// Loan Functions
window.openLoanModal = function() {
    const hasAccount = window.ShimogyData.userSavings.length > 0;
    if (hasAccount) {
        const modal = document.getElementById('loanModal');
        if (modal) {
            document.getElementById('loanName').value = '';
            document.getElementById('loanPhone').value = '';
            modal.classList.add('active');
        }
    } else {
        alert("⚠️ You need an active savings account to request a loan. Please create a savings account first.");
    }
};

window.submitLoan = function() {
    const name = document.getElementById('loanName').value.trim();
    const phone = document.getElementById('loanPhone').value.trim();
    
    if (!name || !phone) { 
        alert("Please fill in both name and phone number"); 
        return;
    }
    
    sendAdminNotification('loan_request', {
        requestedAmount: "UGX 100,000"
    }, name, phone);
    
    alert(`✅ Loan request submitted! Admin has been notified and will call ${phone} to process your loan.`);
    
    const modal = document.getElementById('loanModal');
    if (modal) modal.classList.remove('active');
};

// Modal Setup
function setupModals() {
    // Close modals when clicking outside
    const modals = ['investModal', 'cycleModal', 'savingsModal', 'loanModal', 'accessModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.remove('active');
            });
        }
    });
    
    // Setup button handlers
    const investSubmit = document.getElementById('investSubmit');
    const investCancel = document.getElementById('investCancel');
    if (investSubmit) investSubmit.onclick = window.submitInvestment;
    if (investCancel) investCancel.onclick = () => {
        const modal = document.getElementById('investModal');
        if (modal) modal.classList.remove('active');
    };
    
    const cycleSubmit = document.getElementById('cycleSubmit');
    const cycleCancel = document.getElementById('cycleCancel');
    if (cycleSubmit) cycleSubmit.onclick = window.submitCycleJoin;
    if (cycleCancel) cycleCancel.onclick = () => {
        const modal = document.getElementById('cycleModal');
        if (modal) modal.classList.remove('active');
    };
    
    const savingsSubmit = document.getElementById('savingsSubmit');
    const savingsCancel = document.getElementById('savingsCancel');
    if (savingsSubmit) savingsSubmit.onclick = window.submitSavings;
    if (savingsCancel) savingsCancel.onclick = () => {
        const modal = document.getElementById('savingsModal');
        if (modal) modal.classList.remove('active');
    };
    
    const loanSubmit = document.getElementById('loanSubmit');
    const loanCancel = document.getElementById('loanCancel');
    if (loanSubmit) loanSubmit.onclick = window.submitLoan;
    if (loanCancel) loanCancel.onclick = () => {
        const modal = document.getElementById('loanModal');
        if (modal) modal.classList.remove('active');
    };
    
    const loanBtn = document.getElementById('loanRequestBtn');
    if (loanBtn) loanBtn.onclick = window.openLoanModal;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('investmentsGrid')) renderInvestments();
    if (document.getElementById('cyclesGrid')) renderCycles();
    if (document.getElementById('savingsStatus')) loadSavings();
    if (document.getElementById('updatesList')) renderUpdates();
    if (document.getElementById('sliderTrack')) renderHomeSlider();
    setupModals();
    
    console.log('Page initialized - forms should be functional');
});

// Make functions global
window.submitInvestment = submitInvestment;
window.submitCycleJoin = submitCycleJoin;
window.submitSavings = submitSavings;
window.submitLoan = submitLoan;
window.openInvestModal = openInvestModal;
window.openCycleModal = openCycleModal;
window.openSavingsModal = openSavingsModal;
window.openLoanModal = openLoanModal;
window.createCycle = createCycle;