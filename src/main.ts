import { NestFactory } from "@nestjs/core";
import { WsAdapter } from "@nestjs/platform-ws";
import { AppModule } from "./app.module";
import { makeAsyncapiDocument } from "./common";
import { AsyncApiModule } from "nestjs-asyncapi";
import { DOC_RELATIVE_PATH } from "./constants";

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useWebSocketAdapter(new WsAdapter(app));

  const asyncapiDocument = await makeAsyncapiDocument(app);
  await AsyncApiModule.setup(DOC_RELATIVE_PATH, app, asyncapiDocument);

  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
