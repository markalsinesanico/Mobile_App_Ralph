import React, { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEvents } from '../context/EventsContext';

export default function SavedEvents() {
  const router = useRouter();
  const { savedEvents, removeSavedEvent } = useEvents();
  const [fadeAnim] = useState(new Animated.Value(1));

  const handleEventPress = (event) => {
    router.push({
      pathname: '/NOnav/Checkout',
      params: {
        id: event.id,
        title: event.title,
        location: event.location,
        venue: event.venue,
        image: event.image,
        description: event.description || "No description available",
        categories: event.categories || "General"
      }
    });
  };

  const handleRemoveEvent = (eventId) => {
    // Animate the removal
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();

    Alert.alert(
      "Remove Event",
      "Are you sure you want to remove this event from your saved events?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Remove",
          onPress: () => {
            // Remove the event with animation
            removeSavedEvent(eventId);
            
            // Show success message
            Alert.alert(
              "Event Removed",
              "The event has been removed from your saved events.",
              [{ text: "OK" }]
            );
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      <View style={styles.container}>
        <LinearGradient
          colors={['#2a9d8f', '#264653']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={handleBackPress} 
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.title}>Saved Events</Text>
          </View>
        </LinearGradient>
        
        {savedEvents.length > 0 ? (
          <ScrollView style={styles.eventList}>
            {savedEvents.map(event => (
              <Animated.View 
                key={event.id} 
                style={[
                  styles.eventCard,
                  { opacity: fadeAnim }
                ]}
              >
                <TouchableOpacity onPress={() => handleEventPress(event)}>
                  <Image source={event.image} style={styles.eventImage} />
                  <View style={styles.eventDetails}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.venue}><Text style={{ fontWeight: 'bold' }}>{event.venue}</Text></Text>
                    <Text style={styles.location}><FontAwesome name="map-marker" size={14} color="gray" /> {event.location}</Text>
                    <Text style={styles.rating}>⭐⭐⭐⭐</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => handleRemoveEvent(event.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#ff3b30" />
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="bookmark-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>No saved events yet</Text>
            <Text style={styles.emptySubtext}>Events you bookmark will appear here</Text>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => router.push('/')}
            >
              <Text style={styles.exploreButtonText}>Explore Events</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f8f9fa" 
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  eventList: { 
    padding: 10 
  },
  eventCard: { 
    backgroundColor: "white", 
    borderRadius: 15, 
    overflow: "hidden", 
    marginBottom: 15, 
    shadowColor: "#000", 
    shadowOpacity: 0.1, 
    shadowRadius: 5, 
    elevation: 3,
    position: 'relative'
  },
  eventImage: { 
    width: "100%", 
    height: 180, 
    resizeMode: "cover" 
  },
  eventDetails: { 
    padding: 15 
  },
  eventTitle: { 
    fontSize: 18, 
    fontWeight: "600", 
    marginBottom: 5,
    color: '#1a1a1a'
  },
  venue: { 
    fontSize: 15, 
    color: "#2a9d8f",
    marginBottom: 4
  },
  location: { 
    fontSize: 14, 
    color: "#666",
    marginBottom: 8
  },
  rating: { 
    fontSize: 14, 
    color: "#FFD700", 
    marginTop: 5 
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    color: '#1a1a1a',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  exploreButton: {
    backgroundColor: '#2a9d8f',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  exploreButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    marginLeft: 10,
    color: 'white',
  },
});
