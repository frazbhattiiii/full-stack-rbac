/**
 * src/seed.ts
 */
import dataSource from './src/db/db-source';
import { Permission } from './src/db/entities/Permission';
import { Role } from './src/db/entities/Role';
import { User } from './src/db/entities/User';
import { Profile } from './src/db/entities/Profile';
import 'dotenv/config';

// You might already have these service functions or something similar
// but let's assume a direct approach for seeding.
const seed = async () => {
  try {
    // 1) Initialize DB connection
    await dataSource.initialize();
    console.log("Connected to DB, starting seeding...");

    // 2) Create a list of permissions we want in the system
    //    Adjust these to match your real use-cases
    const permissionNames = [
      'READ_users',
      'EDIT_users',
      'DELETE_users',
      'CREATE_users',

      'READ_admins',
      'EDIT_admins',
      'DELETE_admins',
      'CREATE_admins',
    ];

    // 3) Upsert them (create if they don’t exist)
    const permissionsToSave: Permission[] = [];
    for (const permName of permissionNames) {
      let permission = await Permission.findOne({ where: { name: permName } });
      if (!permission) {
        permission = Permission.create({
          name: permName,
        });
        permissionsToSave.push(permission);
      }
    }
    await Permission.save(permissionsToSave);
    console.log("Permissions seeded/updated.");

    // 4) Now, fetch the newly created (or existing) permissions
    const allPermissions = await Permission.find();

    // 5) Create roles and attach the relevant permissions
    // For example: admin gets everything, user gets only read, etc.
    let adminRole = await Role.findOne({ where: { name: 'admin' }, relations: ['permissions'] });
    if (!adminRole) {
      adminRole = Role.create({
        name: 'admin',
      });
    }
    adminRole.permissions = allPermissions; // admin can do all
    await adminRole.save();

    // “user” role: only read permissions on users
    let userRole = await Role.findOne({ where: { name: 'user' }, relations: ['permissions'] });
    if (!userRole) {
      userRole = Role.create({
        name: 'user',
      });
    }
    userRole.permissions = allPermissions.filter(p => p.name.startsWith('READ_'));
    await userRole.save();

    console.log("Roles seeded/updated.");

    // 6) (Optional) Create a default admin user if one doesn’t exist
    //    so you can log in and manage the system right away.
    const adminEmail = 'admin@example.com';
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });
    if (!existingAdmin) {
      const profile = Profile.create({
        firstName: 'Default',
        lastName: 'Admin',
        dateOfBirth: '1990-01-01',
        status: 'Accepted'
      });
      await profile.save();

      const newAdmin = User.create({
        email: adminEmail,
        name: 'Default Admin',
        password: 'admin123',
        type: 'admin',  // matches your code logic if you want the 'admin' role
        profile,
      });

      // assign the admin role
      newAdmin.roles = [adminRole];
      await newAdmin.save();
      console.log(`Default admin user created: email=${adminEmail}, name="Default Admin"`);
    } else {
      console.log(`Admin user already exists with email: ${adminEmail}`);
    }

    console.log("Seeding complete.");
    // 7) Exit or close the connection if this is a standalone script
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

// Run the function if this file is called directly
seed();
