import { View, Text, StyleSheet, TextInput, Pressable, FlatList, Alert} from 'react-native'
import { useState, useCallback } from 'react'
import { useFocusEffect, useRouter } from 'expo-router'
import { Product, getProducts, addProduct, deleteProduct } from '@/db/products'
import { formatMoney, MAX_PRICE, MAX_STOCK } from '@/utils/format';

export default function ProductScreen() {
    const router = useRouter()
    const [products, setProducts] = useState<Product[]>([])
    const [name, setName] = useState('')
    const [price, setPrice] = useState('')
    const [quantity, setQuantity] = useState('')
    const [limit, setLimit] = useState('')
    const [search, setSearch] = useState('')

    useFocusEffect(
        useCallback(() => {
            setProducts(getProducts())
        }, [])
    )

    const visible = products.filter((p) => 
        p.name.toLowerCase().includes(search.trim().toLowerCase())
    )
    
    function handleAdd() {
        const priceNum = parseInt(price, 10)
        const qtyNum = parseInt(quantity, 10)
        const limitNum = parseInt(limit, 10)

        if(!name.trim || isNaN(priceNum) || isNaN(qtyNum) || isNaN(limitNum) || priceNum <= 0 || qtyNum < 0 || limitNum < 0 || priceNum > MAX_PRICE || qtyNum > MAX_STOCK) {
            Alert.alert('Check your input', 'Price must be between and 100,000,000. Stock and limit can\'t be negative or above 1,000,000.')
            return
        }

        addProduct(name.trim(), priceNum, qtyNum, limitNum)
        setProducts(getProducts())
        setName('')
        setPrice('')
        setQuantity('')
        setLimit('5')
    }

    function handleDelete(item: Product) {
        Alert.alert('Remove', `Remove "${item.name}"? Its past sales are kept.`, [
            { text: 'Cancel', style: 'cancel'},
            { text: 'Delete', 
                style: 'destructive',
                onPress: () => {
                    deleteProduct(item.id);
                    setProducts(getProducts)
                }
            }
        ])
    }

    return (
        <View style={styles.container}>
            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    placeholder='Product name'
                    value={name}
                    onChangeText={setName}
                />
                    
                <View style={styles.row}>

                    <TextInput
                        style={[styles.input, styles.flex]}
                        placeholder='Price'
                        keyboardType='numeric'
                        value={price}
                        onChangeText={setPrice}
                    />

                    <TextInput
                        style={[styles.input, styles.flex]}
                        placeholder='Stock'
                        keyboardType='numeric'
                        value={quantity}
                        onChangeText={setQuantity}
                    />

                    <TextInput
                        style={[styles.input, styles.flex]}
                        placeholder='Low at'
                        keyboardType='numeric'
                        value={limit}
                        onChangeText={setLimit}
                    />

                </View>

                <Pressable style={styles.button} onPress={(handleAdd)}>
                    <Text style={styles.buttonText}>Add Product</Text>
                </Pressable>
            </View>

            <TextInput
                style={styles.search}
                placeholder="Search products..."
                value={search}
                onChangeText={setSearch}
            />

            <FlatList
                data={visible}
                keyExtractor={(item) => item.id.toString()}
                keyboardShouldPersistTaps='handled'
                ListEmptyComponent={<Text style={styles.empty}>
                                        {search ? 'No products match your search.' : 'No products yet. Add your first one above.'}
                                    
                                    </Text>}
                renderItem={({ item }) => {
                    const isLow = item.quantity <= item.low_stock_limit
                    return (
                        <Pressable style={styles.item} 
                            onPress={() => router.push({ pathname: '/edit_product', params: { id: item.id } })}
                            onLongPress={() => handleDelete(item)} 
                        >
                            <View style={styles.flex}>
                                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                                <Text style={styles.itemPrice}>{formatMoney(item.price)}</Text>
                                <Text style={[styles.qty, isLow && styles.qtyLow]}>
                                {item.quantity} {isLow ? '(low)' : ''}
                                </Text>
                            </View>
                        </Pressable>
                    )
                }}
            >

            </FlatList>
        </View>
    )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  form: { padding: 16, borderBottomWidth: 1, borderColor:'#ddd'},
  row: { flexDirection: 'row', gap: 8 },
  flex: { flex: 1 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom:8 
  },
  search: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 10, margin: 12, backgroundColor: '#fafafa'
  },
  button: {
    backgroundColor: '#2e7d32', padding: 12,
    borderRadius: 8, alignItems: 'center'
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  item: {
    flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: '#eee'
  },
  itemName: { fontSize: 16, fontWeight: '600' },
  itemPrice: { color: '#666', marginTop: 2 },
  qty: { fontSize: 16, fontWeight: 'bold' },
  qtyLow: { color: '#c62828' },
  empty: { textAlign: 'center', marginTop: 40, color: '#888' }
})