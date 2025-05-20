import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../../firebaseconfig';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore';

// Create the context
const EventsContext = createContext();

// Custom hook to use the events context
export const useEvents = () => {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
};

// Provider component
export const EventsProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [savedEvents, setSavedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch events from Firebase
  const fetchEvents = async () => {
    try {
      const eventsQuery = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(eventsQuery);
      const eventsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventsList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchEvents();
  }, []);

  // Add a new event
  const addEvent = async (eventData) => {
    try {
      const docRef = await addDoc(collection(db, 'events'), {
        ...eventData,
        createdAt: new Date()
      });
      await fetchEvents(); // Refresh the events list
      return docRef.id;
    } catch (error) {
      console.error('Error adding event:', error);
      throw error;
    }
  };

  // Update an existing event
  const updateEvent = async (eventId, eventData) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, eventData);
      await fetchEvents(); // Refresh the events list
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  };

  // Delete an event
  const deleteEvent = async (eventId) => {
    try {
      await deleteDoc(doc(db, 'events', eventId));
      await fetchEvents(); // Refresh the events list
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  };

  // Save an event (local storage)
  const saveEvent = (event) => {
    if (!isEventSaved(event.id)) {
      setSavedEvents((prevSavedEvents) => [...prevSavedEvents, event]);
    }
  };

  // Remove a saved event (local storage)
  const removeSavedEvent = (eventId) => {
    setSavedEvents((prevSavedEvents) =>
      prevSavedEvents.filter((event) => event.id !== eventId)
    );
  };

  // Check if an event is saved
  const isEventSaved = (eventId) => {
    return savedEvents.some((event) => event.id === eventId);
  };

  // Get event by ID
  const getEventById = (eventId) => {
    return events.find((event) => event.id === eventId);
  };

  // Context value
  const value = {
    events,
    savedEvents,
    loading,
    addEvent,
    updateEvent,
    deleteEvent,
    saveEvent,
    removeSavedEvent,
    isEventSaved,
    getEventById,
    fetchEvents
  };

  return (
    <EventsContext.Provider value={value}>
      {children}
    </EventsContext.Provider>
  );
};

export default EventsContext;
