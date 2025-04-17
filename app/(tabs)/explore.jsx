import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Image } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEvents } from '../context/EventsContext';

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);
  const router = useRouter();
  const { events, isEventSaved } = useEvents();

  // Filter events based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredEvents([]);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = events.filter(event => 
      event.title.toLowerCase().includes(query) || 
      event.location.toLowerCase().includes(query)
    );
    
    setFilteredEvents(filtered);
  }, [searchQuery, events]);

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

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2a9d8f', '#264653']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Explore</Text>
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events by title or location..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.resultsContainer}>
        {searchQuery.length > 0 && (
          <Text style={styles.resultsText}>
            {filteredEvents.length > 0 
              ? `Found ${filteredEvents.length} event${filteredEvents.length !== 1 ? 's' : ''}` 
              : 'No events found'}
          </Text>
        )}

        {filteredEvents.map((event) => (
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
              <Text style={styles.description} numberOfLines={2}>{event.description}</Text>
              <View style={styles.footerRow}>
                <Text style={styles.categories}>{event.categories || 'Event'}</Text>
                <FontAwesome 
                  name={isEventSaved(event.id) ? "bookmark" : "bookmark-o"} 
                  size={20} 
                  color={isEventSaved(event.id) ? "#2a9d8f" : "#888"} 
                />
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {searchQuery.length > 0 && filteredEvents.length === 0 && (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search-outline" size={60} color="#ccc" />
            <Text style={styles.noResultsText}>No events found</Text>
            <Text style={styles.noResultsSubtext}>Try searching with different keywords</Text>
          </View>
        )}

        {searchQuery.length === 0 && (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="search-outline" size={60} color="#ccc" />
            <Text style={styles.emptyStateText}>Search for events</Text>
            <Text style={styles.emptyStateSubtext}>Enter a title or location to find events</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: {
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  resultsContainer: {
    flex: 1,
    padding: 16,
  },
  resultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2a9d8f',
    marginBottom: 16,
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
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
});
