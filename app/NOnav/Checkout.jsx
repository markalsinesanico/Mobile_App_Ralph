import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, Modal, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, FontAwesome } from "@expo/vector-icons";

export default function EventDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    date: '',
  });

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    setIsFormVisible(false);
    setFormData({
      fullName: '',
      email: '',
      phoneNumber: '',
      date: '',
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Book Now</Text>
        </View>

        <Image 
          source={params.image} 
          style={styles.eventImage}
        />

        <View style={styles.section}>
          <Text style={styles.title}>{params.title}</Text>
          <Text style={styles.location}>
            <FontAwesome name="map-marker" size={16} color="gray" /> {params.location}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subTitle}>Location</Text>
          <View style={styles.mapCard}>
            <Text>{params.location}</Text>
            <TouchableOpacity style={styles.viewMapButton}>
              <Text style={styles.viewMapText}>View on Map</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.subTitle}>Description</Text>
          <Text>{params.description}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.subTitle}>Categories</Text>
          <Text>{params.categories}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subTitle}>About Organiser</Text>
          <View style={styles.organiserCard}>
            <View style={styles.profilePic} />
            <View>
              <Text style={styles.organiserName}>Mong Sin</Text>
              <Text>&#11088; 0.00 (0)</Text>
            </View>
            <TouchableOpacity style={styles.followButton}>
              <Text style={styles.followText}>Follow</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.links}>
            <TouchableOpacity onPress={() => router.push('/NOnav/OrganizerProfile')}>
              <Text style={styles.linkText}>View Profile</Text>
            </TouchableOpacity>
            <Text style={styles.linkSeparator}> | </Text>
            <TouchableOpacity>
              <Text style={styles.linkText}>Contact</Text>
            </TouchableOpacity>
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

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChangeText={(text) => setFormData({...formData, fullName: text})}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  value={formData.email}
                  onChangeText={(text) => setFormData({...formData, email: text})}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                  value={formData.phoneNumber}
                  onChangeText={(text) => setFormData({...formData, phoneNumber: text})}
                  maxLength={15}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter date (MM/DD/YYYY)"
                  value={formData.date}
                  onChangeText={(text) => setFormData({...formData, date: text})}
                  keyboardType="numeric"
                />
              </View>

              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isProfileVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsProfileVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Organizer Profile</Text>
              <TouchableOpacity 
                onPress={() => setIsProfileVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.profileScroll}>
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
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  scrollView: {
    flex: 1,
  },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    padding: 15, 
    backgroundColor: "white" 
  },
  backButton: { padding: 5 },
  eventImage: { width: "100%", height: 200, resizeMode: "cover" },
  section: { padding: 15, backgroundColor: "white", margin: 10, borderRadius: 10 },
  title: { fontSize: 22, fontWeight: "bold" },
  location: { fontSize: 14, color: "gray", marginTop: 5 },
  subTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  mapCard: { flexDirection: "row", justifyContent: "space-between", padding: 10, backgroundColor: "#f1f1f1", borderRadius: 5 },
  viewMapButton: { borderWidth: 1, borderColor: "teal", padding: 5, borderRadius: 5 },
  viewMapText: { color: "teal" },
  organiserCard: { flexDirection: "row", alignItems: "center", gap: 10 },
  profilePic: { width: 40, height: 40, backgroundColor: "gray", borderRadius: 20 },
  organiserName: { fontSize: 16, fontWeight: "bold" },
  followButton: { borderWidth: 1, borderColor: "teal", padding: 5, borderRadius: 5 },
  followText: { color: "teal" },
  links: { 
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    color: 'teal',
    textDecorationLine: 'underline',
  },
  linkSeparator: {
    marginHorizontal: 5,
    color: 'gray',
  },
  checkOutButton: { backgroundColor: "pink", padding: 15, margin: 10, borderRadius: 5, alignItems: "center" },
  checkOutText: { fontSize: 16, fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#333',
    minHeight: 40,
  },
  submitButton: {
    backgroundColor: '#2a9d8f',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileScroll: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
    marginBottom: 20,
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
