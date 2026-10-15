import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { getProduct, updateProduct, restockProduct } from "@/db/products";


export default function EditProductScreen() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const router = useRouter()

    const [product] = useState(() => getProduct(Number(id)))
    const [name, setName] = useState(product?.name ?? '')
    const [price, setPrice] = useState(String(product?.price))
    const [limit, setLimit] = useState(String(product?.low_stock_limit))
    const [restock, setRestock] = useState('')

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
    
        if(!name.trim() || isNaN(priceNum) || isNaN(limitNum)) {
            Alert.alert('Missing info', 'Fill in every field with valid numbers')
            return
        }
        updateProduct(product!.id, name.trim(), priceNum, limitNum)
        router.back()
    }

    function handleRestock() {
        const amount = parseInt(restock, 10)
        if(isNaN(amount) || amount <= 0) {
            Alert.alert('Invalid amount', 'Enter how many items arrived (1 or more).')
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
                placeholder="How many arrived"
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
    container: { flex: 1, padding: 16, backgroundColor: '#fff' },
    label: { fontWeight: '600', marginBottom: 4, marginTop: 8 },
    input: {
        borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
        padding: 10, marginBottom: 8
    }, 
    buttton: {
        backgroundColor: '#2e7d32', padding: 12,
        borderRadius: 8, alignItems: 'center', marginTop: 8
    },
    button: {
        backgroundColor: '#2e7d32', padding: 12,
        borderRadius: 8, alignItems: 'center', marginTop: 8,
    },
    buttonAlt: { backgroundColor: '#1565c0' },
    buttonText: { color: '#fff', fontWeight: 'bold' },
    divider: { height: 1, backgroundColor: '#ddd', marginVertical: 20 }
})