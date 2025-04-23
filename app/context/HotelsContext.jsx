import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../../firebaseconfig';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';

const HotelsContext = createContext();

export const HotelsProvider = ({ children }) => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'hotels'));
      const hotelsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHotels(hotelsList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching hotels:', error);
      setLoading(false);
    }
  };

  const addHotel = async (hotelData) => {
    try {
      const docRef = await addDoc(collection(db, 'hotels'), {
        ...hotelData,
        createdAt: new Date()
      });
      await fetchHotels();
      return docRef.id;
    } catch (error) {
      console.error('Error adding hotel:', error);
      throw error;
    }
  };

  const updateHotel = async (hotelId, hotelData) => {
    try {
      const hotelRef = doc(db, 'hotels', hotelId);
      await updateDoc(hotelRef, hotelData);
      await fetchHotels();
    } catch (error) {
      console.error('Error updating hotel:', error);
      throw error;
    }
  };

  const deleteHotel = async (hotelId) => {
    try {
      await deleteDoc(doc(db, 'hotels', hotelId));
      await fetchHotels();
    } catch (error) {
      console.error('Error deleting hotel:', error);
      throw error;
    }
  };

  return (
    <HotelsContext.Provider value={{
      hotels,
      loading,
      addHotel,
      updateHotel,
      deleteHotel,
      fetchHotels
    }}>
      {children}
    </HotelsContext.Provider>
  );
};

export const useHotels = () => {
  const context = useContext(HotelsContext);
  if (!context) {
    throw new Error('useHotels must be used within a HotelsProvider');
  }
  return context;
}; 