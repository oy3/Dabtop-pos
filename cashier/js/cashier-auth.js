var currentUserUid;
var currentUserName;

var dataSet = new Array();
var checkoutData = [];

firebase.firestore().settings({
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
});
firebase.firestore().enablePersistence()
    .catch(function (err) {
        if (err.code == 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled
            // in one tab at a a time.
            // ...
        } else if (err.code == 'unimplemented') {
            // The current browser does not support all of the
            // features required to enable persistence
            // ...
        }
    });

auth.onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        currentUserUid = user.uid;
        currentUserName = user.displayName;
        // console.log(user);

        // user.updateProfile({
        //     displayName: "Oyeyinka Felicia"
        // }).then(function () {
        //     // Update successful.
        //     console.log("success", user.displayName);
        // }).catch(function (error) {
        //     // An error happened.
        // });
    }
});

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
                    btn.removeAttribute("disabled");
                    auth.signOut();
                    redirectAdmin();
                } else {
                    // Show regular user UI.
                    db.collection('authLogs').add({
                        action: "LogIn",
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                        user: [currentUserUid, currentUserName]
                    }).then(docRef => {
                        window.location.replace("index.html");
                        btn.removeAttribute("disabled");
                        // console.log('Logged in timestamp= ' + docRef.id);
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

function updateDisplay() {
    const display = document.querySelector('.calculator-screen');
    display.value = calculator.displayValue;
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

function clear(table) {
    var rowCount = table.rows.length;
    for (var x = rowCount - 1; x > -1; x--) {
        table.deleteRow(x);
    }
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

function pay(button, type) {
    $(this.spinner).removeClass('hide');
    button.setAttribute("disabled", "true");

    var today = new Date();
    let date = new Date().toISOString().slice(0, 10);
    var now = today.toLocaleString([], { hour12: true });

    db.collection('sales').add({
        items: checkoutData,
        type: type,
        total: document.getElementById("lbltotalprice").innerHTML,
        cashier: [currentUserUid, currentUserName],
        date: date,
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

    if (type == "Cash") {
        forCash(button, now);
    } else if (type == "Card") {
        forCard(button, now);
    } else {
        console.log("Invalid Payment Type");
    }
}

function forCash(button, now) {
    //Show receipt
    $('#receiptBorderCash').removeClass('hide');
    $('#receiptPreviewCash').removeClass('hide');
    $('#tablePreviewCash').addClass('hide');

    $('#receiptTimeCash').html(now);
    $('#cashierNameCash').html(currentUserName);

    $('#receiptTotalCash').html('&#8358;' + $("#lbltotalprice").html());
    $('#receiptPaidCash').html('&#8358;' + $("#givenTxt").html());
    $('#receiptChangeCash').html('&#8358;' + $("#changeTxt").html());

    //Show print button
    button.classList.add("hide");
    $('#printCash').removeClass('hide');
}

function forCard(button, now) {
    //Show receipt
    $('#receiptBorder').removeClass('hide');
    $('#receiptPreview').removeClass('hide');
    $('#tablePreview').addClass('hide');

    $('#receiptTime').html(now);
    $('#cashierName').html(currentUserName);

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

function autoRefresh(t) {
    setTimeout("location.reload(true);", t);
}

function endPrompt() {
    if (confirm("Select 'Logout' below if you are ready to end your current session.")) {
        db.collection('authLogs').add({
            action: "LogOut",
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            user: [currentUserUid, currentUserName]
        }).then(docRef => {
            auth.signOut();
            // console.log('Logged in timestamp= ' + docRef.id);
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

function redirectAdmin() {
    window.location.replace("../index.html");
    // if (confirm("Access is denied, Redirect to Admin Login Page?")) {
    //     window.location.replace("https://dabtop-pos.vercel.app/");

    // } else {
    //     location.reload();
    // }
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