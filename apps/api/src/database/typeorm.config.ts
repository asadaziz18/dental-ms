import { DataSource, DataSourceOptions } from 'typeorm';

export function typeOrmConfig(): DataSourceOptions {
  return {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [__dirname + '/entities/**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
  };
}

const dataSource = new DataSource({
  ...typeOrmConfig(),
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
});

export default dataSource;
