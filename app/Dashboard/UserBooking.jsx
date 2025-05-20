import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, FlatList, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, where, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebaseconfig';
import { signOut } from 'firebase/auth';

export default function UserBooking() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const menuOptions = [
    { id: '1', title: 'Home', icon: 'home', route: '/Dashboard/HomeDashboard' },
    { id: '2', title: 'Events', icon: 'calendar', route: '/Dashboard/Events' },
    { id: '3', title: 'Approve Booking', icon: 'checkmark-circle', route: '/Dashboard/Approve' },
    { id: '4', title: 'Logout', icon: 'log-out', route: '/logout' },
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

  // Fetch bookings from Firebase
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.log('No current user found');
          setError("Please log in to view bookings");
          setLoading(false);
          return;
        }

        console.log('Fetching bookings for hotel:', currentUser.uid);
        const bookingsRef = collection(db, 'bookings');
        const q = query(bookingsRef, where('hotelId', '==', currentUser.uid));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          console.log('Received snapshot with', snapshot.docs.length, 'bookings');
          const bookingsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
            // Ensure all required fields are present
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
          
          console.log('Processed bookings:', bookingsData);
          
          // Sort bookings by date (newest first) in memory
          bookingsData.sort((a, b) => b.createdAt - a.createdAt);
          
          setBookings(bookingsData);
          if (bookingsData.length > 0) {
            setSelectedBooking(bookingsData[0]);
          }
          setLoading(false);
        }, (error) => {
          console.error('Error fetching bookings:', error);
          setError('Failed to load bookings');
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error setting up bookings listener:', error);
        setError('Failed to load bookings');
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleApprove = async (bookingId) => {
    Alert.alert(
      "Approve Booking",
      "Are you sure you want to approve this booking?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Approve", 
          onPress: async () => {
            try {
              const bookingRef = doc(db, 'bookings', bookingId);
              await updateDoc(bookingRef, { 
                status: 'confirmed',
                updatedAt: serverTimestamp()
              });
              Alert.alert("Success", "Booking has been approved");
              if (selectedBooking && selectedBooking.id === bookingId) {
                setSelectedBooking({...selectedBooking, status: 'confirmed'});
              }
            } catch (error) {
              console.error('Error approving booking:', error);
              Alert.alert("Error", "Failed to approve booking");
            }
          }
        }
      ]
    );
  };

  const handleReject = async (bookingId) => {
    Alert.alert(
      "Reject Booking",
      "Are you sure you want to reject this booking?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Reject", 
          onPress: async () => {
            try {
              const bookingRef = doc(db, 'bookings', bookingId);
              await updateDoc(bookingRef, { 
                status: 'rejected',
                updatedAt: serverTimestamp()
              });
              Alert.alert("Success", "Booking has been rejected");
              if (selectedBooking && selectedBooking.id === bookingId) {
                setSelectedBooking({...selectedBooking, status: 'rejected'});
              }
            } catch (error) {
              console.error('Error rejecting booking:', error);
              Alert.alert("Error", "Failed to reject booking");
            }
          }
        }
      ]
    );
  };

  const handleCancel = () => {
    router.back();
  };

  const handleViewApprovedBookings = () => {
    router.push('/Dashboard/Approve');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return '#4CAF50';
      case 'rejected':
        return '#F44336';
      default:
        return '#FFC107';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      default:
        return 'time';
    }
  };

  const renderBookingItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.bookingCard}
      onPress={() => setSelectedBooking(item)}
    >
      <Image 
        source={item.eventImage ? { uri: item.eventImage } : require('../../assets/convention.jpg')}
        style={styles.bookingImage}
        defaultSource={require('../../assets/convention.jpg')}
      />
      <View style={styles.bookingHeader}>
        <View style={styles.bookingTitleContainer}>
          <Text style={styles.eventTitle} numberOfLines={1}>{item.eventTitle}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Ionicons name={getStatusIcon(item.status)} size={14} color="white" style={styles.statusIcon} />
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.bookingDate}>{item.eventDate}</Text>
      </View>
      
      <View style={styles.bookingInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="person" size={16} color="#747d8c" />
          <Text style={styles.infoText} numberOfLines={1}>{item.fullName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="mail" size={16} color="#747d8c" />
          <Text style={styles.infoText} numberOfLines={1}>{item.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call" size={16} color="#747d8c" />
          <Text style={styles.infoText} numberOfLines={1}>{item.phone}</Text>
        </View>
      </View>

      {selectedBooking?.id === item.id && (
        <View style={styles.expandedContent}>
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Event Information</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Event:</Text>
              <Text style={styles.detailValue}>{item.eventTitle}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Type:</Text>
              <Text style={styles.detailValue}>{item.eventType}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>{item.eventDate}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Location:</Text>
              <Text style={styles.detailValue}>{item.eventLocation}</Text>
            </View>
          </View>

          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Customer Information</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Name:</Text>
              <Text style={styles.detailValue}>{item.fullName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email:</Text>
              <Text style={styles.detailValue}>{item.email}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Phone:</Text>
              <Text style={styles.detailValue}>{item.phone}</Text>
            </View>
          </View>

          {item.status === 'pending' && (
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => handleApprove(item.id)}
              >
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text style={styles.actionButtonText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleReject(item.id)}
              >
                <Ionicons name="close-circle" size={20} color="white" />
                <Text style={styles.actionButtonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading bookings...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="calendar-outline" size={60} color="#2a9d8f" />
        <Text style={styles.errorText}>No bookings found</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#2a9d8f', '#264653']}
        style={styles.headerGradient}
      >
       <View style={styles.header}>
          <TouchableOpacity onPress={()=>setMenuVisible(true)}>
            <Ionicons name="menu" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>User Booking</Text>
          <View style={{width:24}}/>
        </View>
      </LinearGradient>

      <FlatList
        data={bookings}
        renderItem={renderBookingItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />

      {/* Side Menu Modal */}
      <Modal
        animationType="slide"
        transparent={true}
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerGradient: {
    paddingTop: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2a9d8f',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  bookingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookingHeader: {
    marginBottom: 12,
  },
  bookingTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2f3542',
    flex: 1,
    marginRight: 8,
  },
  bookingDate: {
    fontSize: 14,
    color: '#747d8c',
  },
  bookingInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#747d8c',
    flex: 1,
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f2f6',
  },
  detailsSection: {
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2f3542',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  detailLabel: {
    width: 100,
    fontSize: 14,
    color: '#747d8c',
    fontWeight: '500',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#2f3542',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  approveButton: {
    backgroundColor: '#2a9d8f',
  },
  rejectButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sideMenuContent: {
    backgroundColor: 'white',
    width: '80%',
    height: '100%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  menuList: {
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#2f3542',
  },
  bookingImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
  },

});