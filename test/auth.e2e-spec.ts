import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "./../src/app.module";
import { WsAdapter } from "@nestjs/platform-ws";

describe("AuthController (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useWebSocketAdapter(new WsAdapter(app));

    await app.init();

    // TODO: schema:sync
  });

  afterAll(async () => {
    await app.close();

    // TODO: schema:drop
  });

  // TODO: 스키마 email, username, password 정리하기

  it("SUCCESS: /auth/username (GET)", () => {
    return request(app.getHttpServer())
      .get("/auth/username")
      .query({ email: "inwoo@gmail.com" })
      .expect(200)
      .expect("inwoo");
  });

  it("ERROR: /auth/username (GET) - wrong email", () => {
    return request(app.getHttpServer()).get("/auth/username").query({ email: "unknown@gmail.com" }).expect(404);
  });

  it("SUCCESS: /auth/sign-up (POST)", () => {
    return request(app.getHttpServer())
      .post("/auth/sign-up")
      .send({
        email: "zibra@bar.com",
        username: "cat",
        password: "strong password",
      })
      .expect(201)
      .expect("zibra@bar.com");
  });

  it("ERROR: /auth/sign-up (POST) - Duplicated Entry", () => {
    return request(app.getHttpServer())
      .post("/auth/sign-up")
      .send({
        email: "foo@bar.com",
        username: "sungmin",
        password: "buz",
      })
      .expect(409);
  });

  it("ERROR: /auth/sign-up (POST) - Missing field", () => {
    return request(app.getHttpServer())
      .post("/auth/sign-up")
      .send({
        email: "foo@bar.com",
        username: "sungmin",
        password: undefined,
      })
      .expect(404);
  });

  it("SUCCESS: /auth/sign-out (POST)", async () => {
    const signInResult = await request(app.getHttpServer()).post("/auth/sign-in").send({
      email: "foo@bar.com",
      password: "buz",
    });
    return request(app.getHttpServer())
      .post("/auth/sign-out")
      .send({
        token: signInResult.body.accessToken,
      })
      .expect(201)
      .expect("foo@bar.com");
  });

  it("ERROR: /auth/sign-out (POST) - no token", () => {
    return request(app.getHttpServer())
      .post("/auth/sign-out")
      .send({
        token: "Invalid token",
      })
      .expect(404);
  });

  it("SUCCESS: /auth/sign-in (POST)", async () => {
    const result = await request(app.getHttpServer()).post("/auth/sign-in").send({
      email: "foo@bar.com",
      password: "buz",
    });

    expect(result.status).toBe(201);
    expect(result.body).toMatchObject({
      email: "foo@bar.com",
      username: "sungmin",
    });
    expect(result.body).toHaveProperty("accessToken");
    expect(result.body).toHaveProperty("refreshToken");
  });

  it("ERROR: /auth/sign-in (POST) - duplicated sign-in", async () => {
    return request(app.getHttpServer())
      .post("/auth/sign-in")
      .send({
        email: "foo@bar.com",
        password: "buz",
      })
      .expect(401);
  });

  it("ERROR: /auth/sign-in (POST) - Invalid password", () => {
    return request(app.getHttpServer())
      .post("/auth/sign-in")
      .send({
        email: "foo@bar.com",
        password: "lorem",
      })
      .expect(401);
  });
});
