// ======================================
// L-TUTOR ADMIN v3.0
// UNIVERSAL HELPERS
// ======================================

// Current editing state
let editing = false;
let editingId = null;

// Reset editing mode
function resetEditing(){

editing = false;
editingId = null;

}

// Save or Update
function saveOrUpdate(collection,data){

if(editing){

return db.collection(collection)
.doc(editingId)
.update(data);

}

data.createdAt =
firebase.firestore.FieldValue.serverTimestamp();

return db.collection(collection)
.add(data);

}

// Delete document
function deleteDocument(collection,id){

return db.collection(collection)
.doc(id)
.delete();

}

// Load one document
function loadDocument(collection,id){

return db.collection(collection)
.doc(id)
.get();

}