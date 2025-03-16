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

export { createRole }