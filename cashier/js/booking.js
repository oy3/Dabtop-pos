//Get user data
const setupBookingUi = (user) => {
    if (user) {
        db.collection('users').doc(user.uid).get().then(doc => {

            document.querySelector('#user-name').value = doc.data().fullname;
            document.querySelector('#useremail').value = doc.data().email
            document.querySelector('#userphone').value = doc.data().phonenumber;
            document.querySelector('#user-address').value = doc.data().address;
            document.querySelector('#userstate').value = doc.data().state;
            document.querySelector('#usercountry').value = doc.data().country;
        });
    }
}

function showMessage() {
    document.getElementById('cname').innerHTML = document.getElementById("user-name").value.toUpperCase();
    document.getElementById('clocation').innerHTML = (document.getElementById("userstate").value + ", " + document.getElementById("usercountry").value).toUpperCase();
    document.getElementById('caddress').innerHTML = document.getElementById("user-address").value.toUpperCase();
    document.getElementById('cphone').innerHTML = document.getElementById("userphone").value;
    document.getElementById('cemail').innerHTML = document.getElementById("useremail").value.toUpperCase();
    document.getElementById('cdate').innerHTML = document.getElementById("select-date").value + " AT " + document.getElementById("select-time").value;
}

$(document).ready(function () {
    $("#select-date").datepicker({
        dateFormat: "DD, d MM, yy",
        minDate: 'now'
    });
    $('#datepicker').click(function (e) {
        e.preventDefault();
        $("#select-date").focus();
    });
});

var totalAmount = 0;
var totalHours = 0;
function calculation() {
    const room = document.getElementById("bedroom");
    const bath = document.querySelector('#bathroom');
    const hours = document.querySelector('#hours');
    const setduration = document.querySelector('#chours');
    const amount = document.querySelector('#amount');
    const setAmount = document.querySelector('#finalAmount');
    const service = document.getElementById('service');
    var numberHoursRoom = room.value;
    var numberHoursBath = bath.value;
    const product = $("input:radio[name=product]:checked");
    var roomValue = 0;

    if (room.value <= 0) {
        roomValue = 0
    } else {
        roomValue = Number(room.value) + 1
    }

    if (roomValue > 0 || bath.value > 0) {
        totalHours = roomValue + Number(bath.value);
    }

    if (service.value == "Light Clean" && numberHoursRoom != "" && numberHoursBath != "") {
        totalAmount = ((Number(room.value) + 1) * 1000) + (Number(bath.value) * 2000)
    } else if (service.value == "Deep Clean" && numberHoursRoom != "" && numberHoursBath != "") {
        totalAmount = ((Number(room.value) + 1) * 1750) + (Number(bath.value) * 3500)
    } else if (service.value == "Moving In & Out" && numberHoursRoom != "" && numberHoursBath != "") {
        totalAmount = ((Number(room.value) + 1) * 1500) + (Number(bath.value) * 3500)
    } else if (service.value == "Post Construction" && numberHoursRoom != "" && numberHoursBath != "") {
        totalAmount = ((Number(room.value) + 1) * 2000) + (Number(bath.value) * 4000)
    }

    if (document.getElementById("option-yes").checked == true) {
        totalAmount += 2000
    }

    if (totalHours <= 1) {
        hours.textContent = totalHours + " hour";
        setduration.textContent = totalHours + " hour";
    } else {
        hours.textContent = totalHours + " hours";
        setduration.textContent = totalHours + " hours";
    }

    amount.textContent = totalAmount.toLocaleString('en');
    setAmount.value = "Pay ₦" + totalAmount.toLocaleString('en') + " now!";
}


//jQuery time
var current_fs, next_fs, previous_fs; //fieldsets
var left, opacity, scale; //fieldset properties which we will animate
var animating; //flag to prevent quick multi-click glitche

$('.next').click(function () {

    var parent_fieldset = $(this).parents('fieldset');
    var next_step = false;

    parent_fieldset.find('.required').each(function () {
        if ($(this).val() == "") {
            $(this).addClass('input-error');
            next_step = false;
        } else {
            $(this).removeClass('input-error');
            next_step = true;
        }
    });

    if (next_step) {

        if (animating) return false;
        animating = true;

        current_fs = $(this).parent();
        next_fs = $(this).parent().next();

        //activate next step on progressbar using the index of next_fs
        $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");

        //show the next fieldset
        next_fs.show();

        //hide the current fieldset with style
        current_fs.animate({ opacity: 0 }, {
            step: function (now, mx) {
                //as the opacity of current_fs reduces to 0 - stored in "now"
                //1. scale current_fs down to 80%
                scale = 1 - (1 - now) * 0.2;
                //2. bring next_fs from the right(50%)
                left = (now * 50) + "%";
                //3. increase opacity of next_fs to 1 as it moves in
                opacity = 1 - now;
                current_fs.css({
                    'transform': 'scale(' + scale + ')',
                    'position': 'absolute'
                });
                next_fs.css({ 'left': left, 'opacity': opacity });
            },
            duration: 800,
            complete: function () {
                current_fs.hide();
                animating = false;
            },
            //this comes from the custom easing plugin
            easing: 'easeInOutBack'
        });
    }
});

$('.previous').click(function () {
    if (animating) return false;
    animating = true;

    current_fs = $(this).parent();
    previous_fs = $(this).parent().prev();

    //de-activate current step on progressbar
    $("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");

    //show the previous fieldset
    previous_fs.show();
    //hide the current fieldset with style
    current_fs.animate({ opacity: 0 }, {
        step: function (now, mx) {
            //as the opacity of current_fs reduces to 0 - stored in "now"
            //1. scale previous_fs from 80% to 100%
            scale = 0.8 + (1 - now) * 0.2;
            //2. take current_fs to the right(50%) - from 0%
            left = ((1 - now) * 50) + "%";
            //3. increase opacity of previous_fs to 1 as it moves in
            opacity = 1 - now;
            current_fs.css({ 'left': left });
            previous_fs.css({ 'transform': 'scale(' + scale + ')', 'opacity': opacity });
        },
        duration: 800,
        complete: function () {
            current_fs.hide();
            animating = false;
        },
        //this comes from the custom easing plugin
        easing: 'easeInOutBack'
    });
});

$('.submit').click(function () {
    payWithPaystack()
});

