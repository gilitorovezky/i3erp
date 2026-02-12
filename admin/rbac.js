// ============================================
// API ENDPOINTS
// ============================================

// GET /api/user/permissions/:userId
// Returns complete permissions for a user
/*
router.get('/api/user/permissions/:userId', async (req, res) => {
    const userId = req.params.userId;
    
    try {
        // Get user and their role
        const [user] = await db.query(`
            SELECT u.user_id, u.username, u.email, r.role_id, r.role_name
            FROM users u
            JOIN roles r ON u.role_id = r.role_id
            WHERE u.user_id = ?
        `, [userId]);
        
        if (!user || user.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const roleId = user[0].role_id;
        
        // Get navigation permissions
        const navItems = await db.query(`
            SELECT n.nav_id, n.nav_key, n.nav_label, n.nav_icon, n.nav_order
            FROM nav_items n
            JOIN nav_permissions np ON n.nav_id = np.nav_id
            WHERE np.role_id = ? AND n.is_active = TRUE
            ORDER BY n.nav_order
        `, [roleId]);
        
        // Get module permissions
        const modules = await db.query(`
            SELECT m.module_id, m.module_key, m.module_name, mp.permission_level
            FROM modules m
            JOIN module_permissions mp ON m.module_id = mp.module_id
            WHERE mp.role_id = ? AND m.is_active = TRUE
        `, [roleId]);
        
        res.json({
            user: user[0],
            navigation: navItems,
            modules: modules
        });
        
    } catch (error) {
        console.error('Error fetching permissions:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/roles
// Get all roles
router.get('/api/roles', async (req, res) => {
    const roles = await db.query('SELECT * FROM roles WHERE is_active = TRUE');
    res.json(roles);
}); */


// Define roles and permissions
const roles = {
    admin: ["read", "write", "delete"],
    editor: ["read", "write"],
    viewer: ["read"],
  };
  
  // Check if a user has permission
  function hasPermission(role, permission) {
    return roles[role]?.includes(permission);
  }
  
  // Example usage
  const userRole = "editor";
  
  if (hasPermission(userRole, "write")) {
    // Allow user to write data
  } else {
    // Deny access
  }