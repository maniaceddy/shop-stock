import { useState, useCallback } from 'react'
import { formatMoney } from '@/utils/format';
import { colors, radius, shadow } from '@/utils/theme';

import {
    View, Text, TextInput, Pressable, FlatList, StyleSheet, Alert
}  from 'react-native'
import { useFocusEffect } from 'expo-router'
import { Product, getProducts } from '@/db/products'
import { recordSale } from '@/db/sales'

export default function SellScreen() {
    const [products, setProducts] = useState<Product[]>([])
    const [selectedId, setSelectedId] = useState<number | null>(null)
    const [qty, setQty] = useState('1')
    const [search, setSearch] = useState('')

    useFocusEffect(
        useCallback(() => {
            setProducts(getProducts())
            setSelectedId(null)
            setQty('1')
        }, [])
    )

    
    const selected = products.find((p) => p.id === selectedId) ?? null
    const qtyNum = parseInt(qty, 10)
    const total = selected && !isNaN(qtyNum) ? selected.price * qtyNum : 0

    const visible = products.filter((p) =>
        p.name.toLowerCase().includes(search.trim().toLowerCase())
    )

    function handleSell() {
        if(!selected) {
            Alert.alert('No product', 'Tap a product to select it first')
            return
        }
        if (isNaN(qtyNum) || qtyNum <= 0) {
            Alert.alert('Invalid quantity', 'Enter a quantity of 1 or more')
            return
        }

        try {
            recordSale(selected.id, qtyNum)
        } catch (e) {
            Alert.alert('Could not sell', e instanceof Error ? e.message : 'Unkwon error')
            return
        }

        const remaining = selected.quantity - qtyNum
        const message = `Sold ${qtyNum} x ${selected.name} for MK ${formatMoney(total)}`

        if (remaining <= selected.low_stock_limit) {
            Alert.alert('Sale recorded', `${message}\n\nLow stock: only ${remaining} left.`)
        } else {
            Alert.alert('Sale recorded', message)
        }

        setProducts(getProducts())
        setSelectedId(null)
        setQty('1')
        setSearch('')
    }

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.search}
                placeholder="Search products..."
                value={search}
                onChangeText={setSearch}
            />
            <FlatList
                data={visible}
                keyExtractor={(item) => item.id.toString()}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                    <Text style={styles.empty}>
                        {search ? 'No products match your search.' : 'No products yet. Add some on the Products tab.'}
                    </Text>                }
                renderItem={({ item }) => {
                    const outOfStock = item.quantity <= 0
                    const isSelected = item.id === selectedId

                    return (
                        <Pressable
                            disabled={outOfStock}
                            onPress={() => setSelectedId(item.id)}
                            style={[
                                styles.item,
                                isSelected && styles.itemSelected,
                                outOfStock && styles.itemDisabled,
                            ]}
                        >

                            <View style={styles.flex}>
                                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                                <Text style={styles.itemPrice}>MK {formatMoney(item.price)}</Text>
                            </View>
                            <Text style={styles.stock}>
                                {outOfStock ? 'Out of stock' : `${item.quantity} in stock`}
                            </Text>
                        </Pressable>
                                            
                    )
                }}
            />

            <View style={styles.checkout}>
                <Text style={styles.selectedText}>
                    {selected ? selected.name : 'Select a product'}
                </Text>
                <View style={styles.row}>
                    <TextInput
                        style={[styles.input, styles.flex]}
                        keyboardType='numeric'
                        value={qty}
                        onChangeText={setQty}
                        placeholder='Qty'
                    />

                    <Text style={styles.total}>MK {formatMoney(total)}</Text>
                </View>
                <Pressable style={styles.button} onPress={handleSell}>
                    <Text style={styles.buttonText}>Sell</Text>
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  search: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    padding: 12, margin: 12, backgroundColor: colors.surface,
  },
  item: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    marginHorizontal: 12, marginBottom: 8, backgroundColor: colors.surface,
    borderRadius: radius.md, borderWidth: 1, borderColor: 'transparent', ...shadow,
  },
  itemSelected: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  itemDisabled: { opacity: 0.4 },
  itemName: { fontSize: 16, fontWeight: '600', color: colors.text },
  itemPrice: { color: colors.muted, marginTop: 2 },
  stock: { color: colors.muted },
  empty: { textAlign: 'center', marginTop: 40, color: colors.muted },
  checkout: {
    padding: 16, backgroundColor: colors.surface, borderTopWidth: 1,
    borderColor: colors.border, borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg, elevation: 8,
  },
  selectedText: { fontSize: 16, fontWeight: '700', marginBottom: 8, color: colors.text },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    padding: 12, backgroundColor: colors.background, color: colors.text,
  },
  total: {
    fontSize: 20, fontWeight: '700', minWidth: 120,
    textAlign: 'right', color: colors.primary,
  },
  button: {
    backgroundColor: colors.primary, padding: 14, borderRadius: radius.md,
    alignItems: 'center', marginTop: 12,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});