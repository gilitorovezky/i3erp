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