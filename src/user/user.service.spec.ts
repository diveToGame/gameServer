import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service";
import { UserEntity } from "./entity/user.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UserVO } from "./vo/user.vo";
import { InsertResult } from "typeorm";
import { ConflictException, UnprocessableEntityException } from "@nestjs/common";
import { AssertionError, fail } from "assert";

const mockUserEntityRepository = () => ({
  findOne: jest.fn().mockImplementation((query) =>
    Promise.resolve({
      email: query.where.email,
      username: "inwoo",
      password: "1234",
    })
  ),
  insert: jest.fn().mockImplementation((user) => {
    if (user.email === "inwoo@naver.com") {
      Promise.resolve(new InsertResult());
    } else if (user.email === "duplicated@email.com") {
      throw { code: "ER_DUP_ENTRY" };
    } else {
      throw { code: "ER_NO_DEFAULT_FOR_FIELD" };
    }
  }),
});

describe("UserService", () => {
  let service: UserService;

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
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("findOne: should find user", async () => {
    const result = {
      email: "inwoo@naver.com",
      username: "inwoo",
      password: "1234",
    };
    expect(await service.findOne(result.email)).toEqual(result);
  });

  it("insert: should return email", async () => {
    const mockUser: UserVO = {
      email: "inwoo@naver.com",
      username: "inwoo",
      password: "1234",
    };
    const result = "inwoo@naver.com";
    expect(await service.insert(mockUser)).toEqual(result);
  });

  it("insert: should throw ER_DUP_ENTRY", async () => {
    const mockUser: UserVO = {
      email: "duplicated@email.com",
      username: "inwoo",
      password: "1234",
    };
    try {
      await service.insert(mockUser);

      fail("Error did not throw");
    } catch (error) {
      if (error instanceof AssertionError) {
        throw error;
      }
      expect(error).toBeInstanceOf(ConflictException);
    }
  });

  it("insert: should throw ER_NO_DEFAULT_FOR_FIELD", async () => {
    const mockUser: UserVO = {
      email: "foo@bar.com",
      username: "inwoo",
      password: "1234",
    };
    try {
      await service.insert(mockUser);

      fail("Error did not throw");
    } catch (error) {
      if (error instanceof AssertionError) {
        throw error;
      }
      expect(error).toBeInstanceOf(UnprocessableEntityException);
    }
  });
});
