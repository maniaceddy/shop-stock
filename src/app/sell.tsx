import { View, Text, StyleSheet } from 'react-native'

export default function SellScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sells</Text>
        </View>
    )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 2, fontWeight: 'bold' }
})