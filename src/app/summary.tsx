import { View, Text, StyleSheet } from 'react-native'

export default function SummaryScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Summary</Text>
        </View>
    )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 2, fontWeight: 'bold' }
})