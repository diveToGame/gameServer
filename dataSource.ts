import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { UserEntity } from "./src/user/entity/user.entity";

dotenv.config({ path: "./.env.development.local" });

const dataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  entities: [UserEntity],
  migrations: [__dirname + "/src/migrations/*.ts"],
  synchronize: true,
  logging: false,
});

export default dataSource;
