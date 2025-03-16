import dataSource from "../db/db-source";
import { Profile } from "../db/entities/Profile";
import { Role } from "../db/entities/Role";
import { User } from "../db/entities/User";
import { NSUser } from "../types/user";
import jwt from "jsonwebtoken";
import { In } from "typeorm";
import bcrypt from "bcrypt";

const login = async (email: string, password: string) => {
  try {
    // 1) Find user by email
    const user = await User.findOneBy({ email });
    if (!user) {
      return {
        status: "error",
        code: 401,
        message: "Invalid email or password!",
      };
    }

    // 2) Compare the given password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        status: "error",
        code: 401,
        message: "Invalid email or password!",
      };
    }

    // 3) If valid, create and return JWT
    const token = jwt.sign(
      {
        email: user.email,
        name: user.name,
        id: user.id,
        type: user.type,
      },
      process.env.SECRET_KEY || "",
      {
        expiresIn: "2w",
      }
    );

    return {
      status: "success",
      code: 200,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          type: user.type,
        },
      },
    };
  } catch (error) {
    return {
      status: "error",
      code: 500,
      message: "An error occurred during authentication",
    };
  }
};

const createUser = async (payload: NSUser.Item) => {
  return dataSource.manager.transaction(async (transaction) => {
    const [firstName, ...lastName] = payload.name.split(" ");
    const profile = Profile.create({
      firstName,
      lastName: lastName.join(" "),
      status: payload?.status,
    });
    await transaction.save(profile);
    const newUser = User.create(payload);
    const roles = await Role.find({ where: { name: newUser?.type || "user" } });
    newUser.roles = roles;
    newUser.profile = profile;
    await transaction.save(newUser);
  });
};

const getUser = (payload: { id: string }) => {
  return User.findOne({
    where: { id: payload.id },
    relations: ["roles", "roles.permissions"],
  });
};

const getUsers = async (
  payload: {
    page: string;
    pageSize: string;
  },
  user: User
) => {
  const page = parseInt(payload.page);
  const pageSize = parseInt(payload.pageSize);
  const roles = user.roles;
  const permissions: string[] = [];

  const hasAdminPermission = roles.some((role) =>
    role.permissions.some((permission) => permission.name === "READ_admins")
  );

  const hasUserPermission = roles.some((role) =>
    role.permissions.some((permission) => permission.name === "READ_users")
  );

  const hasOwnerPermission = roles.some((role) =>
    role.permissions.some((permission) => permission.name === "READ_owners")
  );

  if (hasAdminPermission) {
    permissions.push("admin");
  }
  if (hasUserPermission) {
    permissions.push("user");
  }
  if (hasOwnerPermission) {
    permissions.push("owner");
  }

  console.log(permissions);

  const [users, total] = await User.findAndCount({
    skip: pageSize * (page - 1),
    take: pageSize,
    where: { type: In(permissions) },
    order: {
      createdAt: "ASC",
    },
  });

  return {
    page,
    pageSize: users.length,
    total,
    users,
  };
};

const editUser = async (
  payload: { roleId: string; userId: string },
  currentUser: User
) => {
  const user = await User.findOne({
    where: { id: payload.userId },
    relations: ["roles"],
  });
  const role = await Role.findOne({ where: { id: payload.roleId } });
  const roles = currentUser.roles;

  const hasEditPermission = roles.some((role) =>
    role.permissions.some(
      (permission) => permission.name === `EDIT_${user?.type}`
    )
  );

  if (!hasEditPermission) {
    return `You don't have a permission to edit ${user?.type}`;
  }

  if (user && role) {
    const hasRole = user.roles.some(
      (existingRole) => existingRole.id === role.id
    );

    if (!hasRole) {
      user.roles.push(role);
      return user.save();
    } else {
      return "User already has this role.";
    }
  } else {
    if (!user) {
      return "User not found :(";
    } else {
      return "Role not found :(";
    }
  }
};

const deleteUser = async (userId: string, currentUser: User) => {
  const user = await User.findOne({
    where: { id: userId },
    relations: ["roles", "roles.permissions"],
  });
  const roles = currentUser?.roles;

  const hasDeletePermission = roles?.some((role) =>
    role.permissions.some(
      (permission) => permission.name === `DELETE_${user?.type}`
    )
  );

  if (!hasDeletePermission) {
    return `You don't have a permission to delete ${user?.type}`;
  }

  return User.delete(userId);
};

export { createUser, editUser, getUser, login, getUsers, deleteUser };
