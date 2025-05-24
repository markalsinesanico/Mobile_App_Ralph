import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, TextInput, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseconfig';

// Cloudinary config
const CLOUD_NAME = 'dpylptqd6';
const UPLOAD_PRESET = 'unsigned_events';

const menuItems = [
  { id: '1', title: 'My Events', icon: 'calendar' },
  { id: '2', title: 'Saved Events', icon: 'bookmark' },
  { id: '3', title: 'Settings', icon: 'settings' },
  { id: '4', title: 'Help & Support', icon: 'help-circle' },
  { id: '5', title: 'Logout', icon: 'log-out' }, 
];

export default function ProfileScreen() {
  const router = useRouter();
  const { currentUser, logoutUser, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [userData, setUserData] = useState(null);
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
  const [isUploading, setIsUploading] = useState(false);

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            setName(data.fullName || '');
            setEmail(data.email || '');
            setProfileImage(data.profileImage || null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (uri) => {
    if (!uri) throw new Error('No image selected');
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'image/jpeg',
        name: `profile_${Date.now()}.jpg`,
      });
      formData.append('upload_preset', UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await response.json();
      setIsUploading(false);
      return data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      setIsUploading(false);
      throw new Error('Failed to upload image');
    }
  };

  // Update user profile in Firestore
  const updateUserProfile = async (imageUrl) => {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        profileImage: imageUrl,
        updatedAt: new Date()
      });
      
      // Update local state
      setUserData(prev => ({
        ...prev,
        profileImage: imageUrl
      }));
      setProfileImage(imageUrl);
      
      // Update auth context
      updateUser({
        ...currentUser,
        profileImage: imageUrl
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled) {
        setIsUploading(true);
        try {
          // Upload image to Cloudinary
          const imageUrl = await uploadImageToCloudinary(result.assets[0].uri);
          
          // Update user profile in Firestore
          await updateUserProfile(imageUrl);
          
          Alert.alert('Success', 'Profile image updated successfully!');
        } catch (error) {
          console.error('Error updating profile:', error);
          Alert.alert('Error', 'Failed to update profile image. Please try again.');
        } finally {
          setIsUploading(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      setIsUploading(false);
    }
  };

  const handleMenuPress = (item) => {
    if (item.id === '1') {
      router.push('/NOnav/MyEvent');
    } else if (item.id === '2') {
      router.push('/NOnav/SavedEvents');
    } else if (item.id === '3') {
      router.push('/NOnav/Setting');
    } else if (item.id === '4') {
      router.push('/NOnav/HelpSupport');
    } else if (item.id === '5') {
      // Handle logout
      handleLogout();
    } else if (item.id === '6') {
      router.push('/Dashboard/HomeDashboard');
    } else if (item.id === '7') {
      router.replace('/Admin/AdminDashboard');
    }
  };

  const handleLogout = () => {
    // Call the logout function from AuthContext
    logoutUser();
    // Navigate to login screen
    router.replace('/authen/login');
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#2a9d8f', '#264653']}
        style={styles.headerGradient}
      >
        <View style={styles.profileImageContainer}>
          <View style={styles.profileImageWrapper}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <Image
                source={require('../../assets/convention.jpg')}
                style={styles.profileImage}
              />
            )}
            <TouchableOpacity 
              style={[styles.editButton, isUploading && styles.editButtonDisabled]} 
              onPress={pickImage}
              disabled={isUploading}
            >
              {isUploading ? (
                <Ionicons name="sync" size={20} color="white" />
              ) : (
                <Ionicons name="camera" size={20} color="white" />
              )}
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
              <Text style={styles.name}>{userData?.fullName || name || 'User'}</Text>
              <Text style={styles.email}>{userData?.email || email || 'No email available'}</Text>
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
  editButtonDisabled: {
    opacity: 0.7,
    backgroundColor: '#666',
  },
}); 