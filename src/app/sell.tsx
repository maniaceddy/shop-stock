import { useState, useCallback } from 'react'
import { formatMoney } from '@/utils/format';

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
            Alert.alert('Sale recorded', `${message}\n\nLock stock: only ${remaining}`)
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
  container: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center'},
  item: {
    flexDirection: 'row', alignItems: 'center', padding:16,
    borderBottomWidth: 1, borderBottomStartRadius: '#eee'
  },
  search: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 10, margin: 12, backgroundColor: '#fafafa',
  },
  itemSelected: { backgroundColor: '#e8f5e9'},
  itemDisabled: { opacity: 0.4 },
  itemName: { fontSize: 16, fontWeight: 'bold' },
  itemPrice: { color: '#666', marginTop: 2 },
  stock: { color: '#444' },
  empty: { textAlign: 'center', marginTop: 40, color: '#888' },
  checkout: {
    padding: 16, borderTopWidth: 1, borderColor: '#ddd', backgroundColor: '#fafafa'
  },
  selectedText: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, backgroundColor: '#fff'
  },
  total: { fontSize: 18, fontWeight: 'bold', minWidth: 110, textAlign: 'right' },
  button: {
    backgroundColor: '#2e7d32', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 12
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16}

})