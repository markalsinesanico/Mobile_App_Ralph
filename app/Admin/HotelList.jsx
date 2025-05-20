import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Image,
  Alert, KeyboardAvoidingView, Platform, Modal, FlatList
} from 'react-native';
import { useRouter } from 'expo-router';
import { useHotels } from '../context/HotelsContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function HotelList() {
  const router = useRouter();
  const { hotels, loading, deleteHotel } = useHotels();
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);

  const menuOptions = [
    { id: '1', title: 'Dashboard', icon: 'home', route: '/AdminDashboard' },
    { id: '2', title: 'Logout', icon: 'log-out', route: '/logout' },
  ];

  const handleMenuOption = (route) => {
    setMenuVisible(false);
    if (route === '/logout') {
      console.log('Logout pressed');
    } else {
      router.push(route);
    }
  };

  const handleDeleteHotel = async (hotelId) => {
    Alert.alert(
      'Delete Hotel',
      'Are you sure you want to delete this hotel?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHotel(hotelId);
              Alert.alert('Success', 'Hotel deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete hotel');
            }
          },
        },
      ]
    );
  };

  const handleEditHotel = (hotelId) => {
    router.push(`/Dashboard/EditHotel?id=${hotelId}`);
  };

  const renderHotelItem = ({ item }) => (
    <View style={styles.hotelCard}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.hotelImage} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="bed" size={40} color="#b2bec3" />
          <Text style={styles.imagePlaceholderText}>No Image</Text>
        </View>
      )}
      <View style={styles.hotelInfo}>
        <Text style={styles.hotelName}>{item.name}</Text>
        <Text style={styles.hotelAddress}>{item.address}</Text>
        <Text style={styles.hotelPrice}>${item.pricePerNight} per night</Text>
        <Text style={styles.hotelDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.hotelActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditHotel(item.id)}
          >
            <Ionicons name="create" size={20} color="white" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteHotel(item.id)}
          >
            <Ionicons name="trash" size={20} color="white" />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderMenuItem = ({ item }) => (
    <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption(item.route)}>
      <View style={styles.menuItemContent}>
        <Ionicons name={item.icon} size={24} color="#2f3542" />
        <Text style={styles.menuItemText}>{item.title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#b2bec3" />
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={['#2a9d8f', '#264653']} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Ionicons name="menu" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Hotel List</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading hotels...</Text>
          </View>
        ) : hotels.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="bed" size={60} color="#b2bec3" />
            <Text style={styles.emptyText}>No hotels found</Text>
          </View>
        ) : (
          <FlatList
            data={hotels}
            renderItem={renderHotelItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.hotelList}
          />
        )}
      </ScrollView>

      <Modal transparent animationType="slide" visible={menuVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.sideMenuContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Menu</Text>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Ionicons name="close" size={24} color="#2f3542" />
              </TouchableOpacity>
            </View>
            <FlatList data={menuOptions} renderItem={renderMenuItem} keyExtractor={i => i.id} />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  headerGradient: { paddingTop: 10, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  title: { fontSize: 24, fontWeight: '600', color: 'white' },
  content: { flex: 1, padding: 16 },
  hotelList: { paddingBottom: 20 },
  hotelCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  hotelImage: { width: '100%', height: 200 },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#f1f2f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: { marginTop: 10, color: '#b2bec3', fontSize: 16 },
  hotelInfo: { padding: 16 },
  hotelName: { fontSize: 20, fontWeight: 'bold', color: '#2f3542', marginBottom: 8 },
  hotelAddress: { fontSize: 16, color: '#636e72', marginBottom: 8 },
  hotelPrice: { fontSize: 18, fontWeight: '600', color: '#2a9d8f', marginBottom: 8 },
  hotelDescription: { fontSize: 14, color: '#636e72', marginBottom: 16 },
  hotelActions: { flexDirection: 'row', justifyContent: 'space-between' },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  editButton: { backgroundColor: '#2a9d8f' },
  deleteButton: { backgroundColor: '#e74c3c' },
  actionButtonText: { color: 'white', marginLeft: 8, fontWeight: 'bold' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 18, color: '#636e72' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 18, color: '#636e72', marginTop: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  sideMenuContent: { backgroundColor: 'white', width: '80%', height: '100%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f1f2f6' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#2f3542' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f1f2f6' },
  menuItemContent: { flexDirection: 'row', alignItems: 'center' },
  menuItemText: { fontSize: 16, marginLeft: 15, color: '#2f3542' },
});
