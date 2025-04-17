import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, FlatList, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useBookings } from '../context/BookingsContext';

// This would typically come from a database or API
const MOCK_BOOKINGS = [
  {
    id: '1',
    eventId: '101',
    eventTitle: 'Summer Music Festival',
    eventImage: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '123-456-7890',
    eventType: 'Concert',
    date: '07/15/2023',
    status: 'pending',
    createdAt: '2023-06-01T10:00:00Z'
  },
  {
    id: '2',
    eventId: '102',
    eventTitle: 'Tech Conference 2023',
    eventImage: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    customerPhone: '098-765-4321',
    eventType: 'Conference',
    date: '08/20/2023',
    status: 'confirmed',
    createdAt: '2023-06-05T14:30:00Z'
  },
  {
    id: '3',
    eventId: '103',
    eventTitle: 'Wedding Ceremony',
    eventImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    customerName: 'Robert Johnson',
    customerEmail: 'robert@example.com',
    customerPhone: '555-123-4567',
    eventType: 'Wedding',
    date: '09/10/2023',
    status: 'rejected',
    createdAt: '2023-06-10T09:15:00Z'
  }
];

export default function UserBooking() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { bookings, updateBookingStatus } = useBookings();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const menuOptions = [
    { id: '1', title: 'Home', icon: 'home', route: '/Dashboard/HomeDashboard' },
    { id: '2', title: 'Events', icon: 'calendar', route: '/Dashboard/Events' },
    { id: '3', title: 'Approve Booking', icon: 'checkmark-circle', route: '/Dashboard/Approve' },
    { id: '4', title: 'Settings', icon: 'settings', route: '/Dashboard/Settings' },
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
    try {
      if (bookings && bookings.length > 0) {
        // Find pending bookings
        const pendingBookings = bookings.filter(booking => booking.status === 'pending');
        if (pendingBookings.length > 0) {
          setSelectedBooking(pendingBookings[0]);
        } else if (bookings.length > 0) {
          setSelectedBooking(bookings[0]);
        }
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [bookings]);

  const handleApprove = (bookingId) => {
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
          onPress: () => {
            updateBookingStatus(bookingId, 'confirmed');
            Alert.alert("Success", "Booking has been approved");
            // Update the selected booking to reflect the change
            if (selectedBooking && selectedBooking.id === bookingId) {
              setSelectedBooking({...selectedBooking, status: 'confirmed'});
            }
          }
        }
      ]
    );
  };

  const handleReject = (bookingId) => {
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
          onPress: () => {
            updateBookingStatus(bookingId, 'rejected');
            Alert.alert("Success", "Booking has been rejected");
            // Update the selected booking to reflect the change
            if (selectedBooking && selectedBooking.id === bookingId) {
              setSelectedBooking({...selectedBooking, status: 'rejected'});
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
      <View style={styles.bookingHeader}>
        <View style={styles.bookingTitleContainer}>
          <Text style={styles.eventTitle} numberOfLines={1}>{item.eventTitle}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Ionicons name={getStatusIcon(item.status)} size={14} color="white" style={styles.statusIcon} />
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.bookingDate}>{item.date}</Text>
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
      </View>

      {selectedBooking?.id === item.id && (
        <View style={styles.expandedContent}>
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Receipt Details</Text>
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

  const renderBookingDetails = () => {
    if (!selectedBooking) return null;

    return (
      <View style={styles.detailsContainer}>
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

        {selectedBooking.status === 'pending' && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={handleCancel}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.approveButton]} 
              onPress={() => handleApprove(selectedBooking.id)}
            >
              <Text style={styles.buttonText}>Approve</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.rejectButton]} 
              onPress={() => handleReject(selectedBooking.id)}
            >
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

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
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Ionicons name="menu" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>User Bookings</Text>
          <TouchableOpacity onPress={handleViewApprovedBookings}>
            <Text style={styles.saveButton}>View Approved</Text>
          </TouchableOpacity>
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
  detailsContainer: {
    padding: 16,
  },
  detailsImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  detailsText: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 40,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f1f2f6',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
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
});