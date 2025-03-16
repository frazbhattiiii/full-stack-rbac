import { User } from "../../db/entities/User";
import { Role } from "../../db/entities/Role";
import { Permission } from "../../db/entities/Permission";
import { MoreThanOrEqual } from "typeorm";

const getDashboardStats = async () => {
    // Get total counts
    const userCount = await User.count();
    const roleCount = await Role.count();
    const permissionCount = await Permission.count();
    
    // Get latest users for weekly comparison
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const newUsersThisWeek = await User.count({
        where: {
            createdAt: MoreThanOrEqual(oneWeekAgo)
        }
    });
    
    // Get recent activities
    const recentUsers = await User.find({
        order: {
            createdAt: 'DESC'
        },
        take: 5,
        select: ['id', 'name', 'email', 'createdAt']
    });
    
    // You would need to implement logging for role and permission changes
    // Here I'm just simulating it with dummy data
    
    return {
        stats: {
            users: {
                total: userCount,
                newThisWeek: newUsersThisWeek
            },
            roles: {
                total: roleCount,
                types: await Role.find({ select: ['name'] }).then(roles => 
                    roles.map(r => r.name)
                )
            },
            permissions: {
                total: permissionCount,
                newThisMonth: 3 // Simulated data - implement actual tracking if needed
            }
        },
        recentActivities: [
            ...recentUsers.map(user => ({
                type: 'user_registered',
                entity: 'user',
                data: {
                    name: user.name,
                    email: user.email
                },
                timestamp: user.createdAt
            }))
            // Additional activity types could be added here
        ]
    };
};

export { getDashboardStats };