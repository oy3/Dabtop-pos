const firebaseConfig = {
    apiKey: "AIzaSyBYDi1SyczNV7leZecwIyOcNNi0rF8WlvE",
    authDomain: "dabtopoilandgas.firebaseapp.com",
    databaseURL: "https://dabtopoilandgas.firebaseio.com",
    projectId: "dabtopoilandgas",
    storageBucket: "dabtopoilandgas.appspot.com",
    messagingSenderId: "232719293434",
    appId: "1:232719293434:web:7c39020a6c4b3e2b4de243",
    measurementId: "G-5R260HZ5XF"
};
// Initialize Firebase
var defaultProject = firebase.initializeApp(firebaseConfig);

// Make auth and firestore references
var auth = defaultProject.auth();
var db = defaultProject.firestore();
var functions = defaultProject.functions();

// Update firestore settings
db.settings({
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
});