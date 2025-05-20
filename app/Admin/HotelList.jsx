import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Image,
  Alert, KeyboardAvoidingView, Platform, Modal, FlatList
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../firebaseconfig';
import { signOut } from 'firebase/auth';

export default function HotelList() {
  const router = useRouter();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

  const menuOptions = [
    { id: '1', title: 'Dashboard', icon: 'home', route: '/Admin/AdminDashboard' },
    { id: '2', title: 'Logout', icon: 'log-out', route: '/logout' },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/authen/login');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const handleMenuOption = (route) => {
    setMenuVisible(false);
    if (route === '/logout') {
      handleLogout();
    } else {
      router.push(route);
    }
  };

  // Fetch hotels from Firebase
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.log('No current user found');
          setLoading(false);
          return;
        }

        console.log('Fetching hotels...');
        const hotelsRef = collection(db, 'users');
        const q = query(hotelsRef, where('role', '==', 'hotel'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          console.log('Received snapshot with', snapshot.docs.length, 'hotels');
          const hotelsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          }));
          
          console.log('Processed hotels:', hotelsData);
          setHotels(hotelsData);
          setLoading(false);
        }, (error) => {
          console.error('Error fetching hotels:', error);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error setting up hotels listener:', error);
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  const renderHotelItem = ({ item }) => (
    <View style={styles.hotelCard}>
      <View style={styles.hotelInfo}>
        <Text style={styles.hotelName}>{item.fullName}</Text>
        <View style={styles.infoRow}>
          <Ionicons name="mail" size={16} color="#747d8c" />
          <Text style={styles.infoText}>{item.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call" size={16} color="#747d8c" />
          <Text style={styles.infoText}>{item.phoneNumber}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time" size={16} color="#747d8c" />
          <Text style={styles.infoText}>
            Created: {item.createdAt.toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="checkmark-circle" size={16} color="#747d8c" />
          <Text style={styles.infoText}>Status: {item.status || 'active'}</Text>
        </View>
      </View>
    </View>
  );

  const renderMenuItem = ({ item }) => (
    <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption(item.route)}>
      <View style={styles.menuItemContent}>
        <Ionicons name={item.icon} size={24} color="#2f3542" />
        <Text style={styles.menuItemText}>{item.title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#b2bec3" />
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={['#2a9d8f', '#264653']} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Ionicons name="menu" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Hotel List</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading hotels...</Text>
          </View>
        ) : hotels.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="bed" size={60} color="#b2bec3" />
            <Text style={styles.emptyText}>No hotels found</Text>
          </View>
        ) : (
          <FlatList
            data={hotels}
            renderItem={renderHotelItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.hotelList}
          />
        )}
      </ScrollView>

      <Modal transparent animationType="slide" visible={menuVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.sideMenuContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Menu</Text>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Ionicons name="close" size={24} color="#2f3542" />
              </TouchableOpacity>
            </View>
            <FlatList data={menuOptions} renderItem={renderMenuItem} keyExtractor={i => i.id} />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  headerGradient: { paddingTop: 10, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  title: { fontSize: 24, fontWeight: '600', color: 'white' },
  content: { flex: 1, padding: 16 },
  hotelList: { paddingBottom: 20 },
  hotelCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  hotelInfo: { flex: 1 },
  hotelName: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#2f3542', 
    marginBottom: 12 
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#747d8c',
    marginLeft: 8,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 18, color: '#636e72' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 18, color: '#636e72', marginTop: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  sideMenuContent: { backgroundColor: 'white', width: '80%', height: '100%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f1f2f6' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#2f3542' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f1f2f6' },
  menuItemContent: { flexDirection: 'row', alignItems: 'center' },
  menuItemText: { fontSize: 16, marginLeft: 15, color: '#2f3542' },
});
