import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service";
import { UserEntity } from "./entity/user.entity";
import { Repository } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";

const mockUserEntityRepository = () => ({
  email: "inwoo@naver.com",
  username: "inwoo",
  password: "1234",
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe("UserService", () => {
  let service: UserService;
  let userEntityRepository: MockRepository<UserEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserEntityRepository(),
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userEntityRepository = module.get<MockRepository<UserEntity>>(getRepositoryToken(UserEntity));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
