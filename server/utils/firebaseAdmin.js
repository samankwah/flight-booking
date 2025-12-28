// server/utils/firebaseAdmin.js
import { db, auth } from '../config/firebase.js';
import admin from 'firebase-admin';

/**
 * Set Custom Claim for admin role
 * @param {string} uid - User ID
 * @param {boolean} isAdmin - Admin status
 * @returns {Promise<Object>} Result object
 */
export const setAdminClaim = async (uid, isAdmin = true) => {
  try {
    // Set the custom claim on the user's token
    await auth.setCustomUserClaims(uid, { admin: isAdmin });

    // Also update the user document in Firestore for redundancy
    await db.collection('users').doc(uid).update({
      isAdmin,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`✅ Admin claim ${isAdmin ? 'granted' : 'revoked'} for user: ${uid}`);
    return { success: true, message: `Admin status updated to: ${isAdmin}` };
  } catch (error) {
    console.error('Error setting admin claim:', error);
    throw new Error(`Failed to set admin claim: ${error.message}`);
  }
};

/**
 * Verify if user has admin privileges
 * @param {string} uid - User ID
 * @returns {Promise<boolean>} True if user is admin
 */
export const verifyAdmin = async (uid) => {
  try {
    const user = await auth.getUser(uid);
    return user.customClaims?.admin === true;
  } catch (error) {
    console.error('Error verifying admin status:', error);
    return false;
  }
};

/**
 * Disable or enable user account
 * @param {string} uid - User ID
 * @param {boolean} disabled - Disabled status
 * @returns {Promise<Object>} Result object
 */
export const disableUser = async (uid, disabled = true) => {
  try {
    // Update Firebase Auth
    await auth.updateUser(uid, { disabled });

    // Update Firestore document
    await db.collection('users').doc(uid).update({
      isDisabled: disabled,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`✅ User ${uid} ${disabled ? 'disabled' : 'enabled'}`);
    return { success: true, message: `User ${disabled ? 'disabled' : 'enabled'}` };
  } catch (error) {
    console.error('Error updating user status:', error);
    throw new Error(`Failed to update user status: ${error.message}`);
  }
};

/**
 * Get user by UID with full details
 * @param {string} uid - User ID
 * @returns {Promise<Object>} User object with auth and Firestore data
 */
export const getUserDetails = async (uid) => {
  try {
    const [authUser, firestoreDoc] = await Promise.all([
      auth.getUser(uid),
      db.collection('users').doc(uid).get()
    ]);

    return {
      uid: authUser.uid,
      email: authUser.email,
      displayName: authUser.displayName,
      photoURL: authUser.photoURL,
      disabled: authUser.disabled,
      customClaims: authUser.customClaims || {},
      createdAt: authUser.metadata.creationTime,
      lastSignIn: authUser.metadata.lastSignInTime,
      firestoreData: firestoreDoc.exists ? firestoreDoc.data() : null
    };
  } catch (error) {
    console.error('Error getting user details:', error);
    throw new Error(`Failed to get user details: ${error.message}`);
  }
};

/**
 * List all users with pagination
 * @param {number} maxResults - Maximum number of results (default 1000)
 * @param {string} pageToken - Page token for pagination
 * @returns {Promise<Object>} Users list with page token
 */
export const listAllUsers = async (maxResults = 1000, pageToken) => {
  try {
    const result = await auth.listUsers(maxResults, pageToken);

    return {
      users: result.users.map(user => ({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        disabled: user.disabled,
        isAdmin: user.customClaims?.admin === true,
        createdAt: user.metadata.creationTime,
        lastSignIn: user.metadata.lastSignInTime
      })),
      pageToken: result.pageToken
    };
  } catch (error) {
    console.error('Error listing users:', error);
    throw new Error(`Failed to list users: ${error.message}`);
  }
};

/**
 * Delete user account (Auth + Firestore)
 * @param {string} uid - User ID
 * @returns {Promise<Object>} Result object
 */
export const deleteUserAccount = async (uid) => {
  try {
    // Delete from Firebase Auth
    await auth.deleteUser(uid);

    // Delete from Firestore
    await db.collection('users').doc(uid).delete();

    console.log(`✅ User ${uid} deleted`);
    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error(`Failed to delete user: ${error.message}`);
  }
};

// Export db and auth from config for convenience
export { db, auth };
