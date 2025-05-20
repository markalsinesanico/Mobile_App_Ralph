import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Image, Modal, FlatList, Alert, TextInput, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db, auth } from '../../firebaseconfig';
import { signOut } from 'firebase/auth';

// Cloudinary config
const CLOUD_NAME = 'dpylptqd6';
const UPLOAD_PRESET = 'unsigned_events';

export default function Events() {
  const router = useRouter();
  const [eventsData, setEventsData] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  // local form state for editing
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [localImageUri, setLocalImageUri] = useState(null);
  const [uploading, setUploading] = useState(false);

  // fetch events
  const fetchEvents = async () => {
    try {
      const colRef = collection(db, 'events');
      const snap = await getDocs(colRef);
      setEventsData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not load events.');
    }
  };
  useEffect(() => { fetchEvents(); }, []);

  // open modal in view mode
  const handleEventPress = ev => {
    setSelectedEvent(ev);
    setIsEditing(false);
  };

  // start editing: pre-fill form & image
  const openEdit = () => {
    setTitle(selectedEvent.title);
    setLocation(selectedEvent.location);
    setDescription(selectedEvent.description);
    setLocalImageUri(selectedEvent.imageUrl);
    setIsEditing(true);
  };

  // pick a new image
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permission required', 'Need permission to select image.');
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4,3],
      quality: 1,
    });
    if (!res.canceled) {
      setLocalImageUri(res.assets[0].uri);
    }
  };

  // upload to Cloudinary
  const uploadImageToCloudinary = async (uri) => {
    if (!uri) return null;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name: `upload_${Date.now()}.jpg`,
    });
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );
      const json = await res.json();
      setUploading(false);
      return json.secure_url;
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      setUploading(false);
      throw new Error('Failed to upload image');
    }
  };

  // save changes to Firestore
  const handleSaveEdit = async () => {
    if (!title.trim() || !location.trim() || !description.trim()) {
      return Alert.alert('Error', 'All fields are required.');
    }
    try {
      let imageUrl = selectedEvent.imageUrl;
      if (localImageUri && localImageUri !== selectedEvent.imageUrl) {
        imageUrl = await uploadImageToCloudinary(localImageUri);
      }
      const docRef = doc(db, 'events', selectedEvent.id);
      await updateDoc(docRef, { title, location, description, imageUrl });
      Alert.alert('Saved', 'Event updated.');
      setIsEditing(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch (e) {
      console.error('Error updating event:', e);
      Alert.alert('Error', 'Could not update event.');
    }
  };

  // delete event
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'events', id));
      Alert.alert('Deleted', 'Event removed.');
      setSelectedEvent(null);
      fetchEvents();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not delete event.');
    }
  };

  const menuOptions = [
    { id: '1', title: 'Home', icon: 'home', route: '/Dashboard/HomeDashboard' },
    { id: '2', title: 'Events', icon: 'calendar', route: '/Dashboard/Events' },
    { id: '3', title: 'User Booking', icon: 'book', route: '/Dashboard/UserBooking' },
    { id: '4', title: 'Approve Booking', icon: 'checkmark-circle', route: '/Dashboard/Approve' },
    { id: '5', title: 'Logout', icon: 'log-out', route: '/logout' },
  ];
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/authen/login');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const handleMenuOption = (route) => {
    setMenuVisible(false);
    if (route === '/logout') {
      handleLogout();
    } else {
      router.push(route);
    }
  };
  

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <LinearGradient colors={['#2a9d8f','#264653']} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={()=>setMenuVisible(true)}>
            <Ionicons name="menu" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>My Events</Text>
          <View style={{width:24}}/>
        </View>
      </LinearGradient>

      {/* LIST */}
      <ScrollView style={styles.eventsList}>
        {eventsData.map(ev=>(
          <TouchableOpacity
            key={ev.id}
            style={styles.eventCard}
            onPress={()=>handleEventPress(ev)}
          >
            <Image source={{uri:ev.imageUrl}} style={styles.eventImage}/>
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>{ev.title}</Text>
              <Text style={styles.eventLocation}>{ev.location}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* MODAL */}
      {selectedEvent && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            {isEditing ? (
              <>
                <TouchableOpacity style={styles.imagePickerContainer} onPress={pickImage}>
                  {localImageUri
                    ? <Image source={{uri:localImageUri}} style={styles.eventImage}/>
                    : <View style={styles.imagePlaceholder}>
                        <Ionicons name="image" size={40} color="#b2bec3"/>
                        <Text style={styles.imagePlaceholderText}>Choose Image</Text>
                      </View>
                  }
                </TouchableOpacity>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Event Title"
                />
                <TextInput
                  style={styles.input}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Location"
                />
                <TextInput
                  style={[styles.input,styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Description"
                  multiline
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton,styles.editButton]}
                    onPress={handleSaveEdit}
                    disabled={uploading}
                  >
                    <Text style={styles.buttonText}>
                      {uploading ? 'Saving...' : 'Save Changes'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton,styles.deleteButton]}
                    onPress={()=>handleDelete(selectedEvent.id)}
                  >
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Image
                  source={{uri:selectedEvent.imageUrl}}
                  style={[styles.eventImage,{alignSelf:'center',marginBottom:10}]}
                />
                <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
                <Text style={styles.modalLocation}>{selectedEvent.location}</Text>
                <Text style={styles.modalDescription}>{selectedEvent.description}</Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton,styles.editButton]}
                    onPress={openEdit}
                  >
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton,styles.deleteButton]}
                    onPress={()=>handleDelete(selectedEvent.id)}
                  >
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={()=>{
                setIsEditing(false);
                setSelectedEvent(null);
              }}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* SIDE MENU */}
      <Modal
        animationType="slide"
        transparent
        visible={menuVisible}
        onRequestClose={()=>setMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sideMenuContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Menu</Text>
              <TouchableOpacity onPress={()=>setMenuVisible(false)}>
                <Ionicons name="close" size={24} color="#2f3542" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={menuOptions}
              renderItem={({item})=>(
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={()=>handleMenuOption(item.route)}
                >
                  <View style={styles.menuItemContent}>
                    <Ionicons name={item.icon} size={24} color="#2f3542"/>
                    <Text style={styles.menuItemText}>{item.title}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#b2bec3"/>
                </TouchableOpacity>
              )}
              keyExtractor={item=>item.id}
              style={styles.menuList}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerGradient: {
    paddingTop: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
  },
  eventsList: {
    flex: 1,
    padding: 20,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventImage: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  eventInfo: {
    flex: 1,
    padding: 15,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalDate: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  modalLocation: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    width: '45%',
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
  },
  closeButtonText: {
    textAlign: 'center',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sideMenuContent: {
    backgroundColor: 'white',
    width: '80%',
    height: '100%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  menuList: {
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#2f3542',
  },
  input: {
    backgroundColor: '#f1f2f6',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  imagePickerContainer: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    height: 200,
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: '#f1f2f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 10,
    color: '#b2bec3',
  },
});