import { Stack, Redirect } from 'expo-router';
import { EventsProvider } from './context/EventsContext';
import { BookingsProvider } from './context/BookingsContext';
import { AuthProvider } from './context/AuthContext';
import { HotelsProvider } from './context/HotelsContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <EventsProvider>
        <BookingsProvider>
          <HotelsProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="authen/login" options={{ headerShown: false }} />
              <Stack.Screen name="authen/Register" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="Dashboard/HomeDashboard" options={{ headerShown: false }} />
              <Stack.Screen name="Dashboard/Events" options={{ headerShown: false }} />
              <Stack.Screen name="Dashboard/EditEvent" options={{ headerShown: false }} />
              <Stack.Screen name="Dashboard/Approve" options={{ headerShown: false }} />
              <Stack.Screen name="NOnav/UserBooking" options={{ headerShown: false }} />
              <Stack.Screen name="NOnav/ApproveBooking" options={{ headerShown: false }} />
              <Stack.Screen name="NOnav/Checkout" options={{ headerShown: false }} />
              <Stack.Screen name="NOnav/SavedEvents" options={{ headerShown: false }} />
              <Stack.Screen name="NOnav/MyEvent" options={{ headerShown: false }} />
              <Stack.Screen name="NOnav/OrganizerProfile" options={{ headerShown: false }} />
              <Stack.Screen name="NOnav/Setting" options={{ headerShown: false }} />
              <Stack.Screen name="NOnav/HelpSupport" options={{ headerShown: false }} />
              <Stack.Screen name="Admin/AdminDashboard" options={{ headerShown: false }} />
            </Stack>
          </HotelsProvider>
        </BookingsProvider>
      </EventsProvider>
    </AuthProvider>
  );
} 