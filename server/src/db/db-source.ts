import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Role } from "./entities/Role";
import { Permission } from "./entities/Permission";
import { Profile } from "./entities/Profile";

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST_NAME,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER_NAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Role, Permission, Profile],
  synchronize: true,
  logging: false
});

dataSource.initialize().then(() => {
  console.log("Connected to DB!");
}).catch(err => {
  console.error('Failed to connect to DB: ' + err);
});

export default dataSource;