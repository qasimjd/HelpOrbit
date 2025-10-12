import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc, ownerAc, memberAc } from 'better-auth/plugins/organization/access';

/**
 * Define custom permissions for HelpOrbit application
 * Extends the default organization permissions with ticket and project management
 */
const statement = {
    ...defaultStatements,
    // Ticket management permissions
    ticket: ["create", "read", "update", "delete", "assign", "comment"],
    // Project management permissions  
    project: ["create", "read", "update", "delete", "share"],
    // Dashboard and analytics permissions
    dashboard: ["read", "manage"],
    // Settings and configuration permissions
    settings: ["read", "update"],
} as const;

// Create access control instance
export const ac = createAccessControl(statement);

/**
 * Define roles with specific permissions
 * Each role inherits default organization permissions and adds custom ones
 */

// Owner: Full access to everything
export const owner = ac.newRole({
    ...ownerAc.statements,
    ticket: ["create", "read", "update", "delete", "assign", "comment"],
    project: ["create", "read", "update", "delete", "share"],
    dashboard: ["read", "manage"],
    settings: ["read", "update"],
});

// Admin: Full access except organization deletion and owner transfer
export const admin = ac.newRole({
    ...adminAc.statements,
    ticket: ["create", "read", "update", "delete", "assign", "comment"],
    project: ["create", "read", "update", "delete", "share"],
    dashboard: ["read", "manage"],
    settings: ["read", "update"],
});

// Member: Standard user permissions
export const member = ac.newRole({
    ...memberAc.statements,
    ticket: ["create", "read", "update", "comment"],
    project: ["create", "read", "update"],
    dashboard: ["read"],
    settings: ["read"],
});

// Guest: Limited read-only access
export const guest = ac.newRole({
    // No default organization permissions for guests
    ticket: ["read"],
    project: ["read"],
    dashboard: ["read"],
    // No settings access
});

/**
 * Support Staff: Special role for support team members
 * Can manage tickets and help users but limited org management
 */
export const support = ac.newRole({
    ticket: ["create", "read", "update", "delete", "assign", "comment"],
    project: ["read"],
    dashboard: ["read"],
    // No member or invitation permissions for support
});

/**
 * Project Manager: Can manage projects and tickets within their scope
 */
export const projectManager = ac.newRole({
    ticket: ["create", "read", "update", "assign", "comment"],
    project: ["create", "read", "update", "delete", "share"],
    dashboard: ["read"],
    settings: ["read"],
    // No member management for project managers
});

// Export all roles for use in auth configuration
export const roles = {
    owner,
    admin,
    member,
    guest,
    support,
    projectManager,
} as const;

// Export role names as a type for TypeScript
export type RoleName = keyof typeof roles;

/**
 * Helper function to check if a role has specific permission
 */
export function hasRolePermission(
    role: RoleName
): boolean {
    // This would need to be implemented based on the role's statements
    // For now, return a basic check - this would need proper implementation
    return !!roles[role]; // Placeholder implementation
}

/**
 * Permission constants for easy reference
 */
export const PERMISSIONS = {
    ORGANIZATION: {
        UPDATE: { organization: ["update"] as ("update" | "delete")[] },
        DELETE: { organization: ["delete"] as ("update" | "delete")[] },
    },
    MEMBER: {
        CREATE: { member: ["create"] as ("create" | "update" | "delete")[] },
        UPDATE: { member: ["update"] as ("create" | "update" | "delete")[] },
        DELETE: { member: ["delete"] as ("create" | "update" | "delete")[] },
    },
    INVITATION: {
        CREATE: { invitation: ["create"] as ("create" | "cancel")[] },
        CANCEL: { invitation: ["cancel"] as ("create" | "cancel")[] },
    },
    TICKET: {
        CREATE: { ticket: ["create"] },
        READ: { ticket: ["read"] },
        UPDATE: { ticket: ["update"] },
        DELETE: { ticket: ["delete"] },
        ASSIGN: { ticket: ["assign"] },
        COMMENT: { ticket: ["comment"] },
    },
    PROJECT: {
        CREATE: { project: ["create"] },
        READ: { project: ["read"] },
        UPDATE: { project: ["update"] },
        DELETE: { project: ["delete"] },
        SHARE: { project: ["share"] },
    },
    DASHBOARD: {
        READ: { dashboard: ["read"] },
        MANAGE: { dashboard: ["manage"] },
    },
    SETTINGS: {
        READ: { settings: ["read"] },
        UPDATE: { settings: ["update"] },
    },
};

export default ac;