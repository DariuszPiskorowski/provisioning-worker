
import { Client, Pool } from 'pg';

// Konfiguracja dla lokalnej bazy PostgreSQL w Dockerze
const POSTGRES_CONFIG = {
  host: import.meta.env.VITE_POSTGRES_HOST || 'localhost',
  port: parseInt(import.meta.env.VITE_POSTGRES_PORT || '5432'),
  database: import.meta.env.VITE_POSTGRES_DB || 'medical_app',
  user: import.meta.env.VITE_POSTGRES_USER || 'postgres',
  password: import.meta.env.VITE_POSTGRES_PASSWORD || 'secure_password_2024',
  // Bezpieczne ustawienia połączenia
  ssl: false, // Wyłączone dla lokalnej sieci VPN
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  max: 10, // Maksymalna liczba połączeń w puli
  min: 2,  // Minimalna liczba połączeń w puli
  allowExitOnIdle: true,
  // Zabezpieczenia przed atakami
  statement_timeout: 60000, // 60 sekund timeout dla zapytań
  query_timeout: 30000,     // 30 sekund timeout dla pojedynczych zapytań
};

// Pool połączeń dla lepszej wydajności i bezpieczeństwa
export const pgPool = new Pool(POSTGRES_CONFIG);

// Obsługa błędów połączenia
pgPool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

pgPool.on('connect', (client) => {
  console.log('New client connected to PostgreSQL');
});

// Funkcja do testowania połączenia z dodatkowym logowaniem bezpieczeństwa
export const testConnection = async () => {
  try {
    const client = await pgPool.connect();
    
    // Test podstawowego połączenia
    const result = await client.query('SELECT NOW(), current_user, current_database()');
    console.log('PostgreSQL connection successful:', {
      time: result.rows[0].now,
      user: result.rows[0].current_user,
      database: result.rows[0].current_database
    });
    
    // Test uprawnień
    const permissionsTest = await client.query(`
      SELECT 
        has_database_privilege(current_user, current_database(), 'CREATE') as can_create,
        has_database_privilege(current_user, current_database(), 'CONNECT') as can_connect
    `);
    console.log('User permissions:', permissionsTest.rows[0]);
    
    client.release();
    return true;
  } catch (error) {
    console.error('PostgreSQL connection failed:', error);
    return false;
  }
};

// Funkcja do bezpiecznego zamknięcia połączeń
export const closePool = async () => {
  try {
    await pgPool.end();
    console.log('PostgreSQL pool closed successfully');
  } catch (error) {
    console.error('Error closing PostgreSQL pool:', error);
  }
};

// Graceful shutdown z lepszą obsługą
const handleShutdown = async (signal: string) => {
  console.log(`Received ${signal}, closing PostgreSQL pool...`);
  await closePool();
  process.exit(0);
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGUSR2', () => handleShutdown('SIGUSR2')); // dla nodemon
