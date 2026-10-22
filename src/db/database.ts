import * as SQLite from 'expo-sqlite'

export const db = SQLite.openDatabaseSync('shop.db')

export function initDatabase() {
    db.execSync('DROP TABLE IF EXISTS users');
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
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL
        );
    `)

    const columns = db.getAllSync<{ name: string }>('PRAGMA table_info(products)')
    if (!columns.some((c) => c.name === 'archived')) {
        db.execSync('ALTER TABLE products ADD COLUMN archived INTEGER NOT NULL DEFAULT 0')
    }
}

export function resetShopData() {
    db.withTransactionSync(() => {
        db.runSync('DELETE FROM sales')
        db.runSync('DELETE FROM products')
        db.runSync("DELETE FROM sqlite_sequence WHERE name IN ('sales', 'products')")
    })
}

export function hasShopData() :boolean {
    const row = db.getFirstSync<{ c: number }> (
        'SELECT (SELECT COUNT(*) FROM products) + (SELECT COUNT(*) FROM sales) AS c'
    )
    return (row?.c ?? 0) > 0
}