import * as bcrypt from "bcryptjs";

import { Test, TestingModule } from "@nestjs/testing";
import { JwtService, JwtSignOptions, JwtVerifyOptions } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { UserService } from "src/user/user.service";
import { ConfigService } from "@nestjs/config";
import { UnauthorizedException } from "@nestjs/common";
import { AssertionError, fail } from "assert";
import { UserVO } from "src/user/vo/user.vo";

const result = async () => ({
  email: "inwoo@naver.com",
  username: "inwoo",
  password: await bcrypt.hash("1234", bcrypt.genSaltSync()),
});

const validToken = {
  email: "inwoo@naver.com",
  username: "inwoo",
};

const mockUserService = () => ({
  findOne: jest.fn().mockImplementation(async (email) => {
    if (email === "inwoo@naver.com") return await result();
  }),
  insert: jest.fn().mockImplementation(async (user: UserVO) => {
    return Promise.resolve(user.email);
  }),
});

const mockJwtService = () => ({
  signAsync: jest.fn().mockImplementation(async (payload: { email; username }, options?: JwtSignOptions) => {
    return Promise.resolve(`${payload.email}-${payload.username}`);
  }),
  verifyAsync: jest.fn().mockImplementation(async (token: string, options?: JwtVerifyOptions) => {
    if (token !== `${validToken.email}-${validToken.username}`) throw new Error("invalid token");

    return { ...validToken };
  }),
});

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        ConfigService,
        { provide: JwtService, useValue: mockJwtService() },
        { provide: UserService, useValue: mockUserService() },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("getUsername: should return username", async () => {
    expect(await service.getUsername("inwoo@naver.com")).toBe("inwoo");
  });

  it("signIn: shoud return tokens", async () => {
    const expected = {
      email: "inwoo@naver.com",
      username: "inwoo",
      accessToken: `${"inwoo@naver.com"}-${"inwoo"}`,
      refreshToken: `${"inwoo@naver.com"}-${"inwoo"}`,
    };
    const result = await service.signIn({ email: "inwoo@naver.com", password: "1234" });

    expect(result).toMatchObject(expected);
  });

  it("signIn: should throw duplicated sign-in", async () => {
    expect(await service.signIn({ email: "inwoo@naver.com", password: "1234" }));
    try {
      expect(await service.signIn({ email: "inwoo@naver.com", password: "1234" }));

      fail("Multiple login Accepted!");
    } catch (err) {
      if (err instanceof AssertionError) throw err;
      expect(err).toBeInstanceOf(UnauthorizedException);
    }
  });

  it("signIn: should throw wrong password", async () => {
    try {
      expect(await service.signIn({ email: "inwoo@naver.com", password: "5678" }));

      fail("Wrong password Accepted!");
    } catch (err) {
      if (err instanceof AssertionError) throw err;
      expect(err).toBeInstanceOf(UnauthorizedException);
    }
  });

  it("signOut: should return email", async () => {
    await service.signIn({ email: "inwoo@naver.com", password: "1234" });
    expect(service.signOut(`${"inwoo@naver.com"}-${"inwoo"}`)).toBe("inwoo@naver.com");
  });

  it("signOut: should not accept sign-out without sign-in", async () => {
    expect(() => service.signOut("diff-token")).toThrow();
  });

  it("signUp: should return email", async () => {
    expect(await service.signUp({ email: "inwoo@naver.com", username: "inwoo", password: "1234" })).toBe(
      "inwoo@naver.com"
    );
  });

  it("validateToken: should verify token for log-in user", async () => {
    await service.signIn({ email: "inwoo@naver.com", password: "1234" });
    expect(await service.validateToken(`${"inwoo@naver.com"}-${"inwoo"}`)).toBe(true);
  });

  it("validateToken: should return false for log-out user", async () => {
    await service.signIn({ email: "inwoo@naver.com", password: "1234" });
    service.signOut(`${"inwoo@naver.com"}-${"inwoo"}`);
    expect(await service.validateToken(`${"inwoo@naver.com"}-${"inwoo"}`)).toBe(false);
  });

  it("validateToken: should throw for invalid token", async () => {
    try {
      await service.validateToken("diff-token");

      fail("Invalid token verified!");
    } catch (error) {
      if (error instanceof AssertionError) throw error;
      expect(error).toBeInstanceOf(UnauthorizedException);
    }
  });

  it("regenerateTokens: should return SignInResponseDTO", async () => {
    const expected = {
      email: "inwoo@naver.com",
      username: "inwoo",
      accessToken: `${"inwoo@naver.com"}-${"inwoo"}`,
      refreshToken: `${"inwoo@naver.com"}-${"inwoo"}`,
    };
    await service.signIn({ email: expected.email, password: "1234" });
    expect(await service.regenerateTokens(`${validToken.email}-${validToken.username}`)).toEqual(expected);
  });

  it("regenerateTokens: should throw for anonymous", async () => {
    try {
      await service.regenerateTokens(`${validToken.email}-${validToken.username}`);

      fail("Anonymous has token!");
    } catch (err) {
      if (err instanceof AssertionError) throw err;
      expect(err).toBeInstanceOf(UnauthorizedException);
    }
  });
});
