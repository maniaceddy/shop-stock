import { db } from './database'

export type Product = {
    id: number;
    name: string;
    price: number 
    quantity: number
    low_stock_limit: number
}

export function getProducts(): Product[] {
    return db.getAllSync<Product>('SELECT * FROM products ORDER BY name')
} 

export function addProduct(
    name: string,
    price: number,
    quantity: number,
    lowStockLimit: number
) {
    db.runSync(
        'INSERT INTO products (name, price, quantity, low_stock_limit) VALUES (?, ?, ?, ?)',
        [name, price, quantity, lowStockLimit]
    )
}

export function deleteProduct(id: number) {
    db.runSync('DELETE FROM products WHERE id = ?', [id])
}

export function getProduct(id: number): Product | null {
    return db.getFirstSync<Product>('SELECT * FROM product WHERE id = ?', [id])
}

export function updateProduct(
    id: number,
    name: string,
    price: number,
    lowStockLimit: number
) {
    db.runSync(
        'UPDATE products SET name = ?, price = ?, low_stock_limit = ? WHERE id = ?',
        [name, price, lowStockLimit, id]
    )
}

export function restockProduct(id: number, amount: number) {
    db.runSync('UPDATE products SET quantity = quantity + ? WHERE id = ?', [amount, id])
}