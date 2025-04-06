import React from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';

const events = [
  {
    id: 1,
    title: "Rail Fest 6",
    location: "Hamilton, Waikato, New Zealand",
    venue: "gateway",
    image: require("../../assets/convention.jpg"),
    description: "A fantastic music festival featuring top artists from around the world.",
    categories: "Music, Entertainment, Festival"
  },
  {
    id: 2,
    title: "Open Stage Cultural Fest",
    location: "Auckland, Auckland, New Zealand",
    venue: "Gaisano",
    image: require("../../assets/conference.jpg"),
    description: "Experience diverse cultural performances and exhibitions.",
    categories: "Culture, Arts, Entertainment"
  },
];

export default function Categories() {
  const router = useRouter();

  const handleEventPress = (event) => {
    router.push({
      pathname: '/NOnav/Checkout',
      params: {
        title: event.title,
        location: event.location,
        venue: event.venue,
        image: event.image,
        description: event.description,
        categories: event.categories
      }
    });
  };

  return (
    <>
      <Stack.Screen options={{ title: '' }} />
      <View style={styles.container}>
        <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
          <Text style={styles.title}>Discover Events</Text>
          <Text style={styles.location}><FontAwesome name="map-marker" size={16} color="gray" /> New Zealand</Text>
        </View>

        <ScrollView style={styles.eventList}>
          {events.map(event => (
            <TouchableOpacity 
              key={event.id} 
              style={styles.eventCard}
              onPress={() => handleEventPress(event)}
            >
              <Image source={event.image} style={styles.eventImage} />
              <View style={styles.eventDetails}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.venue}><Text style={{ fontWeight: 'bold' }}>{event.venue}</Text></Text>
                <Text style={styles.location}><FontAwesome name="map-marker" size={14} color="gray" /> {event.location}</Text>
                <Text style={styles.rating}>⭐⭐⭐⭐</Text>
                <View style={styles.actions}>
                  <TouchableOpacity>
                    <FontAwesome name="bookmark" size={20} color="black" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f4f4" },
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center",
    padding: 20, 
    backgroundColor: "white" 
  },
  title: { fontSize: 18, fontWeight: "bold" },
  location: { fontSize: 14, color: "gray" },
  rating: { fontSize: 14, color: "black", marginTop: 5 },
  eventList: { padding: 10 },
  eventCard: { backgroundColor: "white", borderRadius: 10, overflow: "hidden", marginBottom: 15, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  eventImage: { width: "100%", height: 180, resizeMode: "cover" },
  eventDetails: { padding: 10 },
  eventTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  venue: { fontSize: 14, color: "black" },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 15, marginTop: 5 },
  bottomNav: { flexDirection: "row", justifyContent: "space-around", backgroundColor: "white", padding: 10, borderTopWidth: 1, borderTopColor: "lightgray" },
  active: { fontWeight: "bold" },
});