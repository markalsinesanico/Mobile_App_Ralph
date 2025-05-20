import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Modal, FlatList,
  TextInput, Image, ScrollView, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useEvents } from '../context/EventsContext';

// Firebase imports
import { auth, db } from '../../firebaseconfig';
import { collection, addDoc, Timestamp, query, where, getDocs, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

// Cloudinary config
const CLOUD_NAME = 'dpylptqd6';
const UPLOAD_PRESET = 'unsigned_events';

const Dashboard = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [addFormVisible, setAddFormVisible] = useState(false);
  const [eventImage, setEventImage] = useState(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalBookings: 0,
    approvedBookings: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const router = useRouter();
  const { addEvent } = useEvents();

  // Fetch statistics and recent bookings
  useEffect(() => {
    const fetchStatsAndBookings = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        // Fetch total events
        const eventsQuery = query(
          collection(db, 'events'),
          where('hotelId', '==', currentUser.uid)
        );
        const eventsSnapshot = await getDocs(eventsQuery);
        const totalEvents = eventsSnapshot.size;

        // Fetch total bookings
        const bookingsQuery = query(
          collection(db, 'bookings'),
          where('hotelId', '==', currentUser.uid)
        );
        const bookingsSnapshot = await getDocs(bookingsQuery);
        const totalBookings = bookingsSnapshot.size;

        // Fetch approved bookings
        const approvedBookingsQuery = query(
          collection(db, 'bookings'),
          where('hotelId', '==', currentUser.uid),
          where('status', '==', 'confirmed')
        );
        const approvedBookingsSnapshot = await getDocs(approvedBookingsQuery);
        const approvedBookings = approvedBookingsSnapshot.size;

        // Fetch recent pending bookings only
        const recentBookingsQuery = query(
          collection(db, 'bookings'),
          where('hotelId', '==', currentUser.uid),
          where('status', '==', 'pending')
        );
        const recentBookingsSnapshot = await getDocs(recentBookingsQuery);
        const recentBookingsData = recentBookingsSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt || Timestamp.now()
          }))
          .sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate())
          .slice(0, 5);

        setStats({
          totalEvents,
          totalBookings,
          approvedBookings
        });
        setRecentBookings(recentBookingsData);
      } catch (error) {
        console.error('Error fetching stats:', error);
        Alert.alert('Error', 'Failed to load statistics. Please try again later.');
      }
    };

    fetchStatsAndBookings();
  }, []);

  const menuOptions = [
    { id: '1', title: 'Events', icon: 'calendar', route: '/Dashboard/Events' },
    { id: '2', title: 'User Booking', icon: 'book', route: '/Dashboard/UserBooking' },
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

  // 1. Pick image from library
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permission required', 'Camera roll permissions are needed to select an image.');
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets ? result.assets[0].uri : result.uri;
      setEventImage(uri);
    }
  };

  // 2. Upload image to Cloudinary
  const uploadImageToCloudinary = async (uri) => {
    if (!uri) throw new Error('No image selected');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'image/jpeg',
        name: `upload_${Date.now()}.jpg`,
      });
      formData.append('upload_preset', UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await response.json();
      setUploading(false);
      return data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      setUploading(false);
      throw new Error('Failed to upload image');
    }
  };

  // 3. Save form data to Firestore
  const handleAddEvent = async () => {
    if (!eventTitle.trim() || !eventLocation.trim() || !eventDescription.trim() || !eventImage) {
      return Alert.alert('Error', 'All fields are required, including an image.');
    }

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in to create an event.');
        return;
      }

      // upload to Cloudinary
      const imageUrl = await uploadImageToCloudinary(eventImage);

      const eventData = {
        title: eventTitle,
        location: eventLocation,
        description: eventDescription,
        imageUrl,
        categories: 'Event',
        venue: eventLocation,
        createdAt: Timestamp.now(),
        hotelId: currentUser.uid,
        hotelName: currentUser.displayName || 'Unknown Hotel',
        status: 'active'
      };

      // add to Firestore
      await addDoc(collection(db, 'events'), eventData);

      Alert.alert('Success', 'Event added successfully!');
      setEventTitle('');
      setEventLocation('');
      setEventDescription('');
      setEventImage(null);
      setAddFormVisible(false);
    } catch (error) {
      console.error('Error adding event:', error);
      Alert.alert('Error', error.message || 'Could not save event.');
    }
  };

  // Add function to handle booking status updates
  const handleBookingStatus = async (bookingId, newStatus) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: newStatus
      });

      // Update local state
      setRecentBookings(prevBookings => 
        prevBookings.filter(booking => booking.id !== bookingId)
      );

      // Update stats
      setStats(prevStats => ({
        ...prevStats,
        approvedBookings: newStatus === 'confirmed' 
          ? prevStats.approvedBookings + 1 
          : prevStats.approvedBookings
      }));

      Alert.alert('Success', `Booking ${newStatus === 'confirmed' ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      Alert.alert('Error', 'Failed to update booking status');
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

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <LinearGradient colors={['#2a9d8f', '#264653']} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Ionicons name="menu" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Dashboard</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      {/* CONTENT */}
      <ScrollView style={styles.content}>
        {/* Statistics Cards */}
        <View style={styles.cards}>
          <View style={styles.card}>
            <View style={styles.cardIconContainer}>
              <Ionicons name="calendar" size={24} color="#2a9d8f" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Total Events</Text>
              <Text style={styles.cardValue}>{stats.totalEvents}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardIconContainer}>
              <Ionicons name="book" size={24} color="#2a9d8f" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Total Bookings</Text>
              <Text style={styles.cardValue}>{stats.totalBookings}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardIconContainer}>
              <Ionicons name="checkmark-circle" size={24} color="#2a9d8f" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Total Approved</Text>
              <Text style={styles.cardValue}>{stats.approvedBookings}</Text>
            </View>
          </View>
        </View>

        {/* New Bookings */}
        <View style={styles.bookingsSection}>
  <Text style={styles.bookingsTitle}>New Bookings</Text>
  {recentBookings.length > 0 ? (
    recentBookings.map((booking) => (
      <View key={booking.id} style={styles.bookingCard}>
        <View style={styles.bookingInfo}>
          <Text style={styles.bookingEvent}>{booking.eventTitle}</Text>
          <Text style={styles.bookingUser}>{booking.fullName}</Text>
          <Text style={styles.bookingDate}>
            {booking.createdAt?.toDate().toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.bookingButtons}>
          <TouchableOpacity
            style={[styles.button, styles.approve]}
            onPress={() => handleBookingStatus(booking.id, 'confirmed')}
          >
            <Ionicons name="checkmark" size={16} color="#fff" />
            <Text style={styles.buttonText}>Approve</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.reject]}
            onPress={() => handleBookingStatus(booking.id, 'rejected')}
          >
            <Ionicons name="close" size={16} color="#fff" />
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    ))
  ) : (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>No new bookings</Text>
    </View>
  )}
</View>
       
      </ScrollView>

      {/* FAB */}
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
            <FlatList data={menuOptions} renderItem={renderMenuItem} keyExtractor={i => i.id} />
          </View>
        </View>
      </Modal>

      {/* ADD EVENT FORM */}
      <Modal transparent visible={addFormVisible} animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.formModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Event</Text>
              <TouchableOpacity onPress={() => setAddFormVisible(false)}>
                <Ionicons name="close" size={24} color="#2f3542" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.formScroll}>
              <TouchableOpacity style={styles.imagePickerContainer} onPress={pickImage}>
                {eventImage ? (
                  <Image source={{ uri: eventImage }} style={styles.eventImage} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="image" size={40} color="#b2bec3" />
                    <Text style={styles.imagePlaceholderText}>Add Event Image</Text>
                  </View>
                )}
              </TouchableOpacity>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Event Title</Text>
                <TextInput
                  style={styles.input}
                  value={eventTitle}
                  onChangeText={setEventTitle}
                  placeholder="Enter event title"
                  placeholderTextColor="#b2bec3"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Location</Text>
                <TextInput
                  style={styles.input}
                  value={eventLocation}
                  onChangeText={setEventLocation}
                  placeholder="Enter event location"
                  placeholderTextColor="#b2bec3"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={eventDescription}
                  onChangeText={setEventDescription}
                  placeholder="Enter event description"
                  placeholderTextColor="#b2bec3"
                  multiline numberOfLines={4} textAlignVertical="top"
                />
              </View>
              <TouchableOpacity
                style={[styles.submitButton, uploading && { opacity: 0.6 }]}
                onPress={handleAddEvent}
                disabled={uploading}
              >
                <Text style={styles.submitButtonText}>
                  {uploading ? 'Uploading...' : 'Add Event'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f2f6',
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
  content: {
    flex: 1,
    padding: 16,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2f3542',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#747d8c',
  },
  cards: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f2f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    color: '#747d8c',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2f3542',
    marginBottom: 4,
  },
  cardChange: {
    fontSize: 12,
    color: '#2a9d8f',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2f3542',
    marginBottom: 16,
  },
  activityList: {
    gap: 12,
  },
  bookingItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  bookingContent: {
    flex: 1,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2f3542',
    marginBottom: 4,
  },
  bookingDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  bookingTime: {
    fontSize: 12,
    color: '#a4b0be',
  },
  bookingActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
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
  formModalContent: {
    backgroundColor: 'white',
    marginTop: 50,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2f3542',
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
  formScroll: {
    maxHeight: '100%',
  },
  imagePickerContainer: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#f1f2f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  imagePlaceholderText: {
    marginTop: 10,
    color: '#b2bec3',
    fontSize: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#2f3542',
  },
  input: {
    backgroundColor: '#f1f2f6',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#2f3542',
  },
  textArea: {
    height: 120,
  },
  submitButton: {
    backgroundColor: '#1e90ff',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noBookingsContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginTop: 10,
  },
  noBookingsText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  bookingsSection: {
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  bookingsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#264653',
    marginBottom: 12,
  },
  bookingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    // Android
    elevation: 2,
    // iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  bookingInfo: {
    flex: 1,
    paddingRight: 8,
  },
  bookingEvent: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2a9d8f',
    marginBottom: 4,
  },
  bookingUser: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  bookingDate: {
    fontSize: 12,
    color: '#888',
  },
  bookingButtons: {
    flexDirection: 'row',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginLeft: 6,
  },
  approve: {
    backgroundColor: '#4CAF50',
  },
  reject: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyState: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
  },
});

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
  