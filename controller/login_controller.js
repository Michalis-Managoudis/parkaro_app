'use strict';
//const dataModel = require('../models/sqlite_data_model.js');
const dataModel = require('../models/mysql_data_model.js');

const path = require('path');
const fs = require('fs');

// regex patterns
const mail_regex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
const password_regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/;
const phone_regex = /[0-9]{10}/;
const tin_regex = /[0-9]+/;

// const safe = require('safe-regex');
// console.log(safe(tin_regex));

function get_driver_sign_up_page(req, res) {
    if (req.session.sid === undefined || !req.session.is_driver) {
        let err_msg = false;
        if (req.session.err_msg) {
            err_msg = JSON.stringify(req.session.err_msg);
            req.session.err_msg = "";
        }
        let conf_msg = false;
        if (req.session.conf_msg) {
            conf_msg = JSON.stringify(req.session.conf_msg);
            req.session.conf_msg = "";
        }
        res.render('driver/sign_up', {
            'is_driver': true,
            'login': false,
            'lang': req.session.lang,
            error_msg: err_msg,
            confirm_msg: conf_msg,
        });
    }
    else {
        console.log("driver already logged in");
        req.session.err_msg = "driver already logged in";
        res.redirect('/home');
    }
};
function get_parking_station_sign_up_page(req, res) {
    if (req.session.sid === undefined || req.session.is_driver) {
        let err_msg = false;
        if (req.session.err_msg) {
            err_msg = JSON.stringify(req.session.err_msg);
            req.session.err_msg = "";
        }
        let conf_msg = false;
        if (req.session.conf_msg) {
            conf_msg = JSON.stringify(req.session.conf_msg);
            req.session.conf_msg = "";
        }
        res.render('parking_station/sign_up', {
            'is_driver': false,
            'login': false,
            'lang': req.session.lang,
            error_msg: err_msg,
            confirm_msg: conf_msg,
        });
    }
    else {
        console.log("parking station already logged in");
        req.session.err_msg = "parking station already logged in";
        res.redirect('/parking_station/home');
    }
};

function add_new_driver(req, res) {
    if (req.session.sid === undefined || !req.session.is_driver) {
        let new_driver = {};
        for (let field of dataModel.schema_required["driver"]) new_driver[field] = req.body[field]; // dynamically get driver keys and values
        // check fields agree with patterns
        let fields_check = true;
        if (!mail_regex.test(new_driver.email)) fields_check = false;
        if (!password_regex.test(new_driver.password)) fields_check = false;
        if (!phone_regex.test(new_driver.phone)) fields_check = false;
        if (!(new_driver.password === req.body.password2)) fields_check = false;
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
                                    req.session.is_driver = true;
                                    console.log("driver added succesfully");
                                    req.session.conf_msg = "driver added succesfully";
                                    res.redirect('/account'); // redirect new logged in driver to account page or home page
                                })
                                const user_ = {"email": new_driver.email, "name": new_driver.name};
                                email_sender(user_);
                            });
                        }
                        else { // phone found in database
                            console.log("Phone already exist");
                            req.session.err_msg = "Phone already exist";
                            res.redirect('/sign_up'); // redirect to sign in page
                            //? alert("\n\n Το email χρήστη που βάλατε υπάρχει ήδη δοκιμάστε να συνδεθείτε με αυτό το email \n\n ");
                        }
                    });
                }
                else {
                    console.log("Email already exist");
                    req.session.err_msg = "Email already exist";
                    res.redirect('/sign_in');
                    //? alert("\n\n Το email χρήστη που βάλατε υπάρχει ήδη δοκιμάστε να συνδεθείτε με αυτό το email \n\n ");
                }
            });
        }
        else {
            console.log("Fields check failed");
            req.session.err_msg = "Fields check failed";
            res.redirect('/sign_up');
        }
    }
    else {
        console.log("important error!");
        res.redirect('/account');
    }
};
function add_new_parking_station(req, res) {
    if (req.session.sid === undefined || req.session.is_driver) {
        let new_parking_station = {};
        for (let field of dataModel.schema_required["parking_station"]) {
            if (field == "work_hours") {
                new_parking_station.work_hours = "";
                if (req.body["work_hours_0"]) new_parking_station.work_hours = "24/7";
                else {
                    for (let i = 1; i <= 7; i++) {
                        new_parking_station.work_hours = new_parking_station.work_hours + req.body["work_hours" + i] + "-" + req.body["work_hours" + i + "b"];
                        if (i !== 7) new_parking_station.work_hours = new_parking_station.work_hours + ",";
                    }
                }
            }
            else if (field == "price_list") {
                const prl = ["hour", "day", "month"];
                new_parking_station.price_list = "/";
                for (let pr_md of prl) {
                    if (req.body[pr_md + "_md"]) {
                        new_parking_station.price_list = new_parking_station.price_list + pr_md.charAt(0);
                        new_parking_station.price_list = new_parking_station.price_list + req.body["price_list_" + pr_md.charAt(0) + "1"] + "," + req.body["price_list_" + pr_md.charAt(0) + "2"] + "/";
                    }
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
        if (!(new_parking_station.parking_type === 0 || new_parking_station.parking_type === 1 || new_parking_station.parking_type === 2)) fields_check = false;
        if (!(new_parking_station.lots >= 0)) fields_check = false;
        if (!(new_parking_station.s_height > 0)) fields_check = false;
        if (!(new_parking_station.s_length > 0)) fields_check = false;
        if (!(new_parking_station.password === req.body.password2)) fields_check = false;
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
                            dataModel.read_("parking_station", "company_name", `company_name = "${new_parking_station.company_name}"`, function (data) {
                                if (Object.keys(data).length === 0) { // if tin company name found in database
                                    // insert new_parking_station to database
                                    const required_values = Object.values(new_parking_station); // put required values in an array
                                    dataModel.create_("parking_station", required_values, function (row) {
                                        dataModel.auth_("parking_station", new_parking_station.email, new_parking_station.password, function (row) {
                                            req.session.sid = row.id;
                                            req.session.lang = row.lang;
                                            req.session.is_driver = false;
                                            console.log("parking_station added succesfully");
                                            req.session.conf_msg = "parking_station added succesfully";
                                            res.redirect('/parking_station/account'); // redirect new logged in parking_station to account page or home page
                                            for (let i = 0; i < new_parking_station.lots; i++) {
                                                dataModel.create_("parking_lot", [row.id]);
                                            }
                                            const user_ = {"email": new_parking_station.email, "name": new_parking_station.company_name};
                                            email_sender(user_);
                                        })
                                    });
                                }
                                else {
                                    console.log("Company name already exist");
                                    req.session.err_msg = "Company name already exist";
                                    res.redirect('/parking_station/sign_up');
                                }
                            });
                        }
                        else {
                            console.log("TIN already exist");
                            req.session.err_msg = "TIN already exist";
                            res.redirect('/parking_station/sign_up');
                        }
                    });
                }
                else {
                    console.log("Email already exist");
                    req.session.err_msg = "Email already exist";
                    res.redirect('/parking_station/sign_in');
                }
            });
        }
        else {
            console.log("Fields check failed");
            req.session.err_msg = "Fields check failed";
            res.redirect('/parking_station/sign_up');
        }
    }
    else {
        console.log("important error!");
        res.redirect('/account');
    }

};

function get_driver_sign_in_page(req, res) {
    if (req.session.sid === undefined || !req.session.is_driver) {
        let err_msg = false;
        if (req.session.err_msg) {
            err_msg = JSON.stringify(req.session.err_msg);
            req.session.err_msg = "";
        }
        let conf_msg = false;
        if (req.session.conf_msg) {
            conf_msg = JSON.stringify(req.session.conf_msg);
            req.session.conf_msg = "";
        }
        res.render('driver/sign_in', {
            'is_driver': true,
            'login': false,
            'lang': req.session.lang,
            error_msg: err_msg,
            confirm_msg: conf_msg,
        });
    }
    else {
        console.log("driver already logged in");
        req.session.err_msg = "driver already logged in";
        res.redirect('/home');
    }
};
function get_parking_station_sign_in_page(req, res) {
    if (req.session.sid === undefined || req.session.is_driver) {
        let err_msg = false;
        if (req.session.err_msg) {
            err_msg = JSON.stringify(req.session.err_msg);
            req.session.err_msg = "";
        }
        let conf_msg = false;
        if (req.session.conf_msg) {
            conf_msg = JSON.stringify(req.session.conf_msg);
            req.session.conf_msg = "";
        }
        res.render('parking_station/sign_in', {
            'is_driver': false,
            'login': false,
            'lang': req.session.lang,
            error_msg: err_msg,
            confirm_msg: conf_msg,
        });
    }
    else {
        console.log("parking station already logged in");
        req.session.err_msg = "parking station already logged in";
        res.redirect('/parking_station/home');
    }
};

function login_driver(req, res) {
    if (req.session.sid === undefined || !req.session.is_driver) {
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
                req.session.is_driver = true;
                //! req.session.lang = 0;
                console.log("succesfully logged in");
                req.session.conf_msg = "succesfully logged in";
                res.redirect('/home'); // redirect to home page
            }
            else {
                console.log("Wrong email or password");
                req.session.err_msg = "Wrong email or password";
                res.redirect('/sign_in'); // redirect to try again
            }
        })
    }
    else {
        console.log("important error!");
        res.redirect('/home');
    }

};
function login_parking_station(req, res) {
    if (req.session.sid === undefined || req.session.is_driver) {
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
                req.session.is_driver = false;
                //! req.session.lang = 0;
                console.log("succesfully logged in");
                req.session.conf_msg = "succesfully logged in";
                res.redirect('/parking_station/home'); // redirect to home page
            }
            else {
                console.log("Wrong email or password");
                req.session.err_msg = "Wrong email or password";
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
    if (req.session.sid === undefined || !req.session.is_driver) {
        res.redirect('/')
    }
    else {
        req.session.destroy((err) => { console.log("driver logged out") })
        res.redirect('/sign_in')
    }
};
function logout_parking_station(req, res) {
    if (req.session.sid === undefined || req.session.is_driver) {
        res.redirect('/parking_station')
    }
    else {
        req.session.destroy((err) => { console.log("parking_station session destroyed") })
        res.redirect('/parking_station/sign_in')
    }
};

function email_sender(data_) {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'parkaro.app.help@gmail.com',
        pass: 'fdgfgbdwejpmjlxk'
    }
    });
    const mailOptions = {
    from: 'parkaro.app.help@gmail.com',
    to: data_.email,
    subject: 'Welcome to Parkaro!',
    html: `<h3>Hi ${data_.name}, <br> Welcome to Parkaro</h3><p>Parkaro is a web application for online parking.<br>You can <a style="text-decoration: underline;" href="http://127.0.0.1:3000/home">book now</a> a parking lot in a parking station of your desire.</p><img style="height: 100px;" src="cid:logo">`,
    // text: 'Hi ___ \n Welcome to Parkaro ',
    attachments: [{
        filename: 'logo2.png',
        path: path.join(__dirname, '..', '/public/images/logo2.png'),
        cid: 'logo'
    }]
    };

    transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
    });
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