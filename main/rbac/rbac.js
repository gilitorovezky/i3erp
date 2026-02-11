// ============================================
// PERMISSION MANAGER CLASS
// ============================================
class PermissionManager {
    constructor() {
        this.user = null;
        this.navigation = [];
        this.modules = {};
        this.loaded = false;
    }

    /**
     * Load permissions from server
     */
    async loadPermissions(userId) {
        try {
            const response = await fetch(`/api/user/permissions/${userId}`);
            const data = await response.json();
            
            this.user = data.user;
            this.navigation = data.navigation;
            
            // Convert modules array to object for easy lookup
            this.modules = {};
            data.modules.forEach(mod => {
                this.modules[mod.module_key] = {
                    id: mod.module_id,
                    name: mod.module_name,
                    permission: mod.permission_level
                };
            });
            
            this.loaded = true;
            
            // Store in session for quick access
            sessionStorage.setItem('permissions', JSON.stringify({
                user: this.user,
                navigation: this.navigation,
                modules: this.modules
            }));
            
            return this;
            
        } catch (error) {
            console.error('Error loading permissions:', error);
            throw error;
        }
    }

    /**
     * Load from session storage (faster)
     */
    loadFromSession() {
        const stored = sessionStorage.getItem('permissions');
        if (stored) {
            const data = JSON.parse(stored);
            this.user = data.user;
            this.navigation = data.navigation;
            this.modules = data.modules;
            this.loaded = true;
            return true;
        }
        return false;
    }

    /**
     * Check if user has access to a module
     */
    canAccessModule(moduleKey) {
        return moduleKey in this.modules;
    }

    /**
     * Check permission level for a module
     */
    getModulePermission(moduleKey) {
        return this.modules[moduleKey]?.permission || null;
    }

    /**
     * Check if user can write to a module
     */
    canWriteModule(moduleKey) {
        const permission = this.getModulePermission(moduleKey);
        return permission === 'write' || permission === 'admin';
    }

    /**
     * Check if user can read a module
     */
    canReadModule(moduleKey) {
        const permission = this.getModulePermission(moduleKey);
        return permission !== null;
    }

    /**
     * Check if user is admin for a module
     */
    isModuleAdmin(moduleKey) {
        return this.getModulePermission(moduleKey) === 'admin';
    }

    /**
     * Get allowed navigation items
     */
    getNavigation() {
        return this.navigation;
    }

    /**
     * Get user info
     */
    getUser() {
        return this.user;
    }

    /**
     * Clear permissions (logout)
     */
    clear() {
        this.user = null;
        this.navigation = [];
        this.modules = {};
        this.loaded = false;
        sessionStorage.removeItem('permissions');
    }
}

// ============================================
// GLOBAL INSTANCE
// ============================================
const permissions = new PermissionManager();


// ============================================
// NAVIGATION BUILDER WITH DB PERMISSIONS
// ============================================
class NavigationBuilder {
    constructor(permissionManager) {
        this.permissions = permissionManager;
    }

    build(navId = 'navID') {
        const nav = document.getElementById(navId);
        if (!nav) {
            console.error(`Navigation element #${navId} not found`);
            return this;
        }

        if (!this.permissions.loaded) {
            console.error('Permissions not loaded');
            return this;
        }

        const user = this.permissions.getUser();
        const navItems = this.permissions.getNavigation();

        // Create container div
        const div = document.createElement('div');

        // Add logo
        const logo = document.createElement('img');
        logo.alt = 'Y9';
        logo.src = '../misc/y9-logo.png';
        div.appendChild(logo);

        // Add welcome/user name
        const welcomeLink = document.createElement('a');
        welcomeLink.tabIndex = 1;
        welcomeLink.id = 'welcomeNameID';
        welcomeLink.className = 'fas fa-user';
        welcomeLink.textContent = ` ${user.username}`;
        div.appendChild(welcomeLink);

        // Add h1 (title placeholder)
        const h1 = document.createElement('h1');
        div.appendChild(h1);

        // Add navigation items from database
        navItems.forEach((item, index) => {
            const link = document.createElement('a');
            link.tabIndex = index + 2;
            link.id = item.nav_key;
            link.className = `fas ${item.nav_icon}`;
            link.title = item.nav_label;
            link.setAttribute('data-nav-id', item.nav_id);
            div.appendChild(link);
        });

        // Add logout (always visible)
        const logoutLink = document.createElement('a');
        logoutLink.tabIndex = navItems.length + 2;
        logoutLink.id = 'logout';
        logoutLink.className = 'fas fa-sign-out-alt';
        logoutLink.title = 'Logout';
        div.appendChild(logoutLink);

        // Clear and add new content
        nav.innerHTML = '';
        nav.appendChild(div);

        return this;
    }
}

// ============================================
// MODULE ACCESS CONTROL
// ============================================
function displayModule(moduleKey, projectNumber, targetDisplay) {
    // Check if user has access
    if (!permissions.canAccessModule(moduleKey)) {
        showAccessDenied(moduleKey);
        return;
    }

    // Get permission level
    const permissionLevel = permissions.getModulePermission(moduleKey);
    
    // Render the module
    const result = classArray[moduleKey].render(
        moduleKey,
        projectNumber,
        targetDisplay
    );

    // Render rows with permission-based controls
    result.data.forEach(item => {
        renderModuleRow(item, permissionLevel);
    });
}

function renderModuleRow(item, permissionLevel) {
    // Show different controls based on permission
    let controls = '';
    
    if (permissionLevel === 'admin' || permissionLevel === 'write') {
        controls = `
            <button onclick="editItem(${item.id})">Edit</button>
            <button onclick="deleteItem(${item.id})">Delete</button>
        `;
    } else if (permissionLevel === 'read') {
        controls = `<button onclick="viewItem(${item.id})">View</button>`;
    }
    
    // Render row with appropriate controls
    const rowHTML = `
        <tr>
            <td>${item.name}</td>
            <td>${item.description}</td>
            <td>${controls}</td>
        </tr>
    `;
    
    document.querySelector('#result-table tbody').insertAdjacentHTML('beforeend', rowHTML);
}

function showAccessDenied(moduleKey) {
    const message = `
        <div class="access-denied">
            <h2>Access Denied</h2>
            <p>You do not have permission to access the ${moduleKey} module.</p>
            <p>Please contact your administrator if you need access.</p>
        </div>
    `;
    document.getElementById('result-table1').innerHTML = message;
}

// ============================================
// APP INITIALIZATION
// ============================================
let navigationBuilder;

async function initializeApp() {
    try {
        // Get current user ID (from login session)
        const userId = getCurrentUserId(); // Your auth function
        
        if (!userId) {
            window.location.href = 'login.html';
            return;
        }

        // Try to load from session first (faster)
        if (!permissions.loadFromSession()) {
            // Not in session, load from server
            await permissions.loadPermissions(userId);
        }

        // Build navigation
        navigationBuilder = new NavigationBuilder(permissions);
        navigationBuilder.build();

        // Setup event listeners
        setupNavigationListeners();
        
        // Load initial module if user has access
        loadDefaultModule();
        
    } catch (error) {
        console.error('Failed to initialize app:', error);
        window.location.href = 'login.html';
    }
}

function setupNavigationListeners() {
    // Logout
    document.getElementById('logout')?.addEventListener('click', handleLogout);
    
    // Navigation items - only add listeners to items that exist
    const navItems = permissions.getNavigation();
    navItems.forEach(item => {
        const element = document.getElementById(item.nav_key);
        if (element) {
            element.addEventListener('click', () => handleNavClick(item.nav_key));
        }
    });
}

function handleNavClick(navKey) {
    // Map nav keys to actions
    const navActions = {
        'rootID': () => window.location.href = 'dashboard.html',
        'libraryID': () => loadModule('employee-jobs'),
        'configID': () => window.location.href = 'config.html',
        'systemID': () => window.location.href = 'system.html',
        'reportsID': () => loadModule('reports')
    };
    
    const action = navActions[navKey];
    if (action) {
        action();
    }
}

function loadModule(moduleKey) {
    if (permissions.canAccessModule(moduleKey)) {
        displayModule(moduleKey, 0, '#result-table1');
    } else {
        showAccessDenied(moduleKey);
    }
}

function loadDefaultModule() {
    // Load first accessible module
    const moduleKeys = Object.keys(permissions.modules);
    if (moduleKeys.length > 0) {
        loadModule(moduleKeys[0]);
    }
}

function handleLogout() {
    permissions.clear();
    sessionStorage.clear();
    window.location.href = 'login.html';
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);

// ============================================
// EXAMPLE USAGE
// ============================================

// Check before displaying a module
function displayEmployeeJobs(projectNumber) {
    const moduleKey = 'employee-jobs';
    
    if (!permissions.canAccessModule(moduleKey)) {
        showAccessDenied(moduleKey);
        return;
    }
    
    const result = classArray[moduleKey].render(
        moduleKey,
        projectNumber,
        '#result-table1'
    );
    
    // Render with appropriate permissions
    const canWrite = permissions.canWriteModule(moduleKey);
    result.data.forEach(job => {
        renderJobRow(job, canWrite);
    });
}

// Check before allowing edits
function editEmployeeJob(jobId) {
    if (!permissions.canWriteModule('employee-jobs')) {
        alert('You do not have permission to edit jobs');
        return;
    }
    
    // Proceed with edit
    // ...
}

// Check before deleting
function deleteEmployeeJob(jobId) {
    if (!permissions.isModuleAdmin('employee-jobs')) {
        alert('Only administrators can delete jobs');
        return;
    }
    
    // Proceed with delete
    // ...
}

// Conditionally show buttons
function renderJobRow(job, canWrite) {
    const editButton = canWrite 
        ? `<button onclick="editEmployeeJob(${job.id})">Edit</button>`
        : '';
    
    const deleteButton = permissions.isModuleAdmin('employee-jobs')
        ? `<button onclick="deleteEmployeeJob(${job.id})">Delete</button>`
        : '';
    
    return `
        <tr>
            <td>${job.name}</td>
            <td>${job.description}</td>
            <td>${editButton} ${deleteButton}</td>
        </tr>
    `;
}