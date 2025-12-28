// server/scripts/setupFirstAdmin.js
import "../config/env.js";
import { auth, db } from "../config/firebase.js";
import admin from "firebase-admin";

/**
 * Setup first admin user
 * Run this script once to create your first admin
 *
 * Usage:
 * node server/scripts/setupFirstAdmin.js your@email.com
 */

const setupFirstAdmin = async (email) => {
  if (!email) {
    console.error("❌ Please provide an email address");
    console.log("Usage: node server/scripts/setupFirstAdmin.js your@email.com");
    process.exit(1);
  }

  try {
    console.log(`\n🔧 Setting up admin for: ${email}`);
    console.log("─".repeat(50));

    // Get or create user
    let user;
    try {
      user = await auth.getUserByEmail(email);
      console.log("✅ User found:", user.uid);
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        console.log("⚠️  User not found. They need to register first.");
        console.log(
          "   Please ask the user to register at: http://localhost:5173/register"
        );
        console.log("   Then run this script again.");
        process.exit(1);
      } else {
        throw error;
      }
    }

    // Set custom claim
    await auth.setCustomUserClaims(user.uid, { admin: true });
    console.log("✅ Admin custom claim set");

    // Update Firestore (optional - for redundancy)
    try {
      const userRef = db.collection("users").doc(user.uid);
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        await userRef.update({
          isAdmin: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log("✅ Firestore document updated");
      } else {
        await userRef.set({
          email: user.email,
          displayName: user.displayName || "",
          isAdmin: true,
          isDisabled: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log("✅ Firestore document created");
      }
    } catch (firestoreError) {
      console.log("⚠️  Firestore update skipped (database may not be enabled)");
      console.log("   This is OK - the admin claim is the important part!");
    }

    console.log("─".repeat(50));
    console.log("🎉 SUCCESS! Admin setup complete!");
    console.log(`\n📧 Email: ${email}`);
    console.log(`🆔 UID: ${user.uid}`);
    console.log(`\n✨ ${email} is now an admin!`);
    console.log(
      "\n⚠️  IMPORTANT: User must log out and log back in for admin status to take effect."
    );
    console.log(
      "   The admin panel will be available at: http://localhost:5173/admin\n"
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error setting up admin:", error);
    process.exit(1);
  }
};

// Get email from command line arguments
const email = process.argv[2];
setupFirstAdmin(email);
