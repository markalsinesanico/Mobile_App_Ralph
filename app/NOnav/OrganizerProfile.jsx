import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function OrganizerProfile() {
  const router = useRouter();

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
          <Text style={styles.title}>Organizer Profile</Text>
        </View>
      </LinearGradient>

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
  headerGradient: {
    paddingTop: 15,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 25,
    backgroundColor: 'white',
    marginBottom: 15,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  profilePicLarge: {
    width: 90,
    height: 90,
    backgroundColor: '#2a9d8f',
    borderRadius: 45,
    marginRight: 20,
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2a2a2a',
  },
  profileRating: {
    fontSize: 16,
    color: '#FFD700',
  },
  profileSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 15,
    marginHorizontal: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2a2a2a',
  },
  profileDescription: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  locationText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#444',
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  eventThumbnail: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 15,
  },
  eventInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#2a2a2a',
  },
  eventDate: {
    fontSize: 14,
    color: '#2a9d8f',
    fontWeight: '500',
  },
}); 