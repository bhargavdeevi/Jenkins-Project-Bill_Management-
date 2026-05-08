// Bill Manager Application JavaScript
let bills = JSON.parse(localStorage.getItem('bills') || '[]');

function saveToLocal() {
    localStorage.setItem('bills', JSON.stringify(bills));
}

function calculateDueDate(purchaseDate, termsDays) {
    const date = new Date(purchaseDate);
    const due = new Date(date);
    due.setDate(date.getDate() + termsDays);
    return due.toISOString().split('T')[0];
}

function getStatus(dueDate, isPaid) {
    if (isPaid) return 'paid';
    const today = new Date();
    today.setHours(0,0,0,0);
    const due = new Date(dueDate);
    if (due < today) return 'overdue';
    return 'pending';
}

function renderUI() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const filterVal = document.getElementById('filterStatus')?.value || 'all';
    
    let filtered = bills.filter(b => b.distributor.toLowerCase().includes(searchTerm));
    
    if (filterVal !== 'all') {
        filtered = filtered.filter(b => b.status === filterVal);
    }
    
    const tbody = document.getElementById('tableBody');
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No bills found</td></tr>';
    } else {
        tbody.innerHTML = filtered.map(bill => `
            <tr>
                <td><strong>${escapeHtml(bill.distributor)}</strong></td>
                <td>₹ ${bill.amount.toFixed(2)}</td>
                <td>${bill.dueDate}</td>
                <td><span class="status status-${bill.status}">${bill.status}</span></td>
                <td class="action-icons">
                    ${bill.status !== 'paid' ? `<i class="fas fa-check-circle" onclick="markAsPaid(${bill.id})" style="color:#16a34a; cursor:pointer;"></i>` : ''}
                    <i class="fas fa-trash-alt delete-icon" onclick="deleteBill(${bill.id})" style="cursor:pointer;"></i>
                </td>
            </tr>
        `).join('');
    }
    
    const totalBills = bills.length;
    const totalDue = bills.filter(b => b.status !== 'paid').reduce((sum, b) => sum + b.amount, 0);
    const overdueCount = bills.filter(b => b.status === 'overdue').length;
    const today = new Date();
    const weekLater = new Date(today);
    weekLater.setDate(today.getDate() + 7);
    const dueSoonCount = bills.filter(b => {
        const due = new Date(b.dueDate);
        return b.status !== 'paid' && due >= today && due <= weekLater;
    }).length;
    
    document.getElementById('totalBills').innerText = totalBills;
    document.getElementById('totalDue').innerHTML = `₹ ${totalDue.toFixed(2)}`;
    document.getElementById('overdueCount').innerText = overdueCount;
    document.getElementById('dueSoonCount').innerText = dueSoonCount;
}

function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function addBill() {
    const distributor = document.getElementById('distName').value;
    const amount = parseFloat(document.getElementById('billAmount').value);
    const purchaseDate = document.getElementById('purchaseDate').value;
    const termsDays = parseInt(document.getElementById('paymentTerms').value);
    
    if (!distributor || !amount || !purchaseDate) {
        alert('Please fill all fields');
        return;
    }
    
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid positive amount');
        return;
    }
    
    const dueDate = calculateDueDate(purchaseDate, termsDays);
    const newBill = {
        id: Date.now(),
        distributor: distributor,
        amount: amount,
        purchaseDate: purchaseDate,
        dueDate: dueDate,
        status: 'pending',
        terms: termsDays
    };
    newBill.status = getStatus(dueDate, false);
    bills.unshift(newBill);
    saveToLocal();
    renderUI();
    
    document.getElementById('distName').value = '';
    document.getElementById('billAmount').value = '';
    // Keep purchase date as today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('purchaseDate').value = today;
}

function markAsPaid(id) {
    const bill = bills.find(b => b.id === id);
    if (bill && bill.status !== 'paid') {
        bill.status = 'paid';
        saveToLocal();
        renderUI();
        alert(`Payment for ${bill.distributor} marked as paid!`);
    } else if (bill && bill.status === 'paid') {
        alert('This bill is already paid');
    }
}

function deleteBill(id) {
    if (confirm('Delete this bill permanently?')) {
        bills = bills.filter(b => b.id !== id);
        saveToLocal();
        renderUI();
    }
}

function loadSampleData() {
    if (bills.length > 0 && !confirm('Load sample data? This will replace your current bills.')) {
        return;
    }
    
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setDate(today.getDate() - 25);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 5);
    const twoWeeksLater = new Date(today);
    twoWeeksLater.setDate(today.getDate() + 18);
    
    bills = [
        { 
            id: Date.now() + 1, 
            distributor: 'Alpha Traders', 
            amount: 12500, 
            purchaseDate: lastMonth.toISOString().split('T')[0], 
            dueDate: calculateDueDate(lastMonth.toISOString().split('T')[0], 30), 
            status: 'overdue', 
            terms: 30 
        },
        { 
            id: Date.now() + 2, 
            distributor: 'Bright Distributors', 
            amount: 8700, 
            purchaseDate: new Date(today.setDate(today.getDate() - 10)).toISOString().split('T')[0], 
            dueDate: calculateDueDate(new Date().toISOString().split('T')[0], 15), 
            status: 'pending', 
            terms: 15 
        },
        { 
            id: Date.now() + 3, 
            distributor: 'City Wholesale', 
            amount: 24500, 
            purchaseDate: new Date().toISOString().split('T')[0], 
            dueDate: calculateDueDate(new Date().toISOString().split('T')[0], 30), 
            status: 'pending', 
            terms: 30 
        },
        { 
            id: Date.now() + 4, 
            distributor: 'Delta Suppliers', 
            amount: 5200, 
            purchaseDate: nextWeek.toISOString().split('T')[0], 
            dueDate: calculateDueDate(nextWeek.toISOString().split('T')[0], 7), 
            status: 'pending', 
            terms: 7 
        },
        { 
            id: Date.now() + 5, 
            distributor: 'Eco Distributor', 
            amount: 3300, 
            purchaseDate: twoWeeksLater.toISOString().split('T')[0], 
            dueDate: calculateDueDate(twoWeeksLater.toISOString().split('T')[0], 30), 
            status: 'paid', 
            terms: 30 
        }
    ];
    
    // Update statuses properly
    bills.forEach(bill => {
        if (bill.status !== 'paid') {
            bill.status = getStatus(bill.dueDate, false);
        }
    });
    
    saveToLocal();
    renderUI();
}

// Initialize event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const addBtn = document.getElementById('addBillBtn');
    const demoBtn = document.getElementById('demoDataBtn');
    const searchInput = document.getElementById('searchInput');
    const filterStatus = document.getElementById('filterStatus');
    
    if (addBtn) addBtn.addEventListener('click', addBill);
    if (demoBtn) demoBtn.addEventListener('click', loadSampleData);
    if (searchInput) searchInput.addEventListener('input', renderUI);
    if (filterStatus) filterStatus.addEventListener('change', renderUI);
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    const purchaseDateInput = document.getElementById('purchaseDate');
    if (purchaseDateInput && !purchaseDateInput.value) {
        purchaseDateInput.value = today;
    }
    
    // Load existing data or sample
    if (bills.length === 0) {
        loadSampleData();
    } else {
        renderUI();
    }
});
