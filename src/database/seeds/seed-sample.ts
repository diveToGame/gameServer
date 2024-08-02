import { UserEntity } from "../../user/entity/user.entity";

import { DataSource } from "typeorm";
import { Seeder } from "typeorm-extension";

export default class UserSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const userRepository = dataSource.getRepository(UserEntity);
    console.log("USER REPO: ", userRepository);
    await userRepository.insert([
      {
        email: "inwoo@gmail.com",
        username: "inwoo",
        password: "1234",
      },
    ]);
  }
}
