import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

// Firebase imports
import { auth, db } from '../../firebaseconfig';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, Timestamp, collection, query, where, onSnapshot } from 'firebase/firestore';

const AdminDashboard = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [addFormVisible, setAddFormVisible] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const menuOptions = [
    { id: '1', title: 'Hotel List', icon: 'bed', route: '/Admin/HotelList' },
    { id: '2', title: 'Logout', icon: 'log-out', route: '/logout' }
  ];

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
          
          // Sort hotels by creation date (newest first)
          hotelsData.sort((a, b) => b.createdAt - a.createdAt);
          
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

  const handleAddAccount = async () => {
    // Validation
    if (!fullName.trim() || !phoneNumber.trim() || !email.trim() || !password || !confirmPassword) {
      return Alert.alert('Error', 'All fields are required.');
    }
    if (password !== confirmPassword) {
      return Alert.alert('Error', 'Passwords do not match.');
    }

    try {
      // 1) Create Firebase Auth user
      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const uid = user.uid;

      // 2) Write Firestore document at users/{uid}
      await setDoc(doc(db, 'users', uid), {
        uid,
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        role: 'hotel',
        status: 'active',
        createdAt: Timestamp.now(),
        // Additional hotel-specific fields
        address: '',
        description: '',
        image: null,
        pricePerNight: '',
        amenities: [],
        rating: 0,
        reviews: [],
        rooms: [],
        bookings: []
      });

      Alert.alert('Success', 'Hotel account created successfully!');
      // Reset form
      setFullName('');
      setPhoneNumber('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setAddFormVisible(false);
    } catch (error) {
      console.error('Error creating account:', error);
      Alert.alert('Error', error.message);
    }
  };

  const renderMenuItem = ({ item }) => (
    <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption(item.route)}>
      <View style={styles.menuItemContent}>
        <Ionicons name={item.icon} size={24} color="#2f3542" />
        <Text style={styles.menuItemText}>{item.title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#b2bec3" />
    </TouchableOpacity>
  );

  const renderRecentHotel = ({ item }) => (
    <View style={styles.recentHotelCard}>
      <View style={styles.recentHotelInfo}>
        <Text style={styles.recentHotelName}>{item.fullName}</Text>
        <View style={styles.recentHotelDetails}>
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
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <LinearGradient colors={['#2a9d8f', '#264653']} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Ionicons name="menu" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Admin Dashboard</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      {/* CONTENT AREA */}
      <ScrollView style={styles.content}>
        {/* Hotel Count Box */}
        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <View style={styles.statsIconContainer}>
              <Ionicons name="bed" size={32} color="#2a9d8f" />
            </View>
            <View style={styles.statsInfo}>
              <Text style={styles.statsNumber}>{hotels.length}</Text>
              <Text style={styles.statsLabel}>Total Hotels</Text>
            </View>
          </View>
        </View>

        {/* Recent Hotels Section */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Hotels</Text>
            <TouchableOpacity onPress={() => router.push('/Admin/HotelList')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading hotels...</Text>
            </View>
          ) : hotels.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="bed" size={40} color="#b2bec3" />
              <Text style={styles.emptyText}>No hotels found</Text>
            </View>
          ) : (
            <FlatList
              data={hotels.slice(0, 5)} // Show only 5 most recent hotels
              renderItem={renderRecentHotel}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      {/* FAB: Add Hotel Account */}
      <TouchableOpacity style={styles.fab} onPress={() => setAddFormVisible(true)}>
        <LinearGradient colors={['#2a9d8f', '#264653']} style={styles.fabGradient}>
          <Ionicons name="add" size={30} color="white" />
        </LinearGradient>
      </TouchableOpacity>

      {/* SIDE MENU */}
      <Modal transparent visible={menuVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.sideMenuContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Menu</Text>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Ionicons name="close" size={24} color="#2f3542" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={menuOptions}
              renderItem={renderMenuItem}
              keyExtractor={item => item.id}
            />
          </View>
        </View>
      </Modal>

      {/* ADD ACCOUNT FORM */}
      <Modal transparent visible={addFormVisible} animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.formModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Hotel Account</Text>
              <TouchableOpacity onPress={() => setAddFormVisible(false)}>
                <Ionicons name="close" size={24} color="#2f3542" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.formScroll}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter full name"
                  placeholderTextColor="#b2bec3"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="Enter phone number"
                  placeholderTextColor="#b2bec3"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter email address"
                  placeholderTextColor="#b2bec3"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter password"
                  placeholderTextColor="#b2bec3"
                  secureTextEntry
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm password"
                  placeholderTextColor="#b2bec3"
                  secureTextEntry
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleAddAccount}>
                <Text style={styles.submitButtonText}>Create Account</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

export default AdminDashboard;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f2f6' },
  headerGradient: { paddingTop: 10, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  title: { fontSize: 24, fontWeight: '600', color: 'white' },
  content: { flex: 1, padding: 16 },
  statsContainer: { marginBottom: 24 },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f1f2f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statsInfo: { flex: 1 },
  statsNumber: { fontSize: 32, fontWeight: 'bold', color: '#2f3542' },
  statsLabel: { fontSize: 16, color: '#747d8c', marginTop: 4 },
  recentSection: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#2f3542' },
  viewAllText: { color: '#2a9d8f', fontSize: 16 },
  recentHotelCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  recentHotelInfo: { flex: 1 },
  recentHotelName: { fontSize: 18, fontWeight: 'bold', color: '#2f3542', marginBottom: 8 },
  recentHotelDetails: { gap: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoText: { fontSize: 14, color: '#747d8c', marginLeft: 8 },
  loadingContainer: { padding: 20, alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#747d8c' },
  emptyContainer: { padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#747d8c', marginTop: 8 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 60, height: 60, borderRadius: 30, elevation: 5 },
  fabGradient: { width: '100%', height: '100%', borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  sideMenuContent: { backgroundColor: 'white', width: '80%', height: '100%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f1f2f6' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#2f3542' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f1f2f6' },
  menuItemContent: { flexDirection: 'row', alignItems: 'center' },
  menuItemText: { fontSize: 16, marginLeft: 15, color: '#2f3542' },
  formModalContent: { backgroundColor: 'white', marginTop: 50, marginHorizontal: 20, borderRadius: 20, padding: 20, maxHeight: '80%' },
  formScroll: { maxHeight: '100%' },
  inputContainer: { marginBottom: 20 },
  inputLabel: { fontSize: 16, fontWeight: '500', marginBottom: 8, color: '#2f3542' },
  input: { backgroundColor: '#f1f2f6', borderRadius: 10, padding: 15, fontSize: 16, color: '#2f3542' },
  submitButton: { backgroundColor: '#2a9d8f', borderRadius: 10, padding: 15, alignItems: 'center', marginTop: 10 },
  submitButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
