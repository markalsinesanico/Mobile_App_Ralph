import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function HelpSupport() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [message, setMessage] = useState('');

  const handleBackPress = () => {
    router.back();
  };

  const handleSubmitSupport = () => {
    if (message.trim() === '') {
      Alert.alert('Error', 'Please enter your message before submitting.');
      return;
    }
    
    Alert.alert(
      'Message Sent',
      'Thank you for contacting us. We will get back to you as soon as possible.',
      [{ text: 'OK', onPress: () => setMessage('') }]
    );
  };

  const faqCategories = [
    { id: '1', title: 'Account & Profile', icon: 'person-circle' },
    { id: '2', title: 'Events & Bookings', icon: 'calendar' },
    { id: '3', title: 'Payments & Refunds', icon: 'card' },
    { id: '4', title: 'Technical Issues', icon: 'construct' },
    { id: '5', title: 'Privacy & Security', icon: 'shield-checkmark' },
  ];

  const faqItems = {
    '1': [
      { question: 'How do I change my profile picture?', answer: 'To change your profile picture, go to your profile screen and tap on the camera icon in the bottom right corner of your profile picture.' },
      { question: 'How do I update my contact information?', answer: 'You can update your contact information by going to your profile screen and tapping on the edit button next to your information.' },
    ],
    '2': [
      { question: 'How do I book an event?', answer: 'To book an event, navigate to the event details page and tap on the "Book Now" button. Follow the prompts to complete your booking.' },
      { question: 'Can I cancel my booking?', answer: 'Yes, you can cancel your booking by going to the "My Events" section, selecting the event, and tapping on "Cancel Booking".' },
    ],
    '3': [
      { question: 'What payment methods do you accept?', answer: 'We accept all major credit cards, debit cards, and digital payment methods like Apple Pay and Google Pay.' },
      { question: 'How long does it take to process a refund?', answer: 'Refunds typically take 5-10 business days to appear in your account, depending on your payment provider.' },
    ],
    '4': [
      { question: 'The app is crashing, what should I do?', answer: 'Try closing the app completely and reopening it. If the issue persists, check for updates in your app store or contact our support team.' },
      { question: 'I can\'t log in to my account', answer: 'Make sure you\'re using the correct email and password. If you\'ve forgotten your password, use the "Forgot Password" option on the login screen.' },
    ],
    '5': [
      { question: 'How is my personal data protected?', answer: 'We use industry-standard encryption to protect your personal data. We never share your information with third parties without your consent.' },
      { question: 'Can I delete my account?', answer: 'Yes, you can delete your account by going to Settings > Account > Delete Account. Please note that this action is irreversible.' },
    ],
  };

  const renderFaqItems = () => {
    if (!selectedCategory) return null;
    
    return (
      <View style={styles.faqContainer}>
        <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
        {faqItems[selectedCategory].map((item, index) => (
          <View key={index} style={styles.faqItem}>
            <Text style={styles.faqQuestion}>{item.question}</Text>
            <Text style={styles.faqAnswer}>{item.answer}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2a9d8f', '#264653']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Help & Support</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for help..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#666"
            />
          </View>
        </View>

        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Help Categories</Text>
          <View style={styles.categoriesGrid}>
            {faqCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategory === category.id && styles.selectedCategory
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Ionicons
                  name={category.icon}
                  size={24}
                  color={selectedCategory === category.id ? 'white' : '#2a9d8f'}
                />
                <Text
                  style={[
                    styles.categoryTitle,
                    selectedCategory === category.id && styles.selectedCategoryText
                  ]}
                >
                  {category.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {renderFaqItems()}

        <View style={styles.contactContainer}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          <Text style={styles.contactDescription}>
            Can't find what you're looking for? Send us a message and we'll get back to you as soon as possible.
          </Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Type your message here..."
            multiline
            numberOfLines={5}
            value={message}
            onChangeText={setMessage}
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitSupport}
          >
            <Text style={styles.submitButtonText}>Send Message</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contactInfoContainer}>
          <Text style={styles.sectionTitle}>Other Ways to Reach Us</Text>
          <View style={styles.contactInfoItem}>
            <Ionicons name="mail" size={20} color="#2a9d8f" />
            <Text style={styles.contactInfoText}>support@eventapp.com</Text>
          </View>
          <View style={styles.contactInfoItem}>
            <Ionicons name="call" size={20} color="#2a9d8f" />
            <Text style={styles.contactInfoText}>+1 (555) 123-4567</Text>
          </View>
          <View style={styles.contactInfoItem}>
            <Ionicons name="chatbubble" size={20} color="#2a9d8f" />
            <Text style={styles.contactInfoText}>Live chat available 9am-5pm EST</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerGradient: {
    paddingTop: 40,
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
  searchContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  categoriesContainer: {
    padding: 16,
    backgroundColor: 'white',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedCategory: {
    backgroundColor: '#2a9d8f',
    borderColor: '#2a9d8f',
  },
  categoryTitle: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  selectedCategoryText: {
    color: 'white',
  },
  faqContainer: {
    padding: 16,
    backgroundColor: 'white',
    marginTop: 8,
  },
  faqTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  faqItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  contactContainer: {
    padding: 16,
    backgroundColor: 'white',
    marginTop: 8,
  },
  contactDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  messageInput: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#eee',
    textAlignVertical: 'top',
    minHeight: 120,
  },
  submitButton: {
    backgroundColor: '#2a9d8f',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  contactInfoContainer: {
    padding: 16,
    backgroundColor: 'white',
    marginTop: 8,
    marginBottom: 24,
  },
  contactInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactInfoText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#666',
  },
}); 