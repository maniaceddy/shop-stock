import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { initDatabase } from '@/db/database';
import { AuthProvider, useAuth } from '@/context/auth';
import { colors } from '@/utils/theme';

initDatabase();

function RootNavigator() {
  const { user } = useAuth();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="edit_product" />
      </Stack.Protected>

      <Stack.Protected guard={!user}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </AuthProvider>
  );
}


// export default function RootLayout() {
//   return (
//     <AuthProvider>
//       <StatusBar style="light" />
//       <Stack
//         screenOptions={{
//           headerStyle: { backgroundColor: colors.primary },
//           headerTintColor: '#fff',
//           headerTitleStyle: { fontWeight: '700' },
//         }}
//       >
//         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//         <Stack.Screen name="login" options={{ headerShown: false }} />
//         <Stack.Screen name="edit-product" />
//       </Stack>
//     </AuthProvider>
//   )
// }

// export default function TabLayout() {
//   return (
//     <Tabs screenOptions={{ tabBarActiveTintColor: '#2e7d32' }}>
//       <Tabs.Screen
//         name="index"
//         options={{
//             title: "Products",
//               tabBarIcon: ({ color, size }) => (
//                 <Ionicons name="cube-outline" size={size} color={color} />
//               )
//         }}
//       />

//       <Tabs.Screen
//         name="sell"
//         options={{
//           title: "Sell",
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="cart-outline" size={size} color={color} />
//           )
//         }}
//       />

//       <Tabs.Screen
//         name="summary"
//         options={{
//           title: "Summary",
//           tabBarIcon: ({ color, size })  => (
//             <Ionicons name="bar-chart-outline" size={size} color={color} />
//           )
//         }}
//       />
//     </Tabs>
//   )
// }

