import { Redirect } from 'expo-router';
import { useAuth } from './context/AuthContext';

export default function Index() {
  const { currentUser } = useAuth();
  
  // If user is logged in, go to the main app, otherwise go to login
  return <Redirect href={currentUser ? "/(tabs)" : "/authen/login"} />;
} 