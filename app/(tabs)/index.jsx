import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const venues = [
  { 
    id: '1', 
    title: 'Convention Centers', 
    description: 'Host your next big event in our state-of-the-art convention centers.',
    image: require('../../assets/convention.jpg') 
  },
  { 
    id: '2', 
    title: 'Conference Centers', 
    description: 'Perfect for business meetings and professional gatherings.',
    image: require('../../assets/conference.jpg') 
  },
  { 
    id: '3', 
    title: 'Restaurants', 
    description: 'Find the perfect dining venue for your special occasions.',
    image: require('../../assets/restaurant.jpg') 
  },
  { 
    id: '4', 
    title: 'Bars and Nightclubs', 
    description: 'Great venues for social events and celebrations.',
    image: require('../../assets/bar.jpg') 
  },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>

      <FlatList
        data={venues}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.venueCard}>
            <Image source={item.image} style={styles.venueImage} />
            <View style={styles.venueInfo}>
              <Text style={styles.venueTitle}>{item.title}</Text>
              <Text style={styles.venueDescription}>{item.description}</Text>
              <TouchableOpacity 
                style={styles.exploreButton}
                onPress={() => router.push('/NOnav/Categories')}
              >
                <Text style={styles.exploreButtonText}>Explore</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    backgroundColor: '#eef2f3',
    padding: 20,
    margin: 16,
    borderRadius: 10,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  venueCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  venueImage: {
    width: '100%',
    height: 150,
  },
  venueInfo: {
    padding: 15,
  },
  venueTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  venueDescription: {
    color: '#666',
    marginBottom: 12,
  },
  exploreButton: {
    backgroundColor: '#2a9d8f',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  exploreButtonText: {
    color: 'white',
    fontWeight: '600',
  },
}); 