import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Modal, 
  FlatList,
  TextInput,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useEvents } from '../context/EventsContext';
import { LinearGradient } from 'expo-linear-gradient';

const Dashboard = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [addFormVisible, setAddFormVisible] = useState(false);
  const [eventImage, setEventImage] = useState(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const router = useRouter();
  const { addEvent } = useEvents();

  const menuOptions = [
    { id: '1', title: 'Events', icon: 'calendar', route: '/Dashboard/Events' },
    { id: '2', title: 'User Booking', icon: 'book', route: '/Dashboard/UserBooking' },
    { id: '3', title: 'Approve Booking', icon: 'checkmark-circle', route: '/Dashboard/Approve' },
    { id: '4', title: 'Logout', icon: 'log-out', route: '/logout' },
  ];

  const handleMenuOption = (route) => {
    setMenuVisible(false);
    if (route === '/logout') {
      // Handle logout logic here
      console.log('Logout pressed');
    } else {
      router.push(route);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setEventImage(result.assets[0].uri);
    }
  };

  const handleAddEvent = () => {
    // Validate form fields
    if (!eventTitle.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }
    
    if (!eventLocation.trim()) {
      Alert.alert('Error', 'Please enter an event location');
      return;
    }
    
    if (!eventDescription.trim()) {
      Alert.alert('Error', 'Please enter an event description');
      return;
    }
    
    if (!eventImage) {
      Alert.alert('Error', 'Please add an event image');
      return;
    }
    
    // Create new event object
    const newEvent = {
      id: Date.now().toString(), // Generate a unique ID
      title: eventTitle,
      location: eventLocation,
      description: eventDescription,
      image: eventImage,
      date: new Date().toLocaleDateString(), // Add current date as default
      venue: eventLocation, // Using location as venue for simplicity
    };
    
    // Add event to context
    addEvent(newEvent);
    
    // Show success message
    Alert.alert('Success', 'Event added successfully!');
    
    // Reset form and close modal
    setEventTitle('');
    setEventLocation('');
    setEventDescription('');
    setEventImage(null);
    setAddFormVisible(false);
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

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#2a9d8f', '#264653']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Ionicons name="menu" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Dashboard</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
        </View>

        <View style={styles.cards}>
          <View style={styles.card}>
            <View style={styles.cardIconContainer}>
              <Ionicons name="people" size={24} color="#2a9d8f" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Total Users</Text>
              <Text style={styles.cardValue}>1,204</Text>
              <Text style={styles.cardChange}>+12% this month</Text>
            </View>
          </View>
          <View style={styles.card}>
            <View style={styles.cardIconContainer}>
              <Ionicons name="calendar" size={24} color="#2a9d8f" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Total Bookings</Text>
              <Text style={styles.cardValue}>320</Text>
              <Text style={styles.cardChange}>+8% this month</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#e3f2fd' }]}>
                <Ionicons name="calendar-check" size={20} color="#1976d2" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>New Booking</Text>
                <Text style={styles.activityDesc}>John Doe booked Summer Music Festival</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#e8f5e9' }]}>
                <Ionicons name="checkmark-circle" size={20} color="#2e7d32" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Booking Approved</Text>
                <Text style={styles.activityDesc}>Tech Conference booking was approved</Text>
                <Text style={styles.activityTime}>5 hours ago</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setAddFormVisible(true)}
      >
        <LinearGradient
          colors={['#2a9d8f', '#264653']}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={30} color="white" />
        </LinearGradient>
      </TouchableOpacity>

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

      {/* Add Event Form Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addFormVisible}
        onRequestClose={() => setAddFormVisible(false)}
      >
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
              <TouchableOpacity 
                style={styles.imagePickerContainer}
                onPress={pickImage}
              >
                {eventImage ? (
                  <Image 
                    source={{ uri: eventImage }} 
                    style={styles.eventImage} 
                  />
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
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
              
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleAddEvent}
              >
                <Text style={styles.submitButtonText}>Add Event</Text>
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
  activityItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2f3542',
    marginBottom: 4,
  },
  activityDesc: {
    fontSize: 14,
    color: '#747d8c',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#a4b0be',
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
});
