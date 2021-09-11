

// Opens database ver 1
let db;
const request = indexedDB.open('budgetDB', 1);

// create object store called "BudgetStore" and set autoIncrement to true
request.onupgradeneeded = () => {
  db = request.result;
  const objectStore = db.createObjectStore('budgetDB', {autoIncrement: true});
};

// Checks the db once the app is online
request.onsuccess = () => {
  db = request.result;

  if (navigator.onLine) {
    dbCheck();
  }
};

// If  error opening the db
request.onerror = (event) => {
  console.log(event);
};

// Saves the transaction to db
const saveRecord = (record) => {
  // Makes a transaction on the pending db with readwrite access
  // Creates an obj store on the transaction
  // Add data to the store
  const trans = db.transaction('budgetDB', 'readwrite');
  const objectStore = trans.objectStore('budgetDB');
  let addRequest = objectStore.add(record);

  addRequest.onsuccess = () => {
    console.log('Record added successfully');
  }

  addRequest.onerror = () => {
    console.log("Failed to add record");
  }
}

// Access the store, retrieves all data
const dbCheck = () => {
  const trans = db.transaction('budgetDB', 'readonly');
  const objectStore = trans.objectStore('budgetDB'); 
  let getAll = objectStore.getAll();

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
          const trans = db.transaction('budgetDB', 'readwrite');
          const objectStore = trans.objectStore('budgetDB');
          let clearRequest = objectStore.clear();

          clearRequest.onsuccess = () => {
            console.log("DB cleared!");
          }

          clearRequest.onerror = () => {
            console.log("An error was happened");
          }
        });
    }
  };
}