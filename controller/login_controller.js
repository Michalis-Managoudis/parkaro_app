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

function get_driver_sign_up_page(req, res) {
    if (req.session.sid === undefined) {
        res.render('driver/sign_up', {
            'is_driver': true,
            'login': false
        });
    }
    else {
        console.log("driver already logged in");
        res.redirect('/home');
    }
};
function get_parking_station_sign_up_page(req, res) {
    if (req.session.sid === undefined) {
        res.render('parking_station/sign_up', {
            'is_driver': false,
            'login': false
        });
    }
    else {
        console.log("parking station already logged in");
        res.redirect('/parking_station/home');
    }
};

function add_new_driver(req, res) {
    if (req.session.sid === undefined) {
        let new_driver = {};
        for (let field of dataModel.schema_required["driver"]) new_driver[field] = req.body[field]; // dynamically get driver keys and values
        // check fields agree with patterns
        let fields_check = true;
        if (!mail_regex.test(new_driver.email)) fields_check = false;
        if (!password_regex.test(new_driver.password)) fields_check = false;
        if (!phone_regex.test(new_driver.phone)) fields_check = false;
        if (!(new_driver.password===req.body.password2)) fields_check = false;
        if (fields_check) {
            // check if driver already exists (email and phone)
            dataModel.read_("driver", "email", `email = "${new_driver.email}"`, function (data) { // check if email exists
                if (Object.keys(data).length === 0) { // if email not found in database
                    dataModel.read_("driver", "phone", `phone = "${new_driver.phone}"`, function (data) { // check if phone exists
                        if (Object.keys(data).length === 0) { // phone not found in database
                            // insert new_driver to database
                            const required_values = Object.values(new_driver); // put required values in an array
                            dataModel.create_("driver", required_values, function () {
                                dataModel.auth_("driver", new_driver.email, new_driver.password, function (row) {
                                    req.session.sid = row.id;
                                    req.session.lang = row.lang;
                                    console.log("driver added succesfully");
                                    res.redirect('/account'); // redirect new logged in driver to account page or home page
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
        else {
            console.log("Fields check failed");
            res.redirect('/sign_up');
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
        for (let field of dataModel.schema_required["parking_station"]) {
            if (field == "work_hours") {
                new_parking_station.work_hours = "";
                for (let i = 1 ; i <= 7 ; i++) {
                    new_parking_station.work_hours = new_parking_station.work_hours + req.body["work_hours"+i] + "-" + req.body["work_hours"+i+"b"];
                    if (i !== 7) new_parking_station.work_hours = new_parking_station.work_hours + ",";
                }
            }
            else if (field == "price_list") {
                new_parking_station.price_list = "h";
                for (let i = 1 ; i <= 12 ; i++) {
                    new_parking_station.price_list = new_parking_station.price_list + req.body["price_list"+i];
                    if (i === 4) new_parking_station.price_list = new_parking_station.price_list + "d";
                    else if (i === 8) new_parking_station.price_list = new_parking_station.price_list + "m";
                    else if (i !== 12) new_parking_station.price_list = new_parking_station.price_list + ",";
                }
            } else {
                new_parking_station[field] = req.body[field]; // dynamically get driver keys and values
            }
        }
        new_parking_station.parking_type = parseInt(new_parking_station.parking_type);
        new_parking_station.tin = parseInt(new_parking_station.tin);
        new_parking_station.lots = parseInt(new_parking_station.lots);
        new_parking_station.s_height = parseFloat(new_parking_station.s_height);
        new_parking_station.s_length = parseFloat(new_parking_station.s_length);
        // check fields agree with patterns
        let fields_check = true;
        if (!mail_regex.test(new_parking_station.email)) fields_check = false;
        if (!password_regex.test(new_parking_station.password)) fields_check = false;
        if (!tin_regex.test(new_parking_station.tin)) fields_check = false;
        if (!phone_regex.test(new_parking_station.phone)) fields_check = false;
        if (!(new_parking_station.parking_type === 0 || new_parking_station.parking_type === 1 ||new_parking_station.parking_type === 2)) fields_check = false;
        if (!(new_parking_station.lots >= 0)) fields_check = false;
        if (!(new_parking_station.s_height > 0)) fields_check = false;
        if (!(new_parking_station.s_length > 0)) fields_check = false;
        for (let field of dataModel.schema_parking_station_boolean) {
            new_parking_station[field] = parseInt(new_parking_station[field]);
            if (!(new_parking_station[field] === 0 || new_parking_station[field] === 1)) fields_check = false;
        }
        if (fields_check) {
            // check if parking_station already exists (email and tin)
            dataModel.read_("parking_station", "email", `email = "${new_parking_station.email}"`, function (data) {
                if (Object.keys(data).length === 0) { // if email not found in database
                    dataModel.read_("parking_station", "tin", `tin = "${new_parking_station.tin}"`, function (data) {
                        if (Object.keys(data).length === 0) { // if tin not found in database
                            // insert new_parking_station to database
                            const required_values = Object.values(new_parking_station); // put required values in an array
                            dataModel.create_("parking_station", required_values, function (row) {
                                dataModel.auth_("parking_station", new_parking_station.email, new_parking_station.password, function (row) {
                                    req.session.sid = row.id;
                                    req.session.lang = row.lang;
                                    console.log("parking_station added succesfully");
                                    res.redirect('/parking_station/account'); // redirect new logged in parking_station to account page or home page
                                    for (let i = 0 ; i < new_parking_station.lots ; i++) {
                                        dataModel.create_("parking_lot", [row.id]);
                                    }
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
        else {
            console.log("Fields check failed");
            res.redirect('/parking_station/sign_up');
        }
    }
    else {
        console.log("important error!");
        res.redirect('/account');
    }

};

function get_driver_sign_in_page(req, res) {
    if (req.session.sid === undefined) {
        res.render('driver/sign_in', {
            'is_driver': true,
            'login': false
        });
    }
    else {
        console.log("driver already logged in");
        res.redirect('/home');
    }
};
function get_parking_station_sign_in_page(req, res) {
    if (req.session.sid === undefined) {
        res.render('parking_station/sign_in', {
            'is_driver': false,
            'login': false
        });
    }
    else {
        console.log("parking station already logged in");
        res.redirect('/parking_station/home');
    }
};

function login_driver(req, res) {
    if (req.session.sid === undefined) {
        const driver = {
            "email": req.body.email,
            "password": req.body.password,
        };
        // check if driver credentials exist
        dataModel.auth_("driver", driver.email, driver.password, function (data) {
            if (data) { // driver found
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
        // check if parking station credentials exist
        dataModel.auth_("parking_station", parking_station.email, parking_station.password, function (data) {
            if (data) { // driver found
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

function logout_driver(req, res) {
    if (req.session.sid === undefined) {
        res.redirect('/')
    }
    else {
        req.session.destroy((err) => { console.log("driver logged out") })
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
    get_driver_sign_up_page,
    get_parking_station_sign_up_page,
    add_new_driver,
    add_new_parking_station,
    get_driver_sign_in_page,
    get_parking_station_sign_in_page,
    login_driver,
    login_parking_station,
    logout_driver,
    logout_parking_station
}