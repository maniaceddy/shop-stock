import { db } from './database'


export type Totals = { revenue: number; items: number; count: number; }
export type TopProduct = { name: string; units: number; revenue: number }
export type LowStockItem = { id: number; name: string; quantity: number; }

export function startOfDay(daysAgo: number): string {
    const d = new Date();
    d.setHours(0,0,0,0)
    d.setDate(d.getDate() - daysAgo)
    return d.toISOString()
}

export function getTotalsSince(sinceIso: string): Totals {
    const row = db.getFirstSync<Totals>(
        `SELECT COALESCE(SUM(total), 0) AS revenue,
            COALESCE(SUM(quantity), 0) AS items,
            COUNT(*) AS count
        FROM sales WHERE sold_at >= ?`,
        [sinceIso]
    )
    return row ?? { revenue: 0, items: 0, count: 0 }
}

export function getTopProducts(sinceIso: string, limit = 5): TopProduct[] {
    return db.getAllSync<TopProduct>(
        `SELECT p.name AS name,
            SUM(s.quantity) AS units,
            SUM(s.total) AS revenue
        FROM sales s
        JOIN products p ON p.id = s.product_id
        WHERE s.sold_at >= ?
        GROUP BY s.product_id
        ORDER BY units DESC
        LIMIT ?`,
        [sinceIso, limit]
    )
}

export function getLowStock(): LowStockItem[] {
    return db.getAllSync<LowStockItem>(
        `SELECT id, name, quantity FROM products
        WHERE quantity <= low_stock_limit AND archived = 0
        `
    )
}