import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native'
import { useState, useCallback } from 'react'
import { useFocusEffect } from 'expo-router'
import {
    Totals, TopProduct, LowStockItem, startOfDay, getTotalsSince, getTopProducts, getLowStock
} from '@/db/summary'
import { RecentSale, getRecentSales } from '@/db/sales'
import { formatMoney } from '@/utils/format';


type Period = 'today' | 'week';


export default function SummaryScreen() {
    const [period, setPeriod] = useState<Period>('today')
    const [totals, setTotals] = useState<Totals>({ revenue: 0, items: 0, count: 0 })
    const [top, setTop] = useState<TopProduct[]>([])
    const [low, setLow] = useState<LowStockItem[]>([])
    const [recent, setRecent] = useState<RecentSale[]>([])

        useFocusEffect(
            useCallback(() => {
                const since = startOfDay(period === 'today' ? 0 : 6)
                setTotals(getTotalsSince(since))
                setTop(getTopProducts(since))
                setLow(getLowStock())
                setRecent(getRecentSales())
            }, [period])
        
    )
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.toggle}>
                <Pressable
                    style={[styles.toggleBtn, period === 'today' && styles.toggleActive]}
                    onPress={() => setPeriod('today')}
                >
                        <Text style={[styles.toggleText, period === 'today' && styles.toggleTextActive]}>
                            Today
                        </Text>
                </Pressable>

                <Pressable
                    style={[styles.toggleBtn, period === 'week' && styles.toggleActive]}
                    onPress={() => setPeriod('week')}
                >
                    <Text style={[styles.toggleText, period === 'week' && styles.toggleTextActive]}>
                        Last 7 days
                    </Text>
                </Pressable>
            </View>

                    <View style={styles.cards}>
                        <View style={styles.card}>
                            <Text style={styles.cardValue}>MK {formatMoney(totals.revenue)}</Text>
                            <Text style={styles.cardLabel}>Revenue</Text>
                        </View>
                        <View style={styles.card}>
                            <Text style={styles.cardValue}>{totals.items}</Text>
                            <Text style={styles.cardLabel}>Items sold</Text>
                        </View>
                        <View style={styles.card}>
                            <Text style={styles.cardValue}>{totals.count}</Text>
                            <Text style={styles.cardValue}>Sale(s)</Text>
                        </View>
                    </View>

                    <Text style={styles.heading}>Best Sellers</Text>
                    {top.length === 0 ? (
                        <Text style={styles.empty}>No sales in this period.</Text>
                    ) : (
                            top.map((p, index) => (
                                <View key={p.name} style={styles.listRow}>
                                    <Text style={styles.rank}>{index + 1}</Text>
                                    <Text style={styles.listName}>{p.name}</Text>
                                    <Text style={styles.listValue}>
                                        {p.units} sold - MK {formatMoney(p.revenue)}
                                    </Text>
                                </View>
                            )
                        )
                    )}

                    <Text style={styles.heading}>Low stock</Text>
                    {low.length === 0 ? (
                        <Text style={styles.empty}>Everything is well stocked.</Text>
                    ) : (
                        low.map((p) => (
                            <View key={p.id} style={styles.listRow}>
                                <Text style={styles.listName}>{p.name}</Text>
                                <Text style={styles.lowValue}>
                                    {p.quantity <= 0 ? 'Out of stock' : `${p.quantity} left`}
                                </Text>
                            </View>
                        ))
                    )}

                    <Text style={styles.heading}>Recent sales</Text>
                    {recent.length === 0 ? (
                        <Text style={styles.empty}>No sales yet</Text>
                    ) : (
                        recent.map((s) => (
                            <View key={s.id} style={styles.listRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.listName}>
                                        {s.quantity} x {s.name ?? 'Deleted product'}
                                    </Text>
                                    <Text style={styles.empty}>{new Date(s.sold_at).toLocaleString()}</Text>
                                </View>
                                <Text style={styles.listValue}>MK {formatMoney(s.total)}</Text>
                            </View>
                        ))
                    )}
        </ScrollView>
        // sstopeeedddd hereeeeeeeeeeee
    )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor:'#fff'},
    content: { padding: 16, alignItems: 'center' },
    toggle: {
        flexDirection: 'row', backgroundColor: '#eee',
        borderRadius: 8, padding: 4, marginBottom: 16,
    },
    toggleBtn: { flex: 1, padding: 10, borderRadius: 6, alignItems: 'center' },
    toggleActive: { backgroundColor: '#2e7d32' },
    toggleText: { fontWeight: '600', color: '#444' },
    toggleTextActive: { color: '#fff' },
    cards: { flexDirection: 'row', gap: 8, marginBottom: 8 },
    card: {
        flex: 1, backgroundColor: '#f1f8e9', borderRadius: 10,
        padding: 12, alignItems: 'center'
    },
    cardLabel: { fontSize: 18, fontWeight: 'bold' },
    cardValue: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 8},
    heading: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 8 },
    listRow: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
        borderBottomWidth: 1, borderColor: '#eee'
    },
    rank: { width: 24, fontWeight: 'bold', color: '#2e7d32'},
    listName: { flex: 1, fontSize: 16 },
    listValue: { color: '#444' },
    lowValue: { color: '#c62828', fontWeight: 'bold' },
    empty: { color: '#888', paddingVertical: 8 }
})