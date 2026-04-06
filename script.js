// 1. Firebase Modules Import
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 2. Firebase Config (Your Keys)
const firebaseConfig = {
    apiKey: "AIzaSyDy430AP0t92QND_VdaoCkK0J23y2c5rkE",
    authDomain: "oshancart.firebaseapp.com",
    projectId: "oshancart",
    storageBucket: "oshancart.appspot.com",
    messagingSenderId: "686982543488",
    appId: "1:686982543488:web:d74a83a3f53dbae3754e65"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 3. EmailJS Init (Your Key)
const PUBLIC_KEY = "jfgAK0LaZ0w7RKAE8";
if (typeof emailjs !== 'undefined') {
    emailjs.init(PUBLIC_KEY);
}

// --- Auth & Notification System ---
onAuthStateChanged(auth, async (user) => {
    const loginBtn = document.getElementById('loginBtn');
    const dLogoutBtn = document.getElementById('drawerLogoutBtn');
    
    if (user) {
        if(loginBtn) {
            loginBtn.innerHTML = '<i class="fas fa-user-circle"></i> Profile';
            loginBtn.href = 'edit-profile.html';
        }
        if(dLogoutBtn) dLogoutBtn.style.display = 'block';
        
        // Notification පෙන්වීමේ Logic එක (දවසට 3 වතාවයි)
        checkAndShowNotification();
    } else {
        if(loginBtn) {
            loginBtn.innerHTML = '<i class="fas fa-user"></i> Sign In';
            loginBtn.href = 'signup.html';
        }
        if(dLogoutBtn) dLogoutBtn.style.display = 'none';
    }
});

// දවසට 3 වතාවක් පෙන්වන Function එක
function checkAndShowNotification() {
    const today = new Date().toDateString();
    let notifData = JSON.parse(localStorage.getItem('notif_tracker')) || { date: "", count: 0 };

    // දවස අලුත් නම් count එක reset කරන්න
    if (notifData.date !== today) {
        notifData = { date: today, count: 0 };
    }

    // දිනකට වාර 3ක් පෙන්වූවාදැයි පරීක්ෂා කිරීම
    if (notifData.count < 3) {
        const toast = document.getElementById('daily-checkin-toast');
        if (toast) {
            toast.style.display = 'flex';
            toast.classList.add('animate__fadeInDown');
            
            // Count එක වැඩි කර local storage එකේ save කිරීම
            notifData.count += 1;
            localStorage.setItem('notif_tracker', JSON.stringify(notifData));
        }
    }
}

// --- Product Loading (Firebase) ---
async function loadCoreProducts() {
    const container = document.getElementById('productContainer');
    if(!container) return;
    
    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        container.innerHTML = ""; 
        
        if(querySnapshot.empty) {
            // Demo products if Firestore is empty
            for(let i=0; i<8; i++) {
                container.innerHTML += createProductCard('demo'+i, {name: "Oshan Premium Item " + (i+1), price: "2450", image: "https://ae01.alicdn.com/kf/S8f903828330740929215886e40854d9I.jpg"});
            }
        } else {
            querySnapshot.forEach((doc) => {
                container.innerHTML += createProductCard(doc.id, doc.data());
            });
        }
    } catch(e) { console.error("Products error:", e); }
}

function createProductCard(id, p) {
    return `
    <div class="osh-card animate__animated animate__fadeIn">
        <div class="osh-card-img-wrap" onclick="window.location.href='product-details.html?id=${id}'">
            <img src="${p.image || 'https://via.placeholder.com/300'}" class="osh-card-img" loading="lazy">
        </div>
        <div class="osh-card-content">
            <div class="osh-p-title">${p.name}</div>
            <div class="osh-p-price">Rs. ${p.price}</div>
            <button onclick="addToCart('${id}', '${p.name}', ${p.price})" class="osh-add-btn">Add to Cart</button>
        </div>
    </div>`;
}

// --- Global Functions (Window Scope) ---
window.toggleDrawer = (state) => {
    const drawer = document.getElementById('mainDrawer');
    const mask = document.getElementById('sideMask');
    if(state) { mask.style.display = 'block'; drawer.style.left = '0'; }
    else { drawer.style.left = '-300px'; mask.style.display = 'none'; }
};

window.handleLogout = () => {
    signOut(auth).then(() => { alert("Logged out!"); window.location.reload(); });
};

window.addToCart = (id, name, price) => alert(`${name} added to cart!`);

window.executeSearch = (inputId) => {
    const val = document.getElementById(inputId).value;
    if(val) window.location.href = `categories.html?search=${encodeURIComponent(val)}`;
};

// Start
window.onload = () => {
    loadCoreProducts();
    
    // Slider Logic
    let slideIndex = 0;
    const wrapper = document.getElementById('sliderWrapper');
    if(wrapper) {
        setInterval(() => {
            slideIndex = (slideIndex + 1) % 2;
            wrapper.style.transform = `translateX(-${slideIndex * 100}%)`;
        }, 5000);
    }
};
