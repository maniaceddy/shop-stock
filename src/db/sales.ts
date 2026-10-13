import { db } from './database'

export function recordSale(productId: number, quantity: number) {
    db.withTransactionSync(() => {
        const product = db.getFirstSync<{ price: number; quantity: number }> (
            `SELECT price, quantity FROM products WHERE id = ?`, [productId]
        )

        if (!product) {
            throw new Error('Product not found')
        }
        if (quantity > product.quantity) {
            throw new Error(`Only ${product.quantity} left in stock`)
        }

        const total = product.price * quantity

        db.runSync(
            `INSERT INTO sales(product_id, quantity, unit_price, total, sold_at) VALUES (?, ?, ?, ?, ?)`, [productId, quantity, product.price, total, new Date().toISOString()]
        )

        db.runSync(
            `UPDATE products SET quantity = quantity - ? WHERE id = ?`,
            [quantity, productId]
        )
    })
}