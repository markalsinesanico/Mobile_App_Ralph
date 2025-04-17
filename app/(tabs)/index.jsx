import React from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEvents } from '../context/EventsContext';

export default function Categories() {
  const router = useRouter();
  const { events, savedEvents, saveEvent, removeSavedEvent, isEventSaved } = useEvents();

  const handleEventPress = (event) => {
    router.push({
      pathname: '/NOnav/Checkout',
      params: {
        id: event.id,
        title: event.title,
        location: event.location,
        venue: event.venue,
        image: event.image,
        description: event.description,
        categories: event.categories
      }
    });
  };

  const handleBookmarkPress = (event) => {
    if (isEventSaved(event.id)) {
      removeSavedEvent(event.id);
      Alert.alert("Event Removed", "Event has been removed from your saved events.");
    } else {
      saveEvent(event);
      Alert.alert("Event Saved", "Event has been added to your saved events.");
    }
  };

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
              source={typeof event.image === 'string' ? { uri: event.image } : event.image} 
              style={styles.eventImage} 
            />
            <View style={styles.cardContent}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <View style={styles.locationRow}>
                <FontAwesome name="map-marker" size={14} color="#888" />
                <Text style={styles.locationText}>{event.location}</Text>
              </View>
              <Text style={styles.description}>{event.description}</Text>
              <View style={styles.footerRow}>
                <Text style={styles.categories}>{event.categories || 'Event'}</Text>
                <TouchableOpacity onPress={() => handleBookmarkPress(event)}>
                  <FontAwesome 
                    name={isEventSaved(event.id) ? "bookmark" : "bookmark-o"} 
                    size={20} 
                    color={isEventSaved(event.id) ? "#2a9d8f" : "#888"} 
                  />
                </TouchableOpacity>
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
  }
});
