import { In } from "typeorm";
import { Permission } from "../db/entities/Permission";
import { Role } from "../db/entities/Role";
import { NSPermission } from "../types/permission";

const createPermission = async (payload: NSPermission.Item) => {
  // Check if permission with same name already exists
  const existingPermission = await Permission.findOne({
    where: { name: payload.name },
  });

  if (existingPermission) {
    throw new Error(`Permission with name '${payload.name}' already exists`);
  }

  const newPermission = Permission.create(payload);
  return newPermission.save();
};

const getAllPermissions = async () => {
  // Return all permissions ordered by creation date (newest first)
  return Permission.find({
    order: {
      createdAt: "DESC",
    },
  });
};

const getPermissionById = async (id: string) => {
  const permission = await Permission.findOne({
    where: { id },
    relations: ["roles"],
  });

  if (!permission) {
    throw new Error(`Permission with ID '${id}' not found`);
  }

  return permission;
};

const deletePermission = async (id: string) => {
  const permission = await Permission.findOne({
    where: { id },
    relations: ["roles"],
  });

  if (!permission) {
    throw new Error(`Permission with ID '${id}' not found`);
  }

  // Check if this permission is used in roles
  // We can still delete, but we'll return info about affected roles
  const affectedRoles = permission.roles ? [...permission.roles] : [];

  // Remove this permission from all roles
  if (permission.roles && permission.roles.length > 0) {
    for (const role of permission.roles) {
      role.permissions = role.permissions.filter((p) => p.id !== permission.id);
      await role.save();
    }
  }

  // Now delete the permission
  await permission.remove();

  return {
    success: true,
    message: `Permission '${permission.name}' deleted successfully`,
    affectedRoles: affectedRoles.map((role) => ({
      id: role.id,
      name: role.name,
    })),
  };
};

export {
  createPermission,
  getAllPermissions,
  getPermissionById,
  deletePermission,
};
