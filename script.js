// Global variables 
let apiKey = '';
const rootPath = 'https://mysite.itvarsity.org/api/ContactBook/';

// Check if API key exists when page loads
function checkApi() {
    const storedApiKey =localStorage.getItem('apiKey');
    if (storedApiKey) {
        apiKey = storedApiKey;
        // Show contacts page (Show page)
        showContacts();
        // Get contacts (API call)
        getContacts()
    }
}

// Set the API Key and store it 
function setupApiKey(){
    const inputApiKey = document.getElementById('apiKeyInput').value.trim();

    if (!inputApiKey){
        alert('Please enter an API key!');
        return;
    }

    //Validate API key first
    fetch(rootPath + "controller/api-key/?apiKey=" + inputApiKey)
       .then(function(response) {
          return response.text();
       })
       .then(function(data) {
          if (data == "1") {
            apiKey = inputApiKey;
            localStorage.setItem("apiKey", apiKey);
            showContacts();
            getContacts();
          }else {
            alert("Invalid API key entered!");
          }
       })
       .catch(function(error){
           alert('Error validating your API Key. Please try again.');
       });
}

// Show different pages 
function showPages(pageId) {
     //Hide all pages
     const pages = document.querySelectorAll('.page');
     pages.forEach(page => page.classList.remove('active'));
     // Show selected page 
     document.getElementById(pageId).classList.add('active');
}

function showContact() {
    showPages('contactsPage');
}

function showAddContacts() {
    showPages('addContactPage');
    // Clear the form
    document.getElementById('addContactForm').reset();
}

function showEditContact(contactId) {
    showPages('editContactsPage')
    // Load contact data for editing
    loadContactForEdit(contactId);
}

// Get all contacts
function getContacts(){
    const url = `${rootPath}contacts/?apiKey=${apiKey}`;
    const contactsList = document.getElementById('contactsLists');
    contactsList.innerHTML = '<div class="Loading contacts...</div>';

    fetch(url)
         .then(res => res,json())
         .then(data => {
            if (data.length === 0) {
                contactsList.innerHTML = '<div class="loading">No contacts found.</div>';
                return;
            }

            const html = data.map(contact => `
                <div class="contacts-card">
                    <img class="contact-avatar" src="${contact.avatar || 'https://via.placeholder.com/60'}" alt="Avatar">
                    <div class="contact-name">${contact.firstname} ${contact.lastname}</div>
                    <div class="contact-details">
                       <p>📱 ${contact.mobile}</p>
                       <p>✉️ ${contact.email}</p>
                    </div>
                    <div class="contact-actions">
                         <button class="btn btn-secondary" onclick="showEditContact(${contactId})">✏️ Edit</button>
                         <buttton class="btn btn-danger" onclick="deleteContact(${contactId})">🗑️ Delete</button>
                    </div>
                </div>
            `).join("");

            contactsList.innerHTML = `<div class="contacts-grid">${html}</div>`;
        })
        .catch(error => {
            contactsList.innerHTML = `<div class="error">Error loading contacts.</div>`;
            console.error(error);
        });

        
}

// Add new contact
function addContact(event) {
  event.preventDefault();
  const form = document.getElementById("addContactForm");
  const formData = new FormData(form);
  formData.append("apiKey", apiKey);

  fetch(`${rootPath}contacts/`, {
    method: "POST",
    body: formData,
  })
    .then((res) => res.text())
    .then((result) => {
      if (result == "1") {
        alert("Contact added successfully!");
        showContacts();
        getContacts();
      } else {
        alert("Failed to add contact.");
      }
    })
    .catch((err) => {
      alert("Error adding contact.");
      console.error(err);
    });
}

// Load contact details into edit form
function loadContactForEdit(contactId) {
    fetch(`${rootPath}contact/?apiKey=${apiKey}&id=${contactId}`)
         .then(response => response.json())
         .then(contact => {
            document.getElementById("editContactId").value = contact.id;
            document.getElementById("editFirstname").value = contact.firstname;
            document.getElementById("editLastname").value = contact.lastname;
            document.getElementById("editMobile").value = contact.mobile;
            document.getElementById("editEmail").value = contact.email;
         })
         .catch(error => {
            alert('Failed to load contact.');
            console.error(error);
 
        });        
}

// Update contact
function updateContact(event) {
   event.preventDefault();

   const formData = new FormData();
   formData.append("id", document.getElementById("editContactId").value);
   formData.append("firstname", document.getElementById("editFirstname").value);
   formData.append("lastname", document.getElementById("editLastname").value);
   formData.append("mobile", document.getElementById("editMobile").value);
   formData.append("email", document.getElementById("editEmail").value);
   formData.append("apiKey", apiKey);

   const avatarInput = document.getElementById("editAvatar");
   if (avatarInput && avatarInput.files && avatarInput.files[0]) {
       formData.append("avatar", avatarInput.files[0]);
   }

   fetch(`${rootPath}contacts/`, {
       method: "PUT",
       body: formData
      
   })
   .then(response => response.text())
   .then(data => {
       if(data == "1") {
          alert("Contact updated!");
          showContact();
          getContacts();
       } else {
           alert("Failed update contact.");
       }
   })
   .catch(error => {
       alert("Error updating contact.");
   });
}

// Delete a contact 
function deleteContact(contactId) {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    fetch(`${rootPath}contact/?apiKey=${apiKey}&id=${contactId}`, {
        method: "DELETE"
    })
    .then(response => response.text())
    .then(data => {
        if (data == "1") {
            alert("Contact deleted.");
            getContacts();
        } else {
            alert("Failed to delete contact.");
        }
    })
    .catch(error => {
        alert("Error deleting contact.");
    });
}

// Auto-run on page load
window.onload = checkApi;
