import { Test, TestingModule } from "@nestjs/testing";
import { LobbyGateway } from "./lobby.gateway";
import { AuthService } from "src/auth/auth.service";

const mockAuthService = () => ({
  getUsername: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
  signUp: jest.fn(),
  validateToken: jest.fn(),
  regenerateToken: jest.fn(),
});

describe("LobbyGateway", () => {
  let gateway: LobbyGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LobbyGateway,
        {
          provide: AuthService,
          useValue: mockAuthService(),
        },
      ],
    }).compile();

    gateway = module.get<LobbyGateway>(LobbyGateway);
  });

  it("should be defined", () => {
    expect(gateway).toBeDefined();
  });
});
