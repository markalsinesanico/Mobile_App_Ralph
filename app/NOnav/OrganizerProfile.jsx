import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

export default function OrganizerProfile() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Organizer Profile</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.profileHeader}>
          <View style={styles.profilePicLarge} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Mong Sin</Text>
            <Text style={styles.profileRating}>&#11088; 0.00 (0)</Text>
          </View>
        </View>

        <View style={styles.profileSection}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.profileDescription}>
            Passionate event organizer with experience in creating memorable experiences.
            Specialized in cultural events and community gatherings.
          </Text>
        </View>

        <View style={styles.profileSection}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.locationContainer}>
            <FontAwesome name="map-marker" size={16} color="gray" />
            <Text style={styles.locationText}>123 Event Street, City, Country</Text>
          </View>
        </View>

        <View style={styles.profileSection}>
          <Text style={styles.sectionTitle}>Recent Events</Text>
          <View style={styles.eventCard}>
            <Image 
              source={require('../../assets/convention.jpg')} 
              style={styles.eventThumbnail}
            />
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>Summer Music Festival</Text>
              <Text style={styles.eventDate}>July 15, 2024</Text>
            </View>
          </View>
          <View style={styles.eventCard}>
            <Image 
              source={require('../../assets/restaurant.jpg')} 
              style={styles.eventThumbnail}
            />
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>Food & Wine Expo</Text>
              <Text style={styles.eventDate}>August 20, 2024</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  profilePicLarge: {
    width: 80,
    height: 80,
    backgroundColor: 'gray',
    borderRadius: 40,
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  profileRating: {
    fontSize: 16,
    color: 'gray',
  },
  profileSection: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  profileDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 5,
  },
  locationText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  eventThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginRight: 10,
  },
  eventInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  eventDate: {
    fontSize: 14,
    color: 'gray',
  },
}); 