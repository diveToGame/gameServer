import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
// import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new WsAdapter(app));
  // app.useWebSocketAdapter(new IoAdapter(app));

  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();