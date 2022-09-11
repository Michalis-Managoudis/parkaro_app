'use strict';
//const dataModel = require('../models/sqlite_data_model.js');
const dataModel = require('../models/mysql_data_model.js');

// regex patterns
const mail_regex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
const password_regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
const phone_regex = /[0-9]{10}/;
const tin_regex = /[0-9]+/;
 
// const safe = require('safe-regex');
// console.log(safe(tin_regex));

function get_user_sign_up_page(req, res) {
    if (req.session.sid === undefined) {
        res.render('user/sign_up', {
            'is_user': true,
            'login': false
        });
    }
    else {
        console.log("user already logged in");
        res.redirect('/home');
    }
};
function get_parking_station_sign_up_page(req, res) {
    if (req.session.sid === undefined) {
        res.render('parking_station/sign_up', {
            'is_user': false,
            'login': false
        });
    }
    else {
        console.log("parking station already logged in");
        res.redirect('/parking_station/home');
    }
};

function add_new_user(req, res) {
    if (req.session.sid === undefined) {
        let new_user = {};
        for (let field of dataModel.schema_required["user"]) new_user[field] = req.body[field]; // dynamically get user keys and values
        // check fields agree with patterns
        let fields_check = true;
        if (!mail_regex.test(new_user.email)) fields_check = false;
        if (!password_regex.test(new_user.password)) fields_check = false;
        if (!phone_regex.test(new_user.phone)) fields_check = false;
        if (fields_check) {
            // check if user already exists (email and phone)
            dataModel.read_("user", "email", `email = "${new_user.email}"`, function (data) { // check if email exists
                if (Object.keys(data).length === 0) { // if email not found in database
                    dataModel.read_("user", "phone", `phone = "${new_user.phone}"`, function (data) { // check if phone exists
                        if (Object.keys(data).length === 0) { // phone not found in database
                            // insert new_user to database
                            const required_values = Object.values(new_user); // put required values in an array
                            dataModel.create_("user", required_values, function () {
                                dataModel.auth_("user", new_user.email, new_user.password, function (row) {
                                    req.session.sid = row.id;
                                    req.session.lang = row.lang;
                                    console.log("user added succesfully");
                                    res.redirect('/account'); // redirect new logged in user to account page or home page
                                })
                            });
                        }
                        else { // phone found in database
                            console.log("Phone already exist");
                            res.redirect('/sign_up'); // redirect to sign in page
                            //? alert("\n\n Το email χρήστη που βάλατε υπάρχει ήδη δοκιμάστε να συνδεθείτε με αυτό το email \n\n ");
                        }
                    });
                }
                else {
                    console.log("Email already exist");
                    res.redirect('/sign_in');
                    //? alert("\n\n Το email χρήστη που βάλατε υπάρχει ήδη δοκιμάστε να συνδεθείτε με αυτό το email \n\n ");
                }
            });
        }
    }
    else {
        console.log("important error!");
        res.redirect('/account');
    }

};
function add_new_parking_station(req, res) {
    if (req.session.sid === undefined) {
        let new_parking_station = {};
        for (let field of dataModel.schema_required["parking_station"]) new_parking_station[field] = req.body[field]; // dynamically get user keys and values
        // check fields agree with patterns
        let fields_check = true;
        if (!mail_regex.test(new_parking_station.email)) fields_check = false;
        if (!password_regex.test(new_parking_station.password)) fields_check = false;
        if (!tin_regex.test(new_parking_station.tin)) fields_check = false;
        if (!phone_regex.test(new_parking_station.phone)) fields_check = false;
        if (!(new_parking_station.lots >= 0)) fields_check = false;
        if (!(new_parking_station.height > 0)) fields_check = false;
        if (!(new_parking_station.length > 0)) fields_check = false;
        for (let field of dataModel.schema_parking_station_boolean) {
            if (!(new_parking_station[field] === 0 || new_parking_station[field] === 1)) fields_check = false;
        }
        if (fields_check) {
            // check if parking_station already exists (email and tin)
            dataModel.read_("parking_station", "email", `email = "${new_parking_station.email}"`, function (data) {
                if (Object.keys(data).length === 0) {
                    dataModel.read_("parking_station", "tin", `tin = "${new_parking_station.tin}"`, function (data) {
                        if (Object.keys(data).length === 0) {
                            // insert new_parking_station to database
                            const required_values = Object.values(new_parking_station); // put required values in an array
                            dataModel.create_("parking_station", required_values, function (row) {
                                dataModel.auth_("parking_station", new_parking_station.email, new_parking_station.password, function (row) {
                                    req.session.sid = row.id;
                                    req.session.lang = row.lang;
                                    console.log("parking_station added succesfully");
                                    res.redirect('/parking_station/account'); // redirect new logged in parking_station to account page or home page
                                })
                            });
                        }
                        else {
                            console.log("TIN already exist");
                            res.redirect('/parking_station/sign_up');
                            //? alert("\n\n Το email χρήστη που βάλατε υπάρχει ήδη δοκιμάστε να συνδεθείτε με αυτό το email \n\n ");
                        }
                    });
                }
                else {
                    console.log("Email already exist");
                    res.redirect('parking_station/sign_in');
                    //? alert("\n\n Το email χρήστη που βάλατε υπάρχει ήδη δοκιμάστε να συνδεθείτε με αυτό το email \n\n ");
                }
            });
        }
    }
    else {
        console.log("important error!");
        res.redirect('/account');
    }

};

function get_user_sign_in_page(req, res) {
    if (req.session.sid === undefined) {
        res.render('user/sign_in', {
            'is_user': true,
            'login': false
        });
    }
    else {
        console.log("user already logged in");
        res.redirect('/home');
    }
};
function get_parking_station_sign_in_page(req, res) {
    if (req.session.sid === undefined) {
        res.render('parking_station/sign_in', {
            'is_user': false,
            'login': false
        });
    }
    else {
        console.log("parking station already logged in");
        res.redirect('/parking_station/home');
    }
};

function login_user(req, res) {
    if (req.session.sid === undefined) {
        const user = {
            "email": req.body.email,
            "password": req.body.password,
        };
        // check if user credentials exist
        dataModel.auth_("user", user.email, user.password, function (data) {
            if (data.id) { // user found
                // start new session
                req.session.sid = data.id;
                req.session.lang = data.lang;
                //! req.session.lang = 0;
                console.log("succesfully logged in");
                res.redirect('/account'); // redirect to home page
            }
            else {
                console.log("Wrong email or password");
                res.redirect('/sign_in'); // redirect to try again
            }
        })
    }
    else {
        console.log("important error!");
        res.redirect('/account');
    }

};
function login_parking_station(req, res) {
    if (req.session.sid === undefined) {
        const parking_station = {
            "email": req.body.email,
            "password": req.body.password,
        };
        // check if user credentials exist
        dataModel.auth_("parking_station", parking_station.email, parking_station.password, function (data) {
            if (data.id) { // user found
                // start new session
                req.session.sid = data.id;
                req.session.lang = data.lang;
                //! req.session.lang = 0;
                console.log("succesfully logged in");
                res.redirect('/parking_station/home'); // redirect to home page
            }
            else {
                console.log("Wrong email or password");
                res.redirect('/parking_station/sign_in'); // redirect to try again
            }
        })
    }
    else {
        console.log("important error!");
        res.redirect('/account');
    }

};

function logout_user(req, res) {
    if (req.session.sid === undefined) {
        res.redirect('/')
    }
    else {
        req.session.destroy((err) => { console.log("user session destroyed") })
        res.redirect('/sign_in')
    }
};
function logout_parking_station(req, res) {
    if (req.session.sid === undefined) {
        res.redirect('/parking_station')
    }
    else {
        req.session.destroy((err) => { console.log("parking_station session destroyed") })
        res.redirect('/parking_station/sign_in')
    }
};

module.exports = {
    get_user_sign_up_page,
    get_parking_station_sign_up_page,
    add_new_user,
    add_new_parking_station,
    get_user_sign_in_page,
    get_parking_station_sign_in_page,
    login_user,
    login_parking_station,
    logout_user,
    logout_parking_station
}