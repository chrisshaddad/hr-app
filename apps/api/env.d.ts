declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    REDIS_URL: string;
    APP_URL: string;
    PUBLIC_APP_URL: string;
  }
}
