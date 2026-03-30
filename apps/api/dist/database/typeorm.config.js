"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeOrmConfig = typeOrmConfig;
const typeorm_1 = require("typeorm");
function typeOrmConfig() {
    return {
        type: 'postgres',
        url: process.env.DATABASE_URL,
        entities: [__dirname + '/entities/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
        synchronize: process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV === 'development',
    };
}
const dataSource = new typeorm_1.DataSource({
    ...typeOrmConfig(),
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
});
exports.default = dataSource;
//# sourceMappingURL=typeorm.config.js.map