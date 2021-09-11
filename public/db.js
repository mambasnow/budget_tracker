/* IndexedDB script handles saving transactions when fetch request fails or device is offline */

// Opens database with version 1
let db;
const request = indexedDB.open('BudgetDB', 1);

// create object store called "BudgetStore" and set autoIncrement to true
request.onupgradeneeded = () => {
  db = request.result;
  const objSave = db.createObjectStore('budgetSave', {autoIncrement: true});
};

// Checks the db once the app is online
request.onsuccess = () => {
  db = request.result;

  if (navigator.onLine) {
    checkDB();
  }
};

// If there was an error opening the db
request.onerror = (e) => {
  console.log(e);
};

// Saves the transaction to the indexedDB
const saveRecord = (record) => {
  // Creates a transaction on the pending db with readwrite access
  // Creates an object store on the transaction
  // Add record to the store
  const trans = db.transaction('budgetSave', 'readwrite');
  const objSave = trans.objectStore('budgetSave');
  let addRequest = objSave.add(record);

  addRequest.onsuccess = () => {
    console.log('This Data was Saved');
  }

  addRequest.onerror = () => {
    console.log("Error: Failed to Save");
  }
}

// Access the store, retrieves all data
const checkDB = () => {
  const trans = db.transaction('budgetSave', 'readonly');
  const objSave = trans.objectStore('budgetSave'); 
  let getAll = objSave.getAll();

  getAll.onerror = () => {
    console.log('There was an error with getting all records.');
  }

// If there are records in the db, post it to the server
  getAll.onsuccess = () => {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then(() => {
          // Clear all items in the store after successful post
          const trans = db.transaction('budgetSave', 'readwrite');
          const objSave = trans.objectStore('budgetSave');
          let clearRequest = objSave.clear();

          clearRequest.onsuccess = () => {
            console.log("IndexedDB cleared!");
          }

          clearRequest.onerror = () => {
            console.log("There was an error in clearing the db!");
          }
        });
    }
  };
}

// Checks the db for data when the device goes online
window.addEventListener('online', checkDB);
