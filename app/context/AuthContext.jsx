import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseconfig';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const registerUser = async (userData) => {
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );
      
      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: userData.fullName
      });
      
      // Store additional user data in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        createdAt: new Date().toISOString()
      });
      
      return { success: true, message: 'Registration successful' };
    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = 'Registration failed';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      }
      
      return { success: false, message: errorMessage };
    }
  };

  const loginUser = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true, message: 'Login successful' };
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = 'Login failed';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled';
      }
      
      return { success: false, message: errorMessage };
    }
  };

  const logoutUser = async () => {
    try {
      await signOut(auth);
      return { success: true, message: 'Logout successful' };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, message: 'Logout failed' };
    }
  };

  const updateUser = async (updatedUserData) => {
    if (!currentUser) {
      return { success: false, message: 'No user logged in' };
    }

    try {
      // Update user profile in Firestore
      await setDoc(doc(db, "users", currentUser.uid), {
        ...updatedUserData,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      // If updating display name, also update auth profile
      if (updatedUserData.fullName) {
        await updateProfile(currentUser, {
          displayName: updatedUserData.fullName
        });
      }
      
      return { success: true, message: 'Profile updated successfully' };
    } catch (error) {
      console.error("Update profile error:", error);
      return { success: false, message: 'Failed to update profile' };
    }
  };

  const value = {
    currentUser,
    loading,
    registerUser,
    loginUser,
    logoutUser,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 