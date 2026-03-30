"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const cookieParser = require("cookie-parser");
const app_module_1 = require("./app.module");
const seed_1 = require("./database/seed");
const seed_procedures_1 = require("./database/seed-procedures");
const jwt_auth_guard_1 = require("./modules/auth/guards/jwt-auth.guard");
const core_2 = require("@nestjs/core");
const socket_io_adapter_1 = require("./socket-io.adapter");
const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use(cookieParser());
    app.useWebSocketAdapter(new socket_io_adapter_1.SocketIoAdapter(app, corsOrigin));
    app.useGlobalGuards(new jwt_auth_guard_1.JwtAuthGuard(app.get(core_2.Reflector)));
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    app.enableCors({
        origin: corsOrigin,
        credentials: true,
    });
    if (process.env.NODE_ENV !== 'production') {
        const dataSource = app.get(typeorm_1.DataSource);
        await (0, seed_1.seedDevBranch)(dataSource);
        await (0, seed_procedures_1.seedProcedures)(dataSource);
    }
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`API listening on http://localhost:${port}`);
}
bootstrap().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map