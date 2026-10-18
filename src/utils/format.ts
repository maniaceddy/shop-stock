export function formatMoney(amount: number): string {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export const MAX_PRICE = 100_000_000
export const MAX_STOCK = 1_000_000