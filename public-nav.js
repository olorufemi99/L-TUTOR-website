// ==========================================
// L-TUTOR PUBLIC MOBILE NAVIGATION
// ==========================================
(function(){
"use strict";
function init(){
    const button=document.getElementById("publicMenuButton");
    const menu=document.getElementById("publicMobileMenu");
    if(!button||!menu) return;

    const close=()=>{
        menu.classList.remove("active");
        button.classList.remove("active");
        button.setAttribute("aria-expanded","false");
        button.setAttribute("aria-label","Open menu");
    };
    const open=()=>{
        menu.classList.add("active");
        button.classList.add("active");
        button.setAttribute("aria-expanded","true");
        button.setAttribute("aria-label","Close menu");
    };

    button.addEventListener("click",e=>{
        e.stopPropagation();
        menu.classList.contains("active")?close():open();
    });
    menu.querySelectorAll("a").forEach(a=>a.addEventListener("click",close));
    document.addEventListener("keydown",e=>{if(e.key==="Escape")close();});
    document.addEventListener("click",e=>{
        if(menu.classList.contains("active")&&!menu.contains(e.target)&&!button.contains(e.target)) close();
    });
    window.addEventListener("resize",()=>{if(window.innerWidth>768)close();});
}
document.addEventListener("DOMContentLoaded",init);
})();