import React, { createContext, useContext, useState } from 'react';

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

  // Add a new event
  const addEvent = (event) => {
    setEvents((prevEvents) => [...prevEvents, event]);
  };

  // Update an existing event
  const updateEvent = (updatedEvent) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
  };

  // Delete an event
  const deleteEvent = (eventId) => {
    setEvents((prevEvents) =>
      prevEvents.filter((event) => event.id !== eventId)
    );
  };

  // Get all events
  const getEvents = () => {
    return events;
  };

  // Get a single event by ID
  const getEventById = (eventId) => {
    return events.find((event) => event.id === eventId);
  };

  // Save an event
  const saveEvent = (event) => {
    if (!isEventSaved(event.id)) {
      setSavedEvents((prevSavedEvents) => [...prevSavedEvents, event]);
    }
  };

  // Remove a saved event
  const removeSavedEvent = (eventId) => {
    setSavedEvents((prevSavedEvents) =>
      prevSavedEvents.filter((event) => event.id !== eventId)
    );
  };

  // Check if an event is saved
  const isEventSaved = (eventId) => {
    return savedEvents.some((event) => event.id === eventId);
  };

  // Context value
  const value = {
    events,
    savedEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    getEvents,
    getEventById,
    saveEvent,
    removeSavedEvent,
    isEventSaved,
  };

  return (
    <EventsContext.Provider value={value}>
      {children}
    </EventsContext.Provider>
  );
};

export default EventsContext;
