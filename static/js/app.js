// Helper to get headers (if we were using tokens properly in headers)
// For this demo, we pass basic data or rely on query params/body for simplicity as per Plan.

const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');

function checkAuth() {
    if (!user || !token) {
        window.location.href = '/login';
    }
}

// Format Date
function formatDate(dateString) {
    return new Date(dateString).toLocaleString();
}

// Logout
function logout() {
    localStorage.clear();
    window.location.href = '/login';
}

// ----- Citizen Functions -----

async function loadCitizenDashboard() {
    checkAuth();
    document.getElementById('user-name').textContent = user.full_name;

    // Load Departments for Dropdown
    await loadDepartments();
    // Load Complaints
    await loadComplaints('citizen', user.id);
}

async function loadDepartments() {
    try {
        const response = await fetch('/api/departments');
        const depts = await response.json();
        const select = document.getElementById('department');
        if (select) {
            depts.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d.id;
                opt.textContent = d.name;
                select.appendChild(opt);
            });
        }
    } catch (err) {
        console.error('Failed to load departments', err);
    }
}

async function handleComplaintSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const departmentId = document.getElementById('department').value;

    try {
        const response = await fetch('/api/complaints', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user.id,
                department_id: parseInt(departmentId),
                title,
                description
            })
        });

        if (response.ok) {
            alert('Complaint registered successfully!');
            // Reset form and reload list
            e.target.reset();
            loadComplaints('citizen', user.id);
            // Close modal if using one, or just refresh
        } else {
            alert('Failed to register complaint');
        }
    } catch (err) {
        console.error(err);
    }
}

// ----- Officer Functions -----

async function loadOfficerDashboard() {
    checkAuth();
    document.getElementById('officer-name').textContent = user.full_name;
    // Load assigned complaints
    await loadComplaints('officer', user.id, user.department_id);
}

// ----- Admin Functions -----

async function loadAdminDashboard() {
    checkAuth();

    // Load Stats
    fetch('/api/stats')
        .then(res => res.json())
        .then(data => {
            document.getElementById('total-initial').textContent = data.total;
            document.getElementById('pending-count').textContent = data.pending;
            document.getElementById('resolved-count').textContent = data.resolved;
        });

    // Load All Complaints
    await loadComplaints('admin', user.id);
}

// ----- Shared: Load Complaints List -----
async function loadComplaints(role, userId, departmentId = null) {
    let url = `/api/complaints?role=${role}&user_id=${userId}`;
    if (departmentId) url += `&department_id=${departmentId}`;

    const response = await fetch(url);
    const complaints = await response.json();
    const listContainer = document.getElementById('complaints-list');
    listContainer.innerHTML = '';

    if (complaints.length === 0) {
        listContainer.innerHTML = '<p>No complaints found.</p>';
        return;
    }

    complaints.forEach(c => {
        const card = document.createElement('div');
        card.className = 'card';

        let actionsHtml = '';
        if (role === 'officer') {
            actionsHtml = `
                <div style="margin-top: 1rem; border-top: 1px solid #eee; padding-top: 1rem;">
                    <strong>Update Status:</strong>
                    <select id="status-${c.id}" class="form-input" style="width: auto; display: inline-block; margin: 0 0.5rem;">
                        <option value="Pending" ${c.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="In Progress" ${c.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Resolved" ${c.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                        <option value="Rejected" ${c.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                    </select>
                    <input type="text" id="comment-${c.id}" placeholder="Add remarks..." class="form-input" style="width: auto; display: inline-block;">
                    <button onclick="updateStatus(${c.id})" class="btn" style="width: auto; padding: 0.5rem 1rem;">Update</button>
                </div>
            `;
        }

        const deptName = c.departments ? c.departments.name : 'Unknown';
        const userName = c.profiles ? c.profiles.full_name : 'Unknown';

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <h3 style="margin-bottom: 0.5rem;">${c.title}</h3>
                    <p style="color: #666; font-size: 0.9rem;">
                        <strong>ID:</strong> #${c.id} | 
                        <strong>Dept:</strong> ${deptName} |
                        <strong>Date:</strong> ${formatDate(c.created_at)}
                    </p>
                    ${role !== 'citizen' ? `<p style="color: #666; font-size: 0.9rem;"><strong>By:</strong> ${userName}</p>` : ''}
                    <p style="margin-top: 0.5rem;">${c.description}</p>
                </div>
                <span class="status-badge status-${c.status.toLowerCase().replace(' ', '')}">
                    ${c.status}
                </span>
            </div>
            ${actionsHtml}
        `;
        listContainer.appendChild(card);
    });
}

// ----- Shared: Update Status API -----
async function updateStatus(complaintId) {
    const status = document.getElementById(`status-${complaintId}`).value;
    const comment = document.getElementById(`comment-${complaintId}`).value;

    try {
        const response = await fetch(`/api/complaints/${complaintId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status,
                comment,
                updated_by: user.id
            })
        });

        if (response.ok) {
            alert('Status updated!');
            loadOfficerDashboard(); // Reload
        } else {
            alert('Update failed');
        }
    } catch (err) {
        console.error(err);
    }
}
