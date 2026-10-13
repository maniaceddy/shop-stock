import * as SQLite from 'expo-sqlite'

export const db = SQLite.openDatabaseSync('shop.db')

export function initDatabase() {
    db.execSync(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price INTEGER NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 0,
            low_stock_limit INTEGER NOT NULL DEFAULT 5
        );
        CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            unit_price INTEGER NOT NULL,
            total INTEGER NOT NULL,
            sold_at TEXT NOT NULL,
            FOREIGN KEY (product_id) REFERENCES products(id)
        );
    `)
}