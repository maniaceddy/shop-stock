import { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { getProduct, updateProduct, restockProduct } from "@/db/products";
import { MAX_PRICE, MAX_STOCK  } from "@/utils/format";
import { colors, radius, shadow } from '@/utils/theme';


export default function EditProductScreen() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const router = useRouter()

    const [product, setProduct] = useState(() => getProduct(Number(id)))
    const [name, setName] = useState(product?.name ?? '')
    const [price, setPrice] = useState(String(product?.price ?? ''))
    const [limit, setLimit] = useState(String(product?.low_stock_limit ?? 5))
    const [restock, setRestock] = useState('')

    useEffect(() => {
        const currentProduct = getProduct(Number(id))

        setProduct(currentProduct)
        setName(currentProduct?.name ?? '')
        setPrice(String(currentProduct?.price ?? ''))
        setLimit(String(currentProduct?.low_stock_limit ?? 5))
        setRestock('')
    }, [id])

    if(!product) {
        return (
            <View style={styles.container}>
                <Text>Product not found</Text>
            </View>
        )
    }

    function handleSave() {
        const priceNum = parseInt(price, 10)
        const limitNum = parseInt(limit, 10)
    
        if(!name.trim() || isNaN(priceNum) || isNaN(limitNum) || priceNum <= 0 || limitNum < 0 || priceNum > MAX_PRICE) {
            Alert.alert('Check your input', "Price must be between 1 and 100,000,000 and the limit can't be negative.")
            return
        }
        updateProduct(product!.id, name.trim(), priceNum, limitNum)
        router.back()
    }

    function handleRestock() {
        const amount = parseInt(restock, 10)
        if(isNaN(amount) || amount <= 0 || amount > MAX_STOCK) {
            Alert.alert('Invalid amount', 'Enter between 1 and 1,000,000 items.')
            return
        }
        restockProduct(product!.id, amount)
        router.back()
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Edit product' }} />

            <Text style={styles.label}>Price</Text>
            <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
            />

            <Text style={styles.label}>Low stock limit</Text>
            <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={limit}
                onChangeText={setLimit}
            />

            <Pressable style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>Save changes</Text>
            </Pressable>

            <View style={styles.divider} />

            <Text style={styles.label}>Current stock: {product.quantity}</Text>
            <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Add new stock"
                value={restock}
                onChangeText={setRestock}
            />

            <Pressable style={[styles.button, styles.buttonAlt]} onPress={handleRestock}>
                <Text style={styles.buttonText}>Add stock</Text>
            </Pressable>

        </View>
    )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.background },
  label: { fontWeight: '600', marginBottom: 4, marginTop: 8, color: colors.text },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    padding: 12, marginBottom: 8, backgroundColor: colors.surface, color: colors.text,
  },
  button: {
    backgroundColor: colors.primary, padding: 14, borderRadius: radius.md,
    alignItems: 'center', marginTop: 8,
  },
  buttonAlt: { backgroundColor: colors.accent },
  buttonText: { color: '#fff', fontWeight: '700' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 20 },
});