import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useBookings } from '../context/BookingsContext';

export default function MyEvent() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { bookings } = useBookings();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      if (params.bookingData) {
        const bookingData = JSON.parse(params.bookingData);
        setSelectedBooking(bookingData);
      }
    } catch (error) {
      console.error('Error parsing booking data:', error);
      setError("Failed to load booking data");
    } finally {
      setLoading(false);
    }
  }, [params]);

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2a9d8f" />
        <Text style={styles.loadingText}>Loading booking details...</Text>
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
          onPress={() => router.push('/')}
        >
          <Text style={styles.retryButtonText}>Browse Events</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderBookingCard = (booking) => {
    const isSelected = selectedBooking && selectedBooking.id === booking.id;
    return (
      <TouchableOpacity
        key={booking.id}
        style={[styles.bookingCard, isSelected && styles.selectedBookingCard]}
        onPress={() => setSelectedBooking(booking)}
      >
        <Image 
          source={{ uri: booking.eventImage }} 
          style={styles.bookingImage}
        />
        <View style={styles.bookingInfo}>
          <Text style={styles.bookingTitle}>{booking.eventTitle}</Text>
          <Text style={styles.bookingDate}>Date: {booking.eventDate}</Text>
          <Text style={styles.bookingType}>Type: {booking.eventType}</Text>
          <View style={styles.statusContainer}>
            <Ionicons 
              name={getStatusIcon(booking.status)} 
              size={16} 
              color={getStatusColor(booking.status)} 
            />
            <Text style={[styles.bookingStatus, { color: getStatusColor(booking.status) }]}>
              Status: {booking.status}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
          <Text style={styles.title}>My Bookings</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <ScrollView style={styles.bookingsList}>
          {bookings.map(renderBookingCard)}
        </ScrollView>

        {selectedBooking && (
          <View style={styles.detailsContainer}>
            <ScrollView style={styles.detailsScroll}>
              <Image 
                source={{ uri: selectedBooking.eventImage }} 
                style={styles.detailsImage}
              />
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Event Information</Text>
                <Text style={styles.detailsTitle}>{selectedBooking.eventTitle}</Text>
                <Text style={styles.detailsText}>Type: {selectedBooking.eventType}</Text>
                <Text style={styles.detailsText}>Date: {selectedBooking.eventDate}</Text>
                <Text style={styles.detailsText}>Location: {selectedBooking.eventLocation}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Booking Details</Text>
                <Text style={styles.detailsText}>Booking ID: {selectedBooking.id}</Text>
                <View style={styles.statusRow}>
                  <Ionicons 
                    name={getStatusIcon(selectedBooking.status)} 
                    size={20} 
                    color={getStatusColor(selectedBooking.status)} 
                  />
                  <Text style={[styles.detailsText, { color: getStatusColor(selectedBooking.status), marginLeft: 8 }]}>
                    Status: {selectedBooking.status}
                  </Text>
                </View>
                <Text style={styles.detailsText}>Booked on: {new Date(selectedBooking.createdAt).toLocaleDateString()}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Customer Information</Text>
                <Text style={styles.detailsText}>Name: {selectedBooking.fullName}</Text>
                <Text style={styles.detailsText}>Email: {selectedBooking.email}</Text>
                <Text style={styles.detailsText}>Phone: {selectedBooking.phone}</Text>
              </View>
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  headerGradient: {
    paddingTop: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginLeft: 16,
    color: 'white',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  bookingsList: {
    flex: 1,
    padding: 10,
  },
  bookingCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedBookingCard: {
    borderColor: '#2a9d8f',
    borderWidth: 2,
  },
  bookingImage: {
    width: '100%',
    height: 120,
  },
  bookingInfo: {
    padding: 10,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bookingDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  bookingType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  detailsContainer: {
    flex: 2,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  detailsScroll: {
    flex: 1,
    padding: 15,
  },
  detailsImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  section: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 16,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
});
