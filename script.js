const BASE_URL = 'https://your-infinityfree-domain.com/backend/';
let currentPage = 1;

// Login Functionality
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch(`${BASE_URL}login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const result = await response.json();
    if (result.success) {
        localStorage.setItem('userId', result.userId); // Store user ID
        if (result.role === 'admin') {
            window.location.href = '/admin-panel.html';
        } else if (result.role === 'staff') {
            window.location.href = '/staff-panel.html';
        }
    } else {
        document.getElementById('error-message').textContent = result.error || 'Login failed.';
    }
});

// Register User Functionality (Admin Only)
document.getElementById('registerUserForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newUsername = document.getElementById('newUsername').value;
    const newPassword = document.getElementById('newPassword').value;
    const newUserRole = document.getElementById('newUserRole').value;

    const response = await fetch(`${BASE_URL}register-user.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, password: newPassword, role: newUserRole })
    });

    const result = await response.json();
    if (result.success) {
        alert('User registered successfully!');
    } else {
        alert('Failed to register user.');
    }
});

// Load Vital Signs Data with Pagination
async function loadData(page = 1) {
    const response = await fetch(`${BASE_URL}view-data.php?page=${page}`);
    const data = await response.json();

    const tableBody = document.querySelector('#vitalsTable tbody');
    tableBody.innerHTML = ''; // Clear existing rows

    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.id}</td>
            <td>${row.patient_name}</td>
            <td>${row.date}</td>
            <td>${row.time}</td>
            <td>${row.shift}</td>
            <td>${row.temperature}</td>
            <td>${row.blood_pressure}</td>
            <td>${row.glucose}</td>
            <td>${row.pulse_rate}</td>
            <td>${row.spo2}</td>
            <td>${row.weight}</td>
            <td>${row.height}</td>
            <td>${row.notes}</td>
            <td>${row.recorded_at}</td>
        `;
        tableBody.appendChild(tr);
    });
}

// Pagination Buttons
document.getElementById('nextPageButton')?.addEventListener('click', () => {
    currentPage++;
    loadData(currentPage);
});

document.getElementById('prevPageButton')?.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        loadData(currentPage);
    }
});

// Print Monthly Report
document.getElementById('printButton')?.addEventListener('click', async () => {
    const month = document.getElementById('monthFilter').value;
    if (!month) {
        alert('Please select a month.');
        return;
    }

    const response = await fetch(`${BASE_URL}view-data.php`);
    const data = await response.json();

    const filteredData = data.filter(row => row.date.startsWith(month));
    if (filteredData.length === 0) {
        alert('No data found for the selected month.');
        return;
    }

    let printableContent = `
        <h1>HSH CARE CENTER</h1>
        <h2>Monthly Vital Signs Report</h2>
        <p><strong>Month:</strong> ${month}</p>
        <table border="1" cellpadding="10" cellspacing="0">
            <thead>
                <tr>
                    <th>Patient Name</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Shift</th>
                    <th>Temperature</th>
                    <th>Blood Pressure</th>
                    <th>Glucose</th>
                    <th>Pulse Rate</th>
                    <th>SpO2</th>
                    <th>Weight</th>
                    <th>Height</th>
                    <th>Notes</th>
                </tr>
            </thead>
            <tbody>
    `;

    filteredData.forEach(row => {
        printableContent += `
            <tr>
                <td>${row.patient_name}</td>
                <td>${row.date}</td>
                <td>${row.time}</td>
                <td>${row.shift}</td>
                <td>${row.temperature}</td>
                <td>${row.blood_pressure}</td>
                <td>${row.glucose}</td>
                <td>${row.pulse_rate}</td>
                <td>${row.spo2}</td>
                <td>${row.weight}</td>
                <td>${row.height}</td>
                <td>${row.notes}</td>
            </tr>
        `;
    });

    printableContent += '</tbody></table>';

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Monthly Report</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 8px; text-align: left; }
                    h1, h2 { text-align: center; }
                </style>
            </head>
            <body>${printableContent}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
});