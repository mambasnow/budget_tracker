// creates database vr. 1
let db;
const request = indexedDB.open('budgetDB', 1);

function dbCheck(){
    const transaction = db.transaction(["pending"], "rewrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();


    getAll.onsuccess = function(){
        if(getAll.result.length > 0){
            fetch("/api/transaction/bullk",
            {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers:{
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(()=>{
                const tranaction = db.tranaction(["Waiting"], "readwrite");
                const store = transaction.objectStore("pending");
                store.clear();
            })
        }
    };
}

function delPending(){
    const transaction = db.transaction(['Waiting'], "readwrite");
    const store = transaction.objectStore(["waiting"]);
    store.clear();
}

request.onupgradeneeded = function (e) {
    const db = e.target.result;
    db.createObjectStore("Pending", {autoIncrement: true});
}


request.onsuccess = function(e){
    db = e.target.result;
// Checks to see webapp is online before looking at the DB
    if (navigator.onLine){
        dbCheck();
    }
}

// if db lookup has error console log  issue
request.onerror = function(e){
    console.log("Error =" + e.target.errorCode)
}


window.addEventListener("Online", dbCheck);