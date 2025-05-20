import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, Image, ScrollView, StyleSheet,
  Modal, TextInput, KeyboardAvoidingView, Platform, Alert
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useEvents } from '../context/EventsContext';
import { useBookings } from "../context/BookingsContext";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, updateDoc, doc, where } from 'firebase/firestore';
import { db } from '../../firebaseconfig';
import { useAuth } from '../context/AuthContext';

export default function EventDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { getEventById } = useEvents();
  const { addBooking } = useBookings();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isReceiptVisible, setIsReceiptVisible] = useState(false);
  const [showAllEventTypes, setShowAllEventTypes] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [event, setEvent] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    eventType: 'Conference',
    date: '',
  });
  const { currentUser } = useAuth();

  const eventTypes = [
    'Conference', 'Workshop', 'Birthday', 'Wedding', 'Anniversary',
    'Corporate Event', 'Concert', 'Exhibition', 'Seminar', 'Other'
  ];

  useEffect(() => {
    // If we have an ID, get the event from context
    if (params.id) {
      const eventData = getEventById(params.id);
      if (eventData) {
        setEvent(eventData);
      } else {
        // Fallback to params if event not found in context
        setEvent({
          id: params.id,
          title: params.title,
          location: params.location,
          venue: params.venue,
          imageUrl: params.imageUrl,
          description: params.description
        });
      }
    } else {
      // Fallback to params if no ID (for backward compatibility)
      setEvent({
        id: params.id,
        title: params.title,
        location: params.location,
        venue: params.venue,
        imageUrl: params.imageUrl,
        description: params.description
      });
    }
  }, [params, getEventById]);

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.phoneNumber || !formData.date) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!currentUser) {
      Alert.alert('Error', 'Please log in to make a booking');
      return;
    }

    try {
      const newBooking = {
        eventId: event.id,
        eventTitle: event.title,
        eventDate: formData.date,
        eventLocation: event.location,
        eventImage: event.imageUrl,
        fullName: formData.fullName,
        email: currentUser.email,
        phone: formData.phoneNumber,
        eventType: formData.eventType,
        status: 'pending',
        createdAt: serverTimestamp()
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, 'bookings'), newBooking);
      
      // Create the booking object with the Firestore ID
      const bookingWithId = { ...newBooking, id: docRef.id };
      
      // Add to local context
      addBooking(bookingWithId);
      
      // Set the selected booking
      setSelectedBooking(bookingWithId);

      // Close form and show receipt
      setIsFormVisible(false);
      setIsReceiptVisible(true);

      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phoneNumber: '',
        eventType: 'Conference',
        date: '',
      });

    } catch (error) {
      console.error('Error submitting booking:', error);
      Alert.alert('Error', 'Failed to submit booking. Please try again.');
    }
  };

  const handleViewBooking = () => {
    if (!selectedBooking) {
      Alert.alert('Error', 'No booking selected');
      return;
    }
    setIsReceiptVisible(false);
    router.push({
      pathname: '/NOnav/MyEvent',
      params: { bookingId: selectedBooking.id }
    });
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });
      setFormData({ ...formData, date: formattedDate });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#4CAF50';
      case 'rejected': return '#F44336';
      default: return '#FFC107';
    }
  };

  if (!event) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2a9d8f', '#264653']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Book Now</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView}>
        <Image 
          source={event.imageUrl ? { uri: event.imageUrl } : require('../../assets/convention.jpg')}
          style={styles.eventImage}
          defaultSource={require('../../assets/convention.jpg')}
        />


        <View style={styles.section}>
          <Text style={styles.subTitle}>Location</Text>
          <View style={styles.mapCard}>
            <Text>{event.location}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.subTitle}>Description</Text>
          <Text>{event.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subTitle}>About Organiser</Text>
          <View style={styles.organiserCard}>
            <View style={styles.profilePic} />
            <View>
              <Text style={styles.organiserName}>Mong Sin</Text>
            </View>
          </View>

  
        </View>

        <TouchableOpacity
          style={styles.checkOutButton}
          onPress={() => setIsFormVisible(true)}
        >
          <Text style={styles.checkOutText}>Check Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={isFormVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFormVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Checkout Form</Text>
              <TouchableOpacity
                onPress={() => setIsFormVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.formContainer}
            >
              <ScrollView>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your phone number"
                    keyboardType="phone-pad"
                    value={formData.phoneNumber}
                    onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                    maxLength={15}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Event Type</Text>
                  <View style={styles.eventTypeWrapper}>
                    {showAllEventTypes ? (
                      <ScrollView style={styles.eventTypeContainer}>
                        {eventTypes.map((type) => (
                          <TouchableOpacity
                            key={type}
                            style={[
                              styles.eventTypeButton,
                              formData.eventType === type && styles.selectedEventType
                            ]}
                            onPress={() => {
                              setFormData({ ...formData, eventType: type });
                              setShowAllEventTypes(false);
                            }}
                          >
                            <Text style={[
                              styles.eventTypeText,
                              formData.eventType === type && styles.selectedEventTypeText
                            ]}>{type}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    ) : (
                      <TouchableOpacity
                        style={styles.selectedEventTypeButton}
                        onPress={() => setShowAllEventTypes(true)}
                      >
                        <Text style={styles.selectedEventTypeText}>{formData.eventType}</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.scrollIconContainer}
                      onPress={() => setShowAllEventTypes(!showAllEventTypes)}
                    >
                      <Ionicons
                        name={showAllEventTypes ? "chevron-up" : "chevron-down"}
                        size={24}
                        color="#666"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Date</Text>
                  <View style={styles.dateInputContainer}>
                    <TextInput
                      style={styles.dateInput}
                      placeholder="Enter date (MM/DD/YYYY)"
                      value={formData.date}
                      onChangeText={(text) => setFormData({ ...formData, date: text })}
                      keyboardType="numeric"
                      editable={false}
                    />
                    <TouchableOpacity
                      style={styles.calendarIconContainer}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Ionicons name="calendar" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>
                  {showDatePicker && (
                    <DateTimePicker
                      value={formData.date ? new Date(formData.date) : new Date()}
                      mode="date"
                      display="default"
                      onChange={handleDateChange}
                    />
                  )}
                </View>

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}
                >
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>

      {/* Receipt Modal */}
      <Modal
        visible={isReceiptVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsReceiptVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.receiptContent}>
            <View style={styles.receiptHeader}>
              <Text style={styles.receiptTitle}>Booking Confirmation</Text>
              <TouchableOpacity
                onPress={() => setIsReceiptVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.receiptScroll}>
              <View style={styles.receiptSection}>
                <Text style={styles.receiptSectionTitle}>Event Information</Text>
                <Text style={styles.receiptText}>Event: {event.title}</Text>
                <Text style={styles.receiptText}>Type: {formData.eventType}</Text>
                <Text style={styles.receiptText}>Location: {event.location}</Text>
              </View>

              <View style={styles.receiptSection}>
                <Text style={styles.receiptSectionTitle}>Booking Details</Text>
                <Text style={styles.receiptText}>Status: Pending</Text>
                <Text style={styles.receiptText}>Booked on: {new Date().toLocaleDateString()}</Text>
              </View>

              <View style={styles.receiptSection}>
          <Text style={styles.receiptSectionTitle}>Customer Information</Text>
          <Text style={styles.receiptText}>Name: {selectedBooking.fullName}</Text>
          <Text style={styles.receiptText}>Email: {selectedBooking.email}</Text>
          <Text style={styles.receiptText}>Phone: {selectedBooking.phone}</Text>
        </View>

              <TouchableOpacity
                style={styles.viewBookingButton}
                onPress={handleViewBooking}
              >
                <Text style={styles.viewBookingText}>View My Bookings</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  headerGradient: { paddingTop: 5, paddingBottom: 20, paddingHorizontal: 15 },
  header: {
    flexDirection: 'row', alignItems: 'center', padding: 5, backgroundColor: 'transparent',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4,
  },
  backButton: {
    padding: 10, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 50,
  },
  title: { fontSize: 24, fontWeight: '500', marginLeft: 10, color: 'white' },
  scrollView: { padding: 15 },
  eventImage: { width: '100%', height: 200, borderRadius: 10, marginBottom: 15 },
  section: { marginBottom: 20 },
  location: { fontSize: 16, color: 'gray' },
  subTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  mapCard: {
    padding: 15, borderRadius: 10, backgroundColor: '#f4f4f4',
    borderWidth: 1, borderColor: '#ddd',
  },
  viewMapButton: {
    marginTop: 10, padding: 10, backgroundColor: '#264653',
    borderRadius: 5, alignItems: 'center',
  },
  viewMapText: { color: 'white', fontWeight: 'bold' },
  organiserCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  profilePic: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#ddd', marginRight: 10 },
  organiserName: { fontSize: 16, fontWeight: 'bold' },
  links: { marginTop: 10 },
  linkText: { color: '#2a9d8f', textDecorationLine: 'underline' },
  checkOutButton: {
    marginTop: 5, marginBottom: 30, backgroundColor: '#2a9d8f',
    paddingVertical: 15, borderRadius: 8, alignItems: 'center', width: '100%',
  },
  checkOutText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  modalOverlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: { width: '90%', backgroundColor: 'white', borderRadius: 10, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  closeButton: { padding: 5 },
  formContainer: { marginTop: 15 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 16, marginBottom: 5 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 8,
  },
  eventTypeWrapper: { flexDirection: 'row', alignItems: 'center' },
  eventTypeContainer: { maxHeight: 150 },
  eventTypeButton: {
    paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: '#ccc',
    borderRadius: 20, marginRight: 8, marginBottom: 8,
  },
  selectedEventType: {
    backgroundColor: '#2a9d8f', borderColor: '#2a9d8f',
  },
  eventTypeText: { fontSize: 14 },
  selectedEventTypeText: { color: 'white' },
  selectedEventTypeButton: {
    padding: 10, backgroundColor: '#f0f0f0',
    borderRadius: 20, marginRight: 8,
  },
  scrollIconContainer: { padding: 8 },
  dateInputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
  },
  dateInput: {
    flex: 1, paddingHorizontal: 10, paddingVertical: 8,
  },
  calendarIconContainer: { paddingHorizontal: 10 },
  submitButton: {
    marginTop: 10, backgroundColor: '#2a9d8f',
    paddingVertical: 12, borderRadius: 8, alignItems: 'center',
  },
  submitButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  receiptContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  receiptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2a9d8f',
  },
  receiptScroll: {
    maxHeight: '80%',
  },
  receiptSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  receiptSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#264653',
  },
  receiptText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  viewBookingButton: {
    backgroundColor: '#2a9d8f',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  viewBookingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailsText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
});
