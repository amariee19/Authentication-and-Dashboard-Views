// import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
// import { doc, setDoc } from "firebase/firestore";
// import { db } from "../lib/firebase";

// async function createTestUser(email, password, role) {
//   const auth = getAuth();
//   try {
//     // 1. Create Auth Account
//     const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//     const user = userCredential.user;

//     // 2. Set Role in Firestore
//     await setDoc(doc(db, "users", user.uid), {
//       email: email,
//       role: role, // 'patient' or 'caregiver'
//       createdAt: new Date()
//     });
    
//     console.log(`Successfully created ${role}: ${email}`);
//   } catch (error) {
//     console.error("Error creating user:", error);
//   }
// }

// // How to run:
// // createTestUser("patient@test.com", "password123", "patient");
// // createTestUser("caregiver@test.com", "password123", "caregiver");