// import { auth } from './firebase/firebase-auth.js';

var checkoutData = [];
var dataSet = new Array();

var currentUserUid;
var sellerName;
auth.onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        currentUserUid = user.uid;
        sellerName = user.displayName;

        // user.updateProfile({
        //     displayName: "Oyeyinka Temitope"
        // }).then(function () {
        //     // Update successful.
        //     console.log("success", user.displayName);
        // }).catch(function (error) {
        //     // An error happened.
        // });
    }
});

const loggedOutLinks = document.querySelectorAll('.logged-out');
const loggedInLinks = document.querySelectorAll('.logged-in');

const setupUi = (user) => {
    if (user) {
        // toggle UI elements
        // getTableData()
        loggedInLinks.forEach(item => item.style.display = 'block');
        loggedOutLinks.forEach(item => item.style.display = 'none');
    } else {
        // renderUserData()
        loggedInLinks.forEach(item => item.style.display = 'none');
        loggedOutLinks.forEach(item => item.style.display = 'block');
    }
}

// Login user
const loginForm = document.querySelector('#login_form');
loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = loginForm['loginBtn'];

    btn.setAttribute("disabled", "true");

    //get user info
    const email = loginForm['inputEmail'].value;
    const password = loginForm['inputPassword'].value;

    auth.signInWithEmailAndPassword(email, password).then(cred => {
        $('.alert-danger').addClass('hidden');
        $('.alert-success').text('Logged in successfully').removeClass('hidden');
        loginForm.reset();

        return auth.onAuthStateChanged(user => {
            user.getIdTokenResult().then((idTokenResult) => {
                // Confirm the user is an Admin.
                if (idTokenResult.claims.admin == true) {
                    // Show admin UI.
                    window.location.replace("index.html");
                    btn.removeAttribute("disabled");
                    // window.open('index.html');
                    // window.parent.close();
                } else {
                    // Show regular user UI.
                    // startPrompt();
                    window.location.replace("cashier/index.html");
                    btn.removeAttribute("disabled");

                    // window.open('pos.html');
                    // window.parent.close();
                }
            }).catch((error) => {
                btn.removeAttribute("disabled");
                console.log(error);
            });
        });
    }).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        btn.removeAttribute("disabled");
        if (errorCode === 'auth/wrong-password') {
            $('.alert-success').addClass('hidden');
            $('.alert-danger').text('Wrong username or password').removeClass('hidden');
        } else if (errorCode == 'auth/network-request-failed') {
            $('.alert-success').addClass('hidden');
            $('.alert-danger').text('A network error has occurred, check your connection and try again.').removeClass('hidden');
        } else if (errorCode == 'auth/user-not-found') {
            $('.alert-success').addClass('hidden');
            $('.alert-danger').text("There is no user registered with this email address").removeClass('hidden');
        } else {
            $('.alert-success').addClass('hidden');
            $('.alert-danger').text(errorMessage).removeClass('hidden');
        }
        console.log(error);
    });
});

//Log out user
const logout = document.querySelector('#logoutBtn');
logout?.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut();
});


//Add Inventory to DB
const addInvetoryForm = document.querySelector('#add_invetory_form');
addInvetoryForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const itemNumber = "Dabtop" + Date.now()
    const itemName = addInvetoryForm['intputItemName'].value;
    const itemSize = addInvetoryForm['intputItemSize'].value;
    const itemQuanity = addInvetoryForm['inputQuantity'].value;
    const costPrice = addInvetoryForm['inputCostPrice'].value;
    const sellingPrice = addInvetoryForm['inputSellingPrice'].value;
    const addBtn = addInvetoryForm['addInventoryBtn'];

    addBtn.setAttribute("disabled", "true");

    db.collection('inventories').add({
        productNumber: itemNumber,
        productName: itemName,
        productSize: itemSize,
        productQuanity: itemQuanity,
        productCostPrice: costPrice,
        productSellingPrice: sellingPrice,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        adminUid: currentUserUid
    }).then(docRef => {

        return db.collection('inventories').doc(docRef.id).collection("log").add({
            productName: itemName,
            productSize: itemSize,
            productQuanity: itemQuanity,
            productCostPrice: costPrice,
            productSellingPrice: sellingPrice,
            addedTimestamp: firebase.firestore.FieldValue.serverTimestamp(),
            adminUid: currentUserUid
        }).then(() => {
            addBtn.removeAttribute("disabled");

            $('.alert-danger').addClass('hidden');
            $('.alert-success').text("Added Inventory successfully").removeClass('hidden');
            addInvetoryForm.reset();
        }).catch(function (error) {
            addBtn.removeAttribute("disabled");

            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;

            if (errorCode == 'auth/network-request-failed') {
                console.log('A network error has occurred, check your connection and try again.');

                $('.alert-success').addClass('hidden');
                $('.alert-danger').text('A network error has occurred, check your connection and try again.').removeClass('hidden');
            } else {
                console.log(errorMessage);

                $('.alert-success').addClass('hidden');
                $('.alert-danger').text(errorMessage).removeClass('hidden');
            }
            console.log(error);
        })

    }).catch(function (error) {
        addBtn.removeAttribute("disabled")

        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;

        if (errorCode == 'auth/network-request-failed') {
            console.log('A network error has occurred, check your connection and try again.');

            $('.alert-success').addClass('hidden');
            $('.alert-danger').text('A network error has occurred, check your connection and try again.').removeClass('hidden');
        } else {
            console.log(errorMessage);

            $('.alert-success').addClass('hidden');
            $('.alert-danger').text(errorMessage).removeClass('hidden');
        }
        console.log(error);
    });
});

//View Inventory
function getTableData() {
    var datas = new Array();

    // Get table data from firestore : Real-time listener
    db.collection('inventories').orderBy('productNumber').onSnapshot(function (snapshot) {
        // let changes = snapshot.docChanges();

        datas = [];
        snapshot.forEach(function (doc) {
            datas.push([
                "",
                doc.id,
                doc.data().productNumber,
                doc.data().productName,
                doc.data().productSize,
                doc.data().productQuanity,
                doc.data().productCostPrice,
                doc.data().productSellingPrice]);
        });

        // console.log("Inventory Array: ", datas);
        var source = snapshot.metadata.fromCache ? "local cache" : "server";
        // console.log("Data came from " + source);


        const inventoryTable = $('#viewTable').DataTable({
            data: datas,
            destroy: true,
            order: [3, "asc"],
            columns: [
                { title: '#' },
                { title: 'uid', "visible": false },
                { title: 'Item Number' },
                { title: 'Item Name' },
                { title: 'Size(Kg)' },
                { title: 'Quantity' },
                { title: 'Cost Price(&#8358;)' },
                { title: 'Seling Price(&#8358;)' },
                { title: 'Action' },
            ],
            columnDefs: [{
                targets: -1,
                data: null,
                defaultContent: "<span id='editBtn' class='btn btn-success' type='button' data-toggle='modal' data-target='#editModal'><i class='fa fa-edit'></i></span> <span class='btn btn-danger' type='button' data-toggle='modal' data-target='#deleteModal'><i class='fa fa-trash-o'></i></span>"
            }]

        });

        inventoryTable.on('order.dt search.dt', function () {
            inventoryTable.column(0, { search: 'applied', order: 'applied' }).nodes().each(function (cell, i) {
                cell.innerHTML = i + 1;
            });
        });
        inventoryTable.clear();
        inventoryTable.rows.add(datas);
        inventoryTable.draw();

        $('#viewTable tbody ').on('click', 'tr', function () {

            var data = inventoryTable.row(this).data();
            console.log('You clicked on row with item number:: ' + data);

            const editForm = document.querySelector('#editForm');
            const uid = editForm['uid'];
            const number = editForm['inputProductNumber'];
            const name = editForm['inputProductName'];
            const size = editForm['inputProductSize'];
            const qty = editForm['inputProductQty'];
            const cost = editForm['inputProductCost'];
            const selling = editForm['inputProductSell'];
            const saveBtn = editForm['saveBtn'];

            uid.value = data[1];
            number.value = data[2].toUpperCase();
            name.value = data[3];
            size.value = data[4];
            qty.value = data[5];
            cost.value = data[6];
            selling.value = data[7];

            editForm?.addEventListener('submit', (e) => {
                e.preventDefault();

                $('#spinner').removeClass('hide');
                saveBtn.setAttribute("disabled", "true");

                if (qty.value != data[5] || cost.value != data[6] || selling.value != data[7]) {
                    db.collection('inventories').doc(uid.value).update({
                        productName: name.value,
                        productSize: size.value,
                        productQuanity: qty.value,
                        productCostPrice: cost.value,
                        productSellingPrice: selling.value
                    }).then(function () {
                        return db.collection('inventories').doc(uid.value).collection("log").add({
                            productName: name.value,
                            productSize: size.value,
                            productQuanity: qty.value,
                            productCostPrice: cost.value,
                            productSellingPrice: selling.value,
                            addedTimestamp: firebase.firestore.FieldValue.serverTimestamp(),
                            adminUid: currentUserUid
                        }).then(function () {
                            $('#spinner').addClass('hide');
                            saveBtn.removeAttribute("disabled");
                            $('.alert').text('Updated item successfully').removeClass('alert-danger').addClass('alert-success').removeClass('invisible');
                        }).catch(function (error) {
                            $('#spinner').addClass('hide');
                            saveBtn.removeAttribute("disabled");
                            $('.alert').text("Error updating item").addClass('alert-danger').removeClass('invisible');
                            setTimeout(function () {
                                $('.alert').addClass('invisible');
                            }, 5000);
                            console.error("Error updating item: ", error);
                        });
                    }).catch(function (error) {
                        $('#spinner').addClass('hide');
                        saveBtn.removeAttribute("disabled");

                        $('.alert').text("Error updating item").addClass('alert-danger').removeClass('invisible');
                        setTimeout(function () {
                            $('.alert').addClass('invisible');
                        }, 5000);
                        console.error("Error updating item: ", error);
                    });

                } else {
                    db.collection('inventories').doc(uid.value).update({
                        productName: name.value,
                        productSize: size.value,
                        productQuanity: qty.value,
                        productCostPrice: cost.value,
                        productSellingPrice: selling.value
                    }).then(function () {
                        $('#spinner').addClass('hide');
                        saveBtn.removeAttribute("disabled");

                        console.log("Inventory item successfully updated!");
                        $('.alert').text('Updated item successfully').removeClass('alert-danger').addClass('alert-success').removeClass('invisible');
                    }).catch(function (error) {
                        $('#spinner').addClass('hide');
                        saveBtn.removeAttribute("disabled");

                        $('.alert').text("Error updating item").addClass('alert-danger').removeClass('invisible');
                        setTimeout(function () {
                            $('.alert').addClass('invisible');
                        }, 5000);
                        console.error("Error updating item: ", error);
                    });
                }

            });

            const deleteBtn = document.querySelector('#deleteBtn');
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();

                $('#delSpinner').removeClass('hide');
                deleteBtn.setAttribute("disabled", "true");

                db.collection('inventories').doc(uid.value).delete()
                    .then(function () {
                        // Item deleted successfully
                        $('#delSpinner').addClass('hide');
                        deleteBtn.removeAttribute("disabled");

                        $('.alert').text('Deleted item successfully').removeClass('alert-danger').addClass('alert-success').removeClass('hide');

                        console.log("Item successfully deleted!");

                    }).catch(function (error) {
                        $('#delSpinner').addClass('hide');
                        deleteBtn.removeAttribute("disabled");

                        $('.alert').text("Error removing item").addClass('alert-danger').removeClass('hide');
                        setTimeout(function () {
                            $('.alert').addClass('hide');
                        }, 5000);

                        console.error("Error removing item: ", error);
                    });



            });
        });
    });

}

function getPriceData() {
    // Get news from firestore: Real-time listener
    db.collection('inventories').orderBy('productNumber').onSnapshot(snapshot => {
        let changes = snapshot.docChanges();
        changes.forEach(change => {
            if (change.type == 'added') {
                dataSet.push([
                    change.doc.data().productNumber,
                    change.doc.data().productName,
                    change.doc.data().productQuanity,
                    change.doc.data().productSize,
                    change.doc.data().productSellingPrice]);
            }
        });

        const dataTable = $('#priceTable').DataTable({
            data: dataSet,
            destroy: true,
            order: [1, "asc"],
            columns: [
                { title: 'Item Number' },
                { title: 'Item Name' },
                { title: 'Quantity', "visible": false },
                { title: 'Size' },
                { title: 'Price' },
                { title: 'Action' }
            ],
            columnDefs: [{
                targets: -1,
                data: null,
                defaultContent: "<button class='btn btn-sm btn-success'><span class='fa fa-plus'></span> Add</button>"
            }]

        });
        dataTable.clear();
        dataTable.rows.add(dataSet);
        dataTable.draw();

        $('#priceTable tbody').on('click', 'button', function () {
            $(this).attr("disabled", "true");

            var data = dataTable.row($(this).parents('tr')).data();

            checkoutData.push({
                id: data[0],
                product: data[1],
                quantity: 1,
                // maxqty: data[2],
                price: 0,
                sellingprice: data[4],
            });

            var table = document.querySelector("#calcTable tbody");


            clear(table);
            addDataToTbody(table, checkoutData);
            // console.log(checkoutData);
        });

    });
}

function addDataToTbody(table, data) { // table -> NodeList, data -> array with objects
    if (checkoutData === undefined || checkoutData.length == 0) {
        $("#cashBtn").attr("disabled", "true");
        $("#cardBtn").attr("disabled", "true");
    } else {
        $("#cashBtn").removeAttr("disabled");
        $("#cardBtn").removeAttr("disabled");
    }

    data.forEach((d, i) => {
        var tr = table.insertRow(i);

        var cell1 = tr.insertCell(0);
        var cell2 = tr.insertCell(1);
        var cell3 = tr.insertCell(2);
        var cell4 = tr.insertCell(3);
        var cell5 = tr.insertCell(4);

        //Product Name
        cell2.innerHTML = data[i].product;
        //Quantity max='${checkoutData[i].maxqty}'
        cell3.innerHTML = `<input style='width: 50%;' type='number'  min='1'  value='${checkoutData[i].quantity}' onchange='updateCost(this.value, "${data[i].id}")'> x &#8358;` + data[i].sellingprice;
        //Subtotal
        cell4.className = "subtotal";
        cell4.innerHTML = data[i].quantity * data[i].sellingprice;
        data[i].price = data[i].quantity * data[i].sellingprice;
        //Delete button
        cell5.innerHTML = `<button class='btn btn-sm btn-danger' type='button' onclick='deleteRowById(this, "${data[i].id}")'><span class='fa fa-trash-o'></span></button>`;

        table.appendChild(tr);
    });

    sumColumn();
}

function cardtbl(table, data) {
    // var table = document.getElementById("cardtbl");

    clear(table);

    data.forEach((d, i) => {
        var tr = table.insertRow(i);

        var cell1 = tr.insertCell(0);
        var cell2 = tr.insertCell(1);
        var cell3 = tr.insertCell(2);
        var cell4 = tr.insertCell(3);

        //Product Name
        cell2.innerHTML = data[i].product;
        //Quantity
        cell3.innerHTML = data[i].quantity;
        //Subtotal
        cell4.innerHTML = data[i].price;

        table.appendChild(tr);
    });
}

function receiptTbl(table, data) {
    clear(table);

    data.forEach((d, i) => {
        var tr = table.insertRow(i);

        var cell2 = tr.insertCell(0);
        var cell3 = tr.insertCell(1);
        var cell4 = tr.insertCell(2);

        //Product Name
        cell2.innerHTML = data[i].product;
        //Quantity
        cell3.innerHTML = data[i].quantity;
        //Subtotal
        cell4.innerHTML = data[i].price;

        table.appendChild(tr);
    });
}

function updateCost(count, id) {
    // console.log(count, id);

    checkoutData.forEach((product, index) => {
        if (product.id == id) {
            checkoutData[index].quantity = count;
        }
    });
    var table = document.querySelector("#calcTable tbody");
    clear(table);
    addDataToTbody(table, checkoutData);
}

function sumColumn() {
    var sum = 0;
    // iterate through each td based on class and add the values
    $(".subtotal").each(function () {

        var value = $(this).text();
        // add only if the value is number
        if (!isNaN(value) && value.length != 0) {
            sum += parseFloat(value);
        }
    });

    $("#lbltotalprice").html(sum);
}

function deleteRowById(r, id) {
    // $("#priceTable button").removeAttr("disabled");
    var i = r.parentNode.parentNode.rowIndex;
    document.getElementById("calcTable").deleteRow(i);

    checkoutData.forEach((product, index) => {
        if (product.id == id) {
            sumColumn();
            checkoutData.splice(index, 1);

            dataSet.forEach((product, index) => {
                if (product[0] == id) {
                    var table = $('#priceTable').DataTable();
                    var data = table.row(index).node().getElementsByTagName('button');
                    data[0].disabled = false;
                }
            });
        }
    });

    if (checkoutData === undefined || checkoutData.length == 0) {
        $("#cashBtn").attr("disabled", "true");
        $("#cardBtn").attr("disabled", "true");
    } else {
        $("#cashBtn").removeAttr("disabled");
        $("#cardBtn").removeAttr("disabled");
    }
}

function deleteRow(r) {
    // $("#priceTable button").removeAttr("disabled");
    var i = r.parentNode.parentNode.rowIndex;
    document.getElementById("calcTable").deleteRow(i);
}

function clear(table) {
    var rowCount = table.rows.length;
    for (var x = rowCount - 1; x > -1; x--) {
        table.deleteRow(x);
    }
}

function clearRows() {
    $("#priceTable button").removeAttr("disabled");
    $("#lbltotalprice").html(0);
    checkoutData = [];
    var myTable = document.getElementById("calcTable");
    var rowCount = myTable.rows.length;
    for (var x = rowCount - 1; x > 0; x--) {
        myTable.deleteRow(x);
    }

    if (checkoutData === undefined || checkoutData.length == 0) {
        $("#cashBtn").attr("disabled", "true");
        $("#cardBtn").attr("disabled", "true");
    } else {
        $("#cashBtn").removeAttr("disabled");
        $("#cardBtn").removeAttr("disabled");
    }
}

//Add admin cloud functions
const adminForm = document.querySelector('.admin-actions');
adminForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const adminEmail = document.querySelector('#admin-email').value;
    const addAdminRole = functions.httpsCallable('addAdminRole');

    addAdminRole({ email: adminEmail }).then(result => {

        $('.alert-danger').addClass('hidden');
        $('.alert-success').text(result.data.message).removeClass('hidden');
        adminForm.reset();
        console.log(result);
    });
});

//Offline Mode
db.settings({
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
});
db.enablePersistence().catch(function (err) {
    if (err.code == 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a a time.
        console.log("Error: " + err);

    } else if (err.code == 'unimplemented') {
        // The current browser does not support all of the features required to enable persistence
        console.log("Error: " + err);
    }
});


//Calculator
const calculator = {
    displayValue: '0',
    firstOperand: null,
    waitingForSecondOperand: false,
    operator: null,
};

function inputDigit(digit) {
    const { displayValue, waitingForSecondOperand } = calculator;

    if (waitingForSecondOperand === true) {
        calculator.displayValue = digit;
        calculator.waitingForSecondOperand = false;
    } else {
        calculator.displayValue = displayValue === '0' ? digit : displayValue + digit;
    }
}

function inputDecimal(dot) {
    // If the `displayValue` does not contain a decimal point
    if (!calculator.displayValue.includes(dot)) {
        // Append the decimal point
        calculator.displayValue += dot;
    }
}

function handleOperator(nextOperator) {
    const { firstOperand, displayValue, operator } = calculator
    const inputValue = parseFloat(displayValue);

    if (operator && calculator.waitingForSecondOperand) {
        calculator.operator = nextOperator;
        return;
    }

    if (firstOperand == null) {
        calculator.firstOperand = inputValue;
    } else if (operator) {
        const currentValue = firstOperand || 0;
        const result = performCalculation[operator](currentValue, inputValue);

        calculator.displayValue = String(result);
        calculator.firstOperand = result;
    }

    calculator.waitingForSecondOperand = true;
    calculator.operator = nextOperator;
}

const performCalculation = {
    '/': (firstOperand, secondOperand) => firstOperand / secondOperand,

    '*': (firstOperand, secondOperand) => firstOperand * secondOperand,

    '+': (firstOperand, secondOperand) => firstOperand + secondOperand,

    '-': (firstOperand, secondOperand) => firstOperand - secondOperand,

    '=': (firstOperand, secondOperand) => secondOperand
};

function resetCalculator() {
    document.getElementById("cChange").value = 0;
    document.getElementById("givenTxt").innerHTML = 0;
    document.getElementById("changeTxt").innerHTML = 0;
    calculator.displayValue = '0';
    calculator.firstOperand = null;
    calculator.waitingForSecondOperand = false;
    calculator.operator = null;
}

function updateDisplay() {
    const display = document.querySelector('.calculator-screen');
    display.value = calculator.displayValue;
}

function addValue(value) {
    const { firstOperand, displayValue, operator } = calculator
    const inputValue = parseFloat(displayValue);
    if (value == 1000) {
        calculator.displayValue = inputValue + 1000;
    } else if (value == 500) {
        calculator.displayValue = inputValue + 500;
    } else if (value == 200) {
        calculator.displayValue = inputValue + 200;
    }
}

const keys = document.querySelector('.calculator-keys');
keys?.addEventListener('click', (event) => {
    const { target } = event;
    if (!target.matches('button')) {
        check();
        return;
    }
    if (target.classList.contains('predefined')) {
        addValue(target.value);
        updateDisplay();
        check();
        return;
    }

    if (target.classList.contains('operator')) {
        handleOperator(target.value);
        updateDisplay();
        check();
        return;
    }

    if (target.classList.contains('decimal')) {
        inputDecimal(target.value);
        updateDisplay();
        return;
    }

    if (target.classList.contains('all-clear')) {
        resetCalculator();
        updateDisplay();
        check();
        return;
    }

    if (target.classList.contains('sendBtn')) {
        changeCalculations();
        updateDisplay();
        check();
        return;
    }

    inputDigit(target.value);
    updateDisplay();
    check();
});


function changeCalculations() {
    var total = document.getElementById("totalAmount").value;
    var givenAmount = document.getElementById("amountT").value;
    var change = givenAmount - total;

    document.getElementById("cChange").value = change;
    document.getElementById("givenTxt").innerHTML = givenAmount;
    document.getElementById("changeTxt").innerHTML = change;
}

function fullDateTime() {
    var d = new Date();
    document.getElementById("demo2").innerHTML = n;
}

function payCash(button) {
    $(this.spinner).removeClass('hide');
    button.setAttribute("disabled", "true");

    var today = new Date();
    let date = new Date().toISOString().slice(0, 10);
    // var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    // var date2 = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
    // var time = today.getHours() + ":" + today.getMinutes();
    // var dateTime = date2 + ' ' + time;
    var now = today.toLocaleString([], { hour12: true });


    db.collection('sales').doc(date).collection("items").add({
        items: checkoutData,
        type: "Cash",
        total: document.getElementById("lbltotalprice").innerHTML,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(docRef => {
        // console.log('Added  docId to server= ' + docRef.id);
        checkoutData = [];
    }).catch(function (error) {
        button.removeAttribute("disabled");
        $(this.spinner).addClass('hide');

        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;

        if (errorCode == 'auth/network-request-failed') {
            console.log('A network error has occurred, check your connection and try again.');
            alert('A network error has occurred, check your connection and try again.');
        } else {
            console.log(errorMessage);
        }
        console.log(error);
    });


    // console.log('Added  docId to cache');

    button.removeAttribute("disabled");
    $(this.spinner).addClass('hide');

    //Show receipt
    $('#receiptBorderCash').removeClass('hide');
    $('#receiptPreviewCash').removeClass('hide');
    $('#tablePreviewCash').addClass('hide');

    $('#receiptTimeCash').html(now);
    $('#cashierNameCash').html(sellerName);
    // $('#receiptIDCash').html('#' + docRef.id);
    // $('#receiptIDCash').html('#001');

    $('#receiptTotalCash').html('&#8358;' + $("#lbltotalprice").html());
    $('#receiptPaidCash').html('&#8358;' + $("#givenTxt").html());
    $('#receiptChangeCash').html('&#8358;' + $("#changeTxt").html());

    //Show print button
    button.classList.add("hide");
    $('#printCash').removeClass('hide');
}

function pay(button) {
    // const spinner =  $('#spinner');
    $(this.spinner).removeClass('hide');
    // $('.spinner').removeClass('hide');
    button.setAttribute("disabled", "true");

    let date = new Date().toISOString().slice(0, 10);

    var today = new Date();
    // var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

    // var date2 = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
    // var time = today.getHours() + ":" + today.getMinutes();
    // var dateTime = date2 + ' ' + time;
    var now = today.toLocaleString([], { hour12: true });

    db.collection('sales').doc(date).collection("items").add({
        items: checkoutData,
        type: "Card",
        total: document.getElementById("lbltotalprice").innerHTML,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(docRef => {
        // console.log('Added  docId to server= ' + docRef.id);
        // console.log('Added  docId to server');
    }).catch(function (error) {
        button.removeAttribute("disabled");
        $(this.spinner).addClass('hide');

        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;

        if (errorCode == 'auth/network-request-failed') {
            console.log('A network error has occurred, check your connection and try again.');
            alert('A network error has occurred, check your connection and try again.');
        } else {
            console.log(errorMessage);
        }
        console.log(error);
    });

    // console.log('Added  docId to cache');

    button.removeAttribute("disabled");
    $(this.spinner).addClass('hide');

    //Show receipt
    $('#receiptBorder').removeClass('hide');
    $('#receiptPreview').removeClass('hide');
    $('#tablePreview').addClass('hide');

    $('#receiptTime').html(now);
    $('#cashierName').html(sellerName);
    // $('#receiptID').html('#001');


    //Show print button
    button.classList.add("hide");
    $('#print').removeClass('hide');
}

function printReceipt() {
    printJS({
        printable: 'receiptPreview',
        type: 'html',
        targetStyles: ['*'],
        css: '../css/style.css',
        showModal: true,
        modalMessage: 'Printing receipt...',
        honorMarginPadding: false,
        onPrintDialogClose: autoRefresh(5000)
    });
}

function printReceiptCash() {
    printJS({
        printable: 'receiptPreviewCash',
        type: 'html',
        targetStyles: ['*'],
        css: '../css/style.css',
        showModal: true,
        modalMessage: 'Printing receipt...',
        honorMarginPadding: false,
        onPrintDialogClose: autoRefresh(5000)
    });
}

function startPrompt() {
    let today = new Date().toISOString().slice(0, 10);
    // var today = new Date();
    // var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    // var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    // var dateTime = date + ' ' + time;

    if (confirm("Start sales")) {
        db.collection('sales').doc(today).set({
            start: firebase.firestore.FieldValue.serverTimestamp(),
            staff: sellerName
        }).then(docRef => {
            alert('Have a great day');
            console.log('created day with docId= ' + docRef);
            // setTimeout(function () {  }, 200000);
            window.location.replace("pos.html");
        }).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;

            if (errorCode == 'auth/network-request-failed') {
                console.log('A network error has occurred, check your connection and try again.');
            } else {
                console.log(errorMessage);
            }
            console.log(error);
        });

    } else {
        auth.signOut();
        alert('Comeback again');
    }
}

function endPrompt() {
    let today = new Date().toISOString().slice(0, 10);

    // var today = new Date();
    // var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate().padStart(2, '0');

    if (confirm("End today sales")) {
        db.collection('sales').doc(today).update({
            end: firebase.firestore.FieldValue.serverTimestamp(),
        }).then(docRef => {
            console.log('created day with docId= ' + docRef);
            auth.signOut();
        }).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;

            if (errorCode == 'auth/network-request-failed') {
                console.log('A network error has occurred, check your connection and try again.');
            } else {
                console.log(errorMessage);
            }
            console.log(error);
        });
    }

}

function autoRefresh(t) {
    setTimeout("location.reload(true);", t);
}


function check() {
    const total = parseInt($("#totalAmount").val());
    const given = parseInt(document.getElementById("givenTxt").innerHTML);
    const btn = document.getElementById("cashPayBtn");

    if (given >= total) {
        btn.removeAttribute("disabled");
    } else {
        btn.setAttribute("disabled", "");
    }
}

// $('#getSalesForm').submit(function (e) {
//     e.preventDefault();

// });