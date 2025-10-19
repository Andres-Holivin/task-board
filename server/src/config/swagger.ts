import { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Env } from "./env";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as express from "express";
import * as path from "path";

export function swaggerConfig(app: INestApplication) {
  const configService = app.get(ConfigService<Env, true>);
  const nodeEnv = configService.get("NODE_ENV", { infer: true });
  const port = configService.get("PORT", { infer: true });

  // ✅ Correct static mapping for Swagger UI (no duplicated /swagger/)
  const swaggerAssets = require("swagger-ui-dist").absolutePath();
  app.use("/swagger-ui", express.static(swaggerAssets));

  if (nodeEnv !== "production") {
    const config = new DocumentBuilder()
      .setTitle("Task Board API")
      .setDescription("The Task Board API documentation")
      .setVersion("1.0")
      .addBearerAuth(
        {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          name: "JWT",
          description: "Enter JWT token",
          in: "header",
        },
        "JWT-auth"
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);

    // ✅ Tell Swagger UI to use the new static prefix (/swagger-ui/)
    SwaggerModule.setup("swagger", app, document, {
      customSiteTitle: "Task Board API Docs",
      customCss: ".swagger-ui .topbar { display: none }",
      customfavIcon:
        "https://upload.wikimedia.org/wikipedia/commons/a/ab/Swagger-logo.png",
      swaggerOptions: {
        // 👇 important: makes it load CSS/JS from /swagger-ui
        url: "/swagger-ui/swagger.json",
      },
    });

    console.log(`📚 Swagger available at http://localhost:${port}/swagger`);
  }
}
