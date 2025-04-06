import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="NOnav/Categories"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="NOnav/Checkout"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="NOnav/OrganizerProfile"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
