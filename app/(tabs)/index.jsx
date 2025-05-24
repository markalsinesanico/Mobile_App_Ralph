import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, query, where, onSnapshot, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseconfig';

export default function Categories() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // First, fetch all hotels to create a map of hotel IDs to names
        const hotelsRef = collection(db, 'users');
        const hotelsQuery = query(hotelsRef, where('role', '==', 'hotel'));
        const hotelsSnapshot = await getDocs(hotelsQuery);
        const hotelsMap = {};
        hotelsSnapshot.forEach(doc => {
          hotelsMap[doc.id] = {
            name: doc.data().fullName || 'Unknown Hotel',
            phone: doc.data().phoneNumber || 'No phone available',
            email: doc.data().email || 'No email available'
          };
        });

        // Then fetch events
        const eventsRef = collection(db, 'events');
        const q = query(eventsRef, where('status', '==', 'active'));
        
        const unsubscribe = onSnapshot(q, async (snapshot) => {
          const eventsData = await Promise.all(snapshot.docs.map(async doc => {
            const eventData = doc.data();
            const hotelId = eventData.hotelId;
            let hotelInfo = hotelsMap[hotelId] || {
              name: 'Unknown Hotel',
              phone: 'No phone available',
              email: 'No email available'
            };

            // If hotel not in map, try to fetch it directly
            if (!hotelsMap[hotelId] && hotelId) {
              try {
                const hotelDoc = await getDoc(doc(db, 'users', hotelId));
                if (hotelDoc.exists()) {
                  const hotelData = hotelDoc.data();
                  hotelInfo = {
                    name: hotelData.fullName || 'Unknown Hotel',
                    phone: hotelData.phoneNumber || 'No phone available',
                    email: hotelData.email || 'No email available'
                  };
                }
              } catch (error) {
                console.error('Error fetching hotel details:', error);
              }
            }

            return {
              id: doc.id,
              ...eventData,
              createdAt: eventData.createdAt?.toDate() || new Date(),
              hotelName: hotelInfo.name,
              hotelPhone: hotelInfo.phone,
              hotelEmail: hotelInfo.email
            };
          }));
          
          // Sort events by date (newest first)
          eventsData.sort((a, b) => b.createdAt - a.createdAt);
          setEvents(eventsData);
          setLoading(false);
        }, (error) => {
          console.error('Error fetching events:', error);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error setting up events listener:', error);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleEventPress = (event) => {
    router.push({
      pathname: '/NOnav/Checkout',
      params: { 
        id: event.id,
        forceRefresh: true 
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2a9d8f', '#264653']}
        style={styles.headerGradient}
      >
        <Text style={styles.headerTitle}>EVENT VENUE</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {events.map((event) => (
          <TouchableOpacity 
            key={event.id} 
            style={styles.eventCard}
            onPress={() => handleEventPress(event)}
            activeOpacity={0.9}
          >
            <Image 
              source={event.imageUrl ? { uri: event.imageUrl } : require('../../assets/convention.jpg')} 
              style={styles.eventImage}
              defaultSource={require('../../assets/convention.jpg')}
            />
            <View style={styles.cardContent}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <View style={styles.locationRow}>
                <FontAwesome name="map-marker" size={14} color="#888" />
                <Text style={styles.locationText}>{event.location}</Text>
              </View>
         
              <View style={styles.footerRow}>
                <Text style={styles.hotelName}>By: {event.hotelName}</Text>
                <Text style={styles.categories}>{event.categories || 'Event'}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f5f6fa" 
  },
  headerGradient: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center'
  },
  scrollViewContent: {
    padding: 16
  },
  eventCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  eventImage: {
    width: "100%",
    height: 180,
    resizeMode: "cover"
  },
  cardContent: {
    padding: 14
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  locationText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#666"
  },
  description: {
    fontSize: 14,
    color: "#444",
    marginBottom: 10
  },
  categories: {
    fontSize: 13,
    color: '#2a9d8f',
    fontWeight: '500',
    flex: 1
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopColor: '#eee',
    borderTopWidth: 1,
    paddingTop: 10
  },
  hotelName: {
    fontSize: 13,
    color: '#2a9d8f',
    fontWeight: '500',
    marginRight: 8
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  },
  loadingText: {
    fontSize: 16,
    color: '#666'
  }
});
