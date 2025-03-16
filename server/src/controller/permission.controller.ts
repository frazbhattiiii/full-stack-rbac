import { In } from "typeorm"
import { Permission } from "../db/entities/Permission"
import { Role } from "../db/entities/Role"
import { NSPermission } from "../types/permission"

const createPermission = async (payload: NSPermission.Item) => {
    // Check if permission with same name already exists
    const existingPermission = await Permission.findOne({ 
        where: { name: payload.name } 
    });
    
    if (existingPermission) {
        throw new Error(`Permission with name '${payload.name}' already exists`);
    }
    
    const newPermission = Permission.create(payload);
    return newPermission.save();
}

export { createPermission }