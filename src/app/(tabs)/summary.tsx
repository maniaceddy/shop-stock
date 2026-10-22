import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from 'react-native'
import { useState, useCallback } from 'react'
import { useFocusEffect } from 'expo-router'
import {
    Totals, TopProduct, LowStockItem, startOfDay, getTotalsSince, getTopProducts, getLowStock
} from '@/db/summary'
import { RecentSale, getRecentSales, voidSale } from '@/db/sales'
import { formatMoney } from '@/utils/format';
import { colors, radius, shadow } from '@/utils/theme';
import { resetShopData, hasShopData } from '@/db/database';


type Period = 'today' | 'week';


export default function SummaryScreen() {
    const [period, setPeriod] = useState<Period>('today')
    const [totals, setTotals] = useState<Totals>({ revenue: 0, items: 0, count: 0 })
    const [top, setTop] = useState<TopProduct[]>([])
    const [low, setLow] = useState<LowStockItem[]>([])
    const [recent, setRecent] = useState<RecentSale[]>([])
    const [hasData, setHasData] = useState(false)

    
    
    const load =  useCallback(() => {
            const since = startOfDay(period === 'today' ? 0 : 6)
            setTotals(getTotalsSince(since))
            setTop(getTopProducts(since))
            setLow(getLowStock())
            setRecent(getRecentSales())
            setHasData(hasShopData())
    }, [period])
    
    useFocusEffect(load)

    function handleVoid(s: RecentSale) {
        Alert.alert(
            'Undo sale',
            `Cancel the sale of ${s.quantity} x ${s.name ?? 'Deleted product'}? The stock will be restored`,
            [
                { text: 'Keep', style: 'cancel'},
                {
                    text: 'Undo sale',
                    style:'destructive',
                    onPress: () => {
                        try {
                            voidSale(s.id)
                        } catch (e) {
                            Alert.alert('Could not undo', e instanceof Error ? e.message : 'Unknown error')
                        }
                        load()
                    }
                }
            ]
        )
    }

    function handleResetShop() {
        Alert.alert(
            'Reset shop data',
            'This permanently deletes all products and sales. This can not be undone',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete everything',
                    style: 'destructive',
                    onPress: () => {
                        resetShopData()
                        load()
                    }
                }
            ]
        )
    }
    
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
                                <View key={`${p.name}-${index}`} style={styles.listRow}>
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
                    <Text style={styles.empty}>Long-press to undo a sale</Text>
                    {recent.length === 0 ? (
                        <Text style={styles.empty}>No sales yet</Text>
                    ) : (
                        recent.map((s) => (
                            <Pressable key={s.id} style={styles.listRow} onLongPress={() => handleVoid(s)}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.listName}>
                                        {s.quantity} x {s.name ?? 'Deleted product'}
                                    </Text>
                                    <Text style={styles.empty}>{new Date(s.sold_at).toLocaleString()}</Text>
                                </View>
                                <Text style={styles.listValue}>MK {formatMoney(s.total)}</Text>
                            </Pressable>
                        ))
                    )}
                    
                    <Text style={styles.heading}>Danger zone</Text>
                    <Pressable 
                        style={[styles.dangerBtn, !hasData && styles.dangerDisabled]} 
                        onPress={handleResetShop}
                        disabled={!hasData}
                    >
                        <Text style={[styles.dangerBtn, !hasData && styles.dangerDisabled]}>
                            {hasData ? 'Reset shop data' : 'Nothing to reset'}
                        </Text>
                    </Pressable>
        </ScrollView>
        // sstopeeedddd hereeeeeeeeeeee
    )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  toggle: {
    flexDirection: 'row', backgroundColor: '#e8ebe6',
    borderRadius: radius.md, padding: 4, marginBottom: 16,
  },
  toggleBtn: { flex: 1, padding: 10, borderRadius: radius.sm, alignItems: 'center' },
  toggleActive: { backgroundColor: colors.primary },
  toggleText: { fontWeight: '600', color: colors.muted },
  toggleTextActive: { color: '#fff' },
  cards: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  card: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.md,
    padding: 14, alignItems: 'center', ...shadow,
  },
   empty: { textAlign: 'center', marginTop: 40, color: '#888' },
  checkout: {
    padding: 16, borderTopWidth: 1, borderColor: '#ddd', backgroundColor: '#fafafa',
  },
  cardValue: { fontSize: 18, fontWeight: '700', color: colors.primary },
  cardLabel: { color: colors.muted, marginTop: 4, fontSize: 12 },
  heading: { fontSize: 18, fontWeight: '700', marginTop: 24, marginBottom: 8, color: colors.text },
  listRow: {
    flexDirection: 'row', alignItems: 'center', padding: 12,
    marginBottom: 6, backgroundColor: colors.surface, borderRadius: radius.md,
  },
  rank: { width: 24, fontWeight: '700', color: colors.primary },
  listName: { flex: 1, fontSize: 16, color: colors.text },
  listValue: { color: colors.muted },
  lowValue: { color: colors.danger, fontWeight: '700' },
  dangerBtn: {
    borderWidth: 1, borderColor: colors.danger, padding: 14,
    borderRadius: radius.md, alignItems: 'center', marginBottom: 8,
  },
  dangerText: { color: colors.danger, fontWeight: '700' },
  dangerDisabled: { borderColor: colors.border },
  dangerTextDisabled: { color: colors.muted },
});