import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const menuItems = [
  { id: '1', title: 'My Events', icon: 'calendar' },
  { id: '2', title: 'Saved Events', icon: 'bookmark' },
  { id: '3', title: 'Settings', icon: 'settings' },
  { id: '4', title: 'Help & Support', icon: 'help-circle' },
  { id: '5', title: 'Logout', icon: 'log-out' }, 
  { id: '6', title: 'Dashboard', icon: 'grid' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [savedEvents, setSavedEvents] = useState([
    {
      id: 1,
      title: "Rail Fest 6",
      location: "Hamilton, Waikato, New Zealand",
      venue: "gateway",
      image: require('../../assets/convention.jpg'),
    },
    {
      id: 2,
      title: "Open Stage Cultural Fest",
      location: "Auckland, Auckland, New Zealand",
      venue: "Gaisano",
      image: require('../../assets/conference.jpg'),
    },
  ]);

  const handleMenuPress = (item) => {
    if (item.id === '1') {
      router.push('/NOnav/MyEvent');
    } else if (item.id === '2') {
      router.push('/NOnav/SavedEvents');
    } else if (item.id === '3') {
      router.push('/NOnav/Setting');
    } else if (item.id === '4') {
      router.push('/NOnav/HelpSupport');
    } else if (item.id === '6') {
      router.push('/Dashboard/HomeDashboard');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#2a9d8f', '#264653']}
        style={styles.headerGradient}
      >
        <View style={styles.profileImageContainer}>
          <View style={styles.profileImageWrapper}>
            <Image
              source={require('../../assets/convention.jpg')}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="camera" size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          {isEditing ? (
            <View style={styles.editForm}>
              <TextInput
                style={styles.editInput}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#ccc"
              />
              <TextInput
                style={styles.editInput}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#ccc"
              />
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={() => setIsEditing(false)}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{name}</Text>
              <Text style={styles.email}>{email}</Text>
            </View>
          )}
        </View>
      </LinearGradient>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Events</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{savedEvents.length}</Text>
          <Text style={styles.statLabel}>Saved</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.menuItem}
            onPress={() => handleMenuPress(item)}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name={item.icon} size={24} color="#2a9d8f" />
              <Text style={styles.menuItemTitle}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  headerGradient: {
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  profileImageContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  profileImageWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'white',
  },
  editButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#2a9d8f',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileInfo: {
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: 'white',
  },
  email: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 10,
  },
  editForm: {
    width: '100%',
    alignItems: 'center',
  },
  editInput: {
    width: '80%',
    height: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  saveButton: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: '80%',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#2a9d8f',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'white',
    marginTop: -20,
    marginHorizontal: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2a9d8f',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  menuContainer: {
    backgroundColor: 'white',
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemTitle: {
    fontSize: 16,
    marginLeft: 12,
  },
}); 