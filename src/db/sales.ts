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

export type RecentSale = {
    id: number
    name: string | null
    quantity: number
    total: number
    sold_at: string
}

export function getRecentSales(limit = 30): RecentSale[] {
    return db.getAllSync<RecentSale>(
        `SELECT s.id, p.name AS name, s.quantity, s.total, s.sold_at
        FROM sales s
        LEFT JOIN products p ON p.id = s.product_id
        ORDER BY s.sold_at DESC
        LIMIT ?`,
        [limit]
    )
}

// export function voidSale(saleId: number) {
//     db.withTransactionSync(() => {
//         const sale = db.getFirstSync<{ product_id: number; quantity: number }>(
//             'SELECT product_id, quantity FROM sales WHERE id = ?',
//             [saleId]
//         )

//         if (!sale) {
//             throw new Error('This sale has already been undone')
//         }

//         const result = db.runSync('DELETE FROM sales WHERE id = ?', [saleId])
//         if (result.changes !== 1) {
//             throw new Error('THe sale could not be removed.')
//         }

//         db.runSync('UPDATE products SET quantity = quantity + ? WHERE id = ?',
//             [sale.quantity, sale.product_id]
//         )

//     })
// }

export function returnFromSale(saleId: number, returnQty: number) {
    db.withTransactionSync(() => {
        const sale = db.getFirstSync<{
            product_id: number
            quantity: number
            unit_price: number
        }>('SELECT product_id, quantity, unit_price FROM sales WHERE id =?', [saleId])

        if (!sale) {
            throw new Error('This sale no longer exists.')
        }

        if (!Number.isInteger(returnQty) || returnQty <= 0) {
            throw new Error('Enter a quantity of 1 or more')
        }

        if (returnQty > sale.quantity) {
            throw new Error(`Only ${sale.quantity} were sold in this sale.`)
        }

        if (returnQty === sale.quantity) {
        const result = db.runSync('DELETE FROM sales WHERE id = ?', [saleId])
        
        if (result.changes !== 1) {
            throw new Error('Full return failed: sale row not found.');
        }
        } else {
        const newQty = sale.quantity - returnQty;
        const newTotal = newQty * sale.unit_price;

        const result = db.runSync(
            'UPDATE sales SET quantity = ?, total = ? WHERE id = ?',
            [newQty, newTotal, saleId]
        )

        if (result.changes !== 1) {
            throw new Error('Partial return failed: sale row not updated.');
        }
        }
        db.runSync('UPDATE products SET quantity = quantity + ? WHERE id = ?', 
            [returnQty, sale.product_id])
    })
}