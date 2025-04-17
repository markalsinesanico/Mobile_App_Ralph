import React, { createContext, useState, useContext } from 'react';

const BookingsContext = createContext();

export function BookingsProvider({ children }) {
  const [bookings, setBookings] = useState([]);

  const addBooking = (booking) => {
    setBookings((prevBookings) => [...prevBookings, booking]);
  };

  const getBookings = () => {
    return bookings;
  };

  const getBookingById = (id) => {
    return bookings.find((booking) => booking.id === id);
  };

  const updateBookingStatus = (id, status) => {
    setBookings((prevBookings) =>
      prevBookings.map((booking) =>
        booking.id === id ? { ...booking, status } : booking
      )
    );
  };

  return (
    <BookingsContext.Provider
      value={{
        bookings,
        addBooking,
        getBookings,
        getBookingById,
        updateBookingStatus,
      }}
    >
      {children}
    </BookingsContext.Provider>
  );
}

export function useBookings() {
  const context = useContext(BookingsContext);
  if (!context) {
    throw new Error('useBookings must be used within a BookingsProvider');
  }
  return context;
} 