import "reflect-metadata";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";

const getAllowedOrigins = (): string[] =>
  (
    process.env.ALLOWED_ORIGINS ??
    [
      "http://localhost:3000",
      "https://localhost:3000",
      "http://localhost:5173",
      "https://localhost:5173",
      "http://localhost:5174",
      "https://localhost:5174",
      "http://localhost:4000",
      "https://localhost:4000",
    ].join(",")
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = getAllowedOrigins();

  app.enableCors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin ${origin} is not allowed by CORS`), false);
    },
  });

  const port = Number(process.env.PORT || 3000);
  await app.listen(port);
  console.log(`API server is running on port ${port}`);
}

void bootstrap();
