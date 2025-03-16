import express from "express"
import { Role } from "../db/entities/Role"
import { NSRole } from "../types/role"
import { Permission } from "../db/entities/Permission"
import { In } from "typeorm"
import { User } from "../db/entities/User"

const createRole = async (payload: NSRole.Item) => {
    // Check if a role with the same name already exists
    const existingRole = await Role.findOne({ 
        where: { name: payload.name },
        relations: ['permissions']
    });
    
    if (existingRole) {
        // If role with same name exists, check if permissions are different
        const permissions = await Permission.find({
            where: { id: In(payload.permissionsId) },
        });
        
        // Convert permission arrays to sets of IDs for comparison
        const existingPermissionIds = new Set(existingRole.permissions.map(p => p.id));
        const newPermissionIds = new Set(permissions.map(p => p.id));
        
        // Check if permission sets have the same size and all elements match
        const sameSize = existingPermissionIds.size === newPermissionIds.size;
        const allMatch = [...existingPermissionIds].every(id => newPermissionIds.has(id));
        
        if (sameSize && allMatch) {
            // Same role with same permissions already exists
            throw new Error(`Role with name '${payload.name}' and identical permissions already exists`);
        }
        
        // Role exists but with different permissions
        throw new Error(`Role with name '${payload.name}' already exists`);
    }
    
    // Create new role if it doesn't exist
    const newRole = Role.create(payload);
    newRole.users = await User.find({
        where: { id: In(payload.usersId || []) },
    });
    
    const permissions = await Permission.find({
        where: { id: In(payload.permissionsId) },
    });

    newRole.permissions = permissions;
    return newRole.save();
}

const deleteRole = async (id: string) => {
    const role = await Role.findOne({
        where: { id },
        relations: ['users', 'permissions']
    });
    
    if (!role) {
        throw new Error(`Role with ID '${id}' not found`);
    }
    
    // Check if this role is assigned to any users
    if (role.users && role.users.length > 0) {
        throw new Error(`Cannot delete role '${role.name}' because it is assigned to ${role.users.length} user${role.users.length > 1 ? 's' : ''}`);
    }
    
    // Remove all permission associations
    role.permissions = [];
    await role.save();
    
    // Now delete the role
    await role.remove();
    return { success: true, message: `Role '${role.name}' deleted successfully` };
};

const getAllRoles = async () => {
    // Fetch all roles with their permissions
    return Role.find({
      relations: ['permissions'],
      order: {
        createdAt: 'DESC'
      }
    });
  }

export { createRole, getAllRoles, deleteRole }