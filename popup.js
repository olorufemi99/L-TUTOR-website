// ======================================
// L-TUTOR POPUP SYSTEM
// ======================================

// Success Popup
function showSuccess(message){
Swal.fire({
icon:"success",
title:"Success",
text:message,
confirmButtonColor:"#6A1B9A"
});
}

// Error Popup
function showError(message){
Swal.fire({
icon:"error",
title:"Error",
text:message,
confirmButtonColor:"#6A1B9A"
});
}

// Warning Popup
function showWarning(message){
Swal.fire({
icon:"warning",
title:"Warning",
text:message,
confirmButtonColor:"#6A1B9A"
});
}

// Information Popup
function showInfo(message){
Swal.fire({
icon:"info",
title:"Information",
text:message,
confirmButtonColor:"#6A1B9A"
});
}

// Confirmation Popup
function showConfirm(title,text){

return Swal.fire({

title:title,

text:text,

icon:"question",

showCancelButton:true,

confirmButtonText:"Yes",

cancelButtonText:"Cancel",

confirmButtonColor:"#6A1B9A",

cancelButtonColor:"#999"

});

}