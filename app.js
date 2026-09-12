// ===============================
// L-TUTOR MAIN JAVASCRIPT
// ===============================

// Smooth Fade-in Animation
const observer = new IntersectionObserver((entries) => {

    entries.forEach((entry) => {

        if(entry.isIntersecting){
            entry.target.classList.add("show");
        }

    });

});

document.querySelectorAll(".card, .course-card, .hero-text, .hero-image").forEach((el)=>{

    el.classList.add("hidden");
    observer.observe(el);

});

// Sticky Navbar Shadow

window.addEventListener("scroll",()=>{

const navbar=document.querySelector(".navbar");

if(window.scrollY>30){

navbar.style.boxShadow="0 8px 20px rgba(0,0,0,.15)";

}else{

navbar.style.boxShadow="0 3px 15px rgba(0,0,0,.08)";

}

});

// Button Hover Animation

document.querySelectorAll(".btn1,.btn2,.login-btn").forEach(button=>{

button.addEventListener("mouseenter",()=>{

button.style.transform="scale(1.05)";

});

button.addEventListener("mouseleave",()=>{

button.style.transform="scale(1)";

});

});