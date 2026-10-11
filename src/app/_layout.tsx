import { initDatabase } from '@/db/database';
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';

initDatabase()

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#2e7d32' }}>
      <Tabs.Screen
        name="index"
        options={{
            title: "Products",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="cube-outline" size={size} color={color} />
              )
        }}
      />

      <Tabs.Screen
        name="sell"
        options={{
          title: "Sell",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name="summary"
        options={{
          title: "Summary",
          tabBarIcon: ({ color, size })  => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          )
        }}
      />
    </Tabs>
  )
}

