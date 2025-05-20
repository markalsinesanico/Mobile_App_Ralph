import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, FlatList, Modal, TextInput, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../firebaseconfig';
import { signOut } from 'firebase/auth';

export default function Approve() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [approvedBookings, setApprovedBookings] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const menuOptions = [
    { id: '1', title: 'Home', icon: 'home', route: '/Dashboard/HomeDashboard' },
    { id: '2', title: 'Events', icon: 'calendar', route: '/Dashboard/Events' },
    { id: '3', title: 'User Booking', icon: 'book', route: '/Dashboard/UserBooking' },
    { id: '4', title: 'Approve Booking', icon: 'checkmark-circle', route: '/Dashboard/Approve' },
    { id: '5', title: 'Logout', icon: 'log-out', route: '/logout' },
  ];

  const handleMenuOption = (route) => {
    setMenuVisible(false);
    if (route === '/logout') {
      handleLogout();
    } else {
      router.push(route);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/authen/login');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const renderMenuItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.menuItem}
      onPress={() => handleMenuOption(item.route)}
    >
      <View style={styles.menuItemContent}>
        <Ionicons name={item.icon} size={24} color="#2f3542" />
        <Text style={styles.menuItemText}>{item.title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#b2bec3" />
    </TouchableOpacity>
  );

  useEffect(() => {
    const fetchApprovedBookings = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setError("Please log in to view approved bookings");
          setLoading(false);
          return;
        }

        const bookingsRef = collection(db, 'bookings');
        const q = query(
          bookingsRef, 
          where('status', '==', 'confirmed'),
          where('hotelId', '==', currentUser.uid)
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const bookingsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            eventTitle: doc.data().eventTitle || 'Untitled Event',
            eventDate: doc.data().eventDate || 'No date specified',
            eventType: doc.data().eventType || 'Not specified',
            eventLocation: doc.data().eventLocation || 'No location specified',
            eventImage: doc.data().eventImage || null,
            fullName: doc.data().fullName || 'No name specified',
            email: doc.data().email || 'No email specified',
            phone: doc.data().phone || 'No phone specified',
            status: doc.data().status || 'pending'
          }));
          
          bookingsData.sort((a, b) => b.createdAt - a.createdAt);
          setApprovedBookings(bookingsData);
          if (bookingsData.length > 0) {
            setSelectedBooking(bookingsData[0]);
          }
          setLoading(false);
        }, (error) => {
          console.error('Error fetching approved bookings:', error);
          setError('Failed to load approved bookings');
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error setting up approved bookings listener:', error);
        setError('Failed to load approved bookings');
        setLoading(false);
      }
    };

    fetchApprovedBookings();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#4CAF50';
      case 'rejected':  return '#F44336';
      default:          return '#FFC107';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return 'checkmark-circle';
      case 'rejected':  return 'close-circle';
      default:          return 'time';
    }
  };

  const renderBookingItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.bookingCard}
      onPress={() => setSelectedBooking(item)}
    >
      <View style={styles.bookingInfo}>
        <Text style={styles.eventTitle} numberOfLines={1}>{item.eventTitle}</Text>
        <Text style={styles.customerName} numberOfLines={1}>Customer: {item.fullName}</Text>
        <Text style={styles.bookingDate} numberOfLines={1}>Date: {item.eventDate}</Text>
        <View style={[
          styles.statusBadge, 
          { backgroundColor: getStatusColor(item.status) }
        ]}>
          <Ionicons 
            name={getStatusIcon(item.status)} 
            size={14} 
            color="white" 
            style={styles.statusIcon}
          />
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#b2bec3" />
    </TouchableOpacity>
  );

  const renderBookingDetails = () => {
    if (!selectedBooking) return null;
    return (
      <View style={styles.detailsContainer}>
        <View style={styles.detailsHeader}>
          <TouchableOpacity style={styles.backButton} onPress={() => setSelectedBooking(null)}>
            <Ionicons name="arrow-back" size={24} color="#2f3542" />
          </TouchableOpacity>
          <Text style={styles.detailsTitle}>Booking Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView style={styles.detailsContent}>
          <Image source={{ uri: selectedBooking.eventImage }} style={styles.detailsImage} />
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Event Information</Text>
            <Text style={styles.detailsText}>Event: {selectedBooking.eventTitle}</Text>
            <Text style={styles.detailsText}>Type: {selectedBooking.eventType}</Text>
            <Text style={styles.detailsText}>Date: {selectedBooking.eventDate}</Text>
            <Text style={styles.detailsText}>Location: {selectedBooking.eventLocation}</Text>
          </View>
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Customer Information</Text>
            <Text style={styles.detailsText}>Name: {selectedBooking.fullName}</Text>
            <Text style={styles.detailsText}>Email: {selectedBooking.email}</Text>
            <Text style={styles.detailsText}>Phone: {selectedBooking.phone}</Text>
          </View>
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Booking Status</Text>
            <View style={[
              styles.statusContainer,
              { backgroundColor: getStatusColor(selectedBooking.status) }
            ]}>
              <Ionicons 
                name={getStatusIcon(selectedBooking.status)} 
                size={18} 
                color="white" 
                style={styles.statusIcon}
              />
              <Text style={styles.statusText}>{selectedBooking.status.toUpperCase()}</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2a9d8f" />
        <Text style={styles.loadingText}>Loading approved bookings...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const filtered = approvedBookings.filter(b =>
    b.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2a9d8f', '#264653']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Ionicons name="menu" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Approved Bookings</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={{ padding: 16, backgroundColor: 'white' }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#f1f2f6',
          borderRadius: 8,
          paddingHorizontal: 12
        }}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={{ flex: 1, marginLeft: 8, height: 40 }}
            placeholder="Search by name or email"
            value={searchTerm}
            onChangeText={setSearchTerm}
            autoCapitalize="none"
          />
        </View>
      </View>

      <View style={styles.content}>
        {selectedBooking
          ? <ScrollView style={styles.content}>{renderBookingDetails()}</ScrollView>
          : <FlatList
              data={filtered}
              renderItem={renderBookingItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContainer}
            />
        }
      </View>

      {/* Side Menu Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
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
              style={styles.menuList}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5'
  },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  errorContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 20
  },
  errorText: { marginTop: 10, fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 20 },
  retryButton: { backgroundColor: '#2a9d8f', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
  retryButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  headerGradient: { paddingTop: 10, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  header: {
    flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'transparent'
  },
  title: { fontSize: 24, fontWeight: '600', marginLeft: 16, color: 'white' },
  content: { flex: 1 },
  listContainer: { padding: 16 },
  bookingCard: {
    flexDirection: 'row', backgroundColor: 'white', borderRadius: 8,
    marginBottom: 12, padding: 12, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1,
    shadowRadius: 4, elevation: 3, alignItems: 'center'
  },
  bookingInfo: { flex: 1 },
  eventTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4, color: '#2f3542' },
  customerName: { fontSize: 14, color: '#666', marginBottom: 4 },
  bookingDate: { fontSize: 14, color: '#666', marginBottom: 4 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4
  },
  statusIcon: { marginRight: 4 },
  statusText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  detailsContainer: { flex: 1, backgroundColor: '#f8f9fa' },
  detailsHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee'
  },
  detailsTitle: { fontSize: 18, fontWeight: 'bold', color: '#2f3542' },
  backButton: { padding: 8 },
  detailsContent: { flex: 1, padding: 16 },
  detailsImage: { width: '100%', height: 200, borderRadius: 8, marginBottom: 16 },
  detailsSection: { backgroundColor: 'white', borderRadius: 8, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#2f3542', marginBottom: 12 },
  detailsText: { fontSize: 14, color: '#666', marginBottom: 8 },
  statusContainer: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  sideMenuContent: { backgroundColor: 'white', width: '80%', height: '100%', padding: 20 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f1f2f6'
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#2f3542' },
  menuList: { marginBottom: 20 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f1f2f6'
  },
  menuItemContent: { flexDirection: 'row', alignItems: 'center' },
  menuItemText: { fontSize: 16, marginLeft: 15, color: '#2f3542' },
});
