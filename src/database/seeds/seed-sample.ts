import { UserEntity } from "../../user/entity/user.entity";

import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";

export default class UserSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<any> {
    const userRepository = dataSource.getRepository(UserEntity);
    console.log("USER REPO: ", userRepository);
    await userRepository.insert([
      {
        email: "inwoo@gmail.com",
        username: "inwoo",
        password: "1234",
      }
    ])
  }
}