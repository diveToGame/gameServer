import { INestApplicationContext } from "@nestjs/common";
import { HOST, PORT } from "./constants";
import { AsyncApiDocument, AsyncApiDocumentBuilder, AsyncApiModule, AsyncServerObject } from "nestjs-asyncapi";
import { LobbyModule } from "./gateway/lobby/lobby.module";

export async function makeAsyncapiDocument(app: INestApplicationContext): Promise<AsyncApiDocument> {
  const asyncApiServer: AsyncServerObject = {
    url: `ws://${HOST}:${PORT}`,
    protocol: "ws",
    protocolVersion: "1.0",
    description: "Allows you to connect using the websocket protocol to our ws server.",
    security: [{ "user-password": [] }],
    variables: {
      port: {
        description: "Secure connection (TLS) is available through port 443.",
        default: "443",
      },
    },
    bindings: {},
  };

  const asyncApiOptions = new AsyncApiDocumentBuilder()
    .setTitle("Feline")
    .setDescription("Feline server description here")
    .setVersion("1.0")
    .setDefaultContentType("application/json")
    .addSecurity("user-password", { type: "userPassword" })
    .addServer("one server", asyncApiServer)
    .build();

  return AsyncApiModule.createDocument(app, asyncApiOptions, {
    include: [LobbyModule],
  });
}
