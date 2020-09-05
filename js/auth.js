// Listen for auth status changes
auth.onAuthStateChanged(user => {
    // console.log(user);
    if (user) {
        // User is signed in.
        var displayName = user.displayName;
        var email = user.email;
        var emailVerified = user.emailVerified;
        var photoURL = user.photoURL;
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        var providerData = user.providerData;

        user.getIdTokenResult().then((idTokenResult) => {
            user.admin = idTokenResult.claims.admin;
        });

        console.log('user logged in: ', user);
    } else {
        // User is signed out.
        console.log('user logged out');
        // window.location.replace("login.html");
        // window.open('login.html');
        // window.parent.close();
    }
});




// Change password
const chgePwdForm = document.querySelector('#changePasswordForm');
chgePwdForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    var user = auth.currentUser;
    // Get current password and new password
    const currentPwd = chgePwdForm['currentPassword'].value;
    const newPwd = chgePwdForm['newPassword'].value;
    const confirmNewPwd = chgePwdForm['confirmNewPassword'].value;

    user.reauthenticateWithCredential(
        firebase.auth.EmailAuthProvider.credential(user.email, currentPwd)
    ).then(cred => {
        console.log('User authenticated successfully');

        if (newPwd != confirmNewPwd) {
            $('.alert-success').addClass('hidden');
            $('.alert-danger').text("Passwords do not match").removeClass('hidden');
        } else {
            user.updatePassword(newPwd).then(function () {
                return db.collection('users').doc(cred.user.uid).update({
                    password: newPwd
                });
            }).then(() => {
                // Update successful.
                chgePwdForm.reset();
                $('.alert-danger').addClass('hidden');
                $('.alert-success').text("Password updated successfully").removeClass('hidden');
            }).catch(function (error) {
                // An error happened.
                $('.alert-success').addClass('hidden');
                $('.alert-danger').text(error).removeClass('hidden');
            });
        }
    }).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;

        if (errorCode === 'auth/wrong-password') {
            $('.alert-success').addClass('hidden');
            $('.alert-danger').text('The password is invalid').removeClass('hidden');
        } else if (errorCode == 'auth/network-request-failed') {
            $('.alert-success').addClass('hidden');
            $('.alert-danger').text('A network error has occurred, check your connection and try again.').removeClass('hidden');
        } else {
            $('.alert-success').addClass('hidden');
            $('.alert-danger').text(errorMessage).removeClass('hidden');
        }
        console.log(error);
    });
});
