import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { UserService } from "src/user/user.service";
import { ConfigService } from "@nestjs/config";

const result = {
  email: "inwoo@naver.com",
  username: "inwoo",
  password: "1234",
};

const mockUserService = () => ({
  findOne: jest.fn().mockImplementation(() => Promise.resolve(result)),
  insert: jest.fn(),
});

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, JwtService, ConfigService, { provide: UserService, useValue: mockUserService() }],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
