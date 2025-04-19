import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const registerUser = (userData) => {
    // Check if user already exists
    const userExists = users.some(user => user.email === userData.email);
    if (userExists) {
      return { success: false, message: 'User with this email already exists' };
    }
    
    // Add new user
    setUsers([...users, userData]);
    return { success: true, message: 'Registration successful' };
  };

  const loginUser = (email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      return { success: true, message: 'Login successful' };
    }
    return { success: false, message: 'Invalid email or password' };
  };

  const logoutUser = () => {
    setCurrentUser(null);
  };

  const updateUser = (updatedUserData) => {
    if (!currentUser) {
      return { success: false, message: 'No user logged in' };
    }

    // Update the user in the users array
    const updatedUsers = users.map(user => 
      user.email === currentUser.email ? { ...user, ...updatedUserData } : user
    );
    setUsers(updatedUsers);

    // Update the current user
    setCurrentUser({ ...currentUser, ...updatedUserData });

    return { success: true, message: 'Profile updated successfully' };
  };

  return (
    <AuthContext.Provider value={{ 
      users, 
      currentUser, 
      registerUser, 
      loginUser, 
      logoutUser,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 