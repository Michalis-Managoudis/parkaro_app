'use strict';
// const dataModel = require('../models/sqlite_data_model.js');
const dataModel = require('../models/mysql_data_model.js');
const fs = require('fs');
const { data } = require('jquery');

// regex patterns
const mail_regex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
const password_regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
const phone_regex = /[0-9]{10}/;

function get_parking_station_home_page(req, res) {
    if (req.session.sid === undefined || req.session.is_driver) {
        console.log("To see home page you must sign in first");
        res.redirect('/parking_station/sign_in');
    }
    else {
        dataModel.get_("parking_station", req.session.sid, function (data4) { // check if id exists
            if (data4) {
                let n_dt = new Date();
                n_dt = n_dt.getTime();
                dataModel.load_parking_station_current_reservations(req.session.sid, n_dt, function (data) {
                    const dt = JSON.parse(JSON.stringify(data));
                    dataModel.read_("parking_lot", "", `parking_station_id = ${req.session.sid}`, function (data1) {
                        const dt1 = JSON.parse(JSON.stringify(data1));
                        let ids = [];
                        let cl = 0;
                        for (let ell of dt1) ids.push(ell.id);
                        for (let el of dt) {
                            el.parking_lot_id = ids.indexOf(el.parking_lot_id) + 1;
                            if (el.r_start < n_dt) cl++;
                        }
                        dataModel.get2_("parking_station", "lots", req.session.sid, function (data2) {
                            let dt2 = JSON.parse(JSON.stringify(data2));
                            let per = parseInt(100 * parseFloat(cl) / parseFloat(dt2.lots));
                            dataModel.read_("driver", "email, name, phone", `parking_station_id LIKE '%${req.session.sid}%'`, function (data5) {
                                data5 = JSON.parse(JSON.stringify(data5));
                                dataModel.read_("car", "driver_id, plate, model, color", `driver_id IN (SELECT id FROM driver WHERE parking_station_id LIKE '%${req.session.sid}%')`, function (data6) {
                                    data6 = JSON.parse(JSON.stringify(data6));
                                    dataModel.read_("notification", dataModel.schema_show.notification.join(", "), `user_id = 'p${req.session.sid}' ORDER BY date_created DESC`, function (data3) {
                                        data3 = JSON.parse(JSON.stringify(data3));
                                        let c = 0;
                                        for (let el of data3) if (!el.viewed) c++;
                                        let lcl = 0;
                                        if (req.session.local_trigger) {
                                            if (req.session.local_trigger === 1) {
                                                req.session.local_trigger = 0;
                                                lcl = 1;
                                            }
                                            else if (req.session.local_trigger === 2) {
                                                req.session.local_trigger = 0;
                                                lcl = 2;
                                            }
                                        }
                                        dataModel.get_("sensor_data", req.session.sid, function (datas) {
                                            if (datas) {
                                                let vl = datas.sensor_value;
                                                let rr = { "id": req.session.sid, "sensor_value": 0 };
                                                dataModel.update_("sensor_data", rr, function () {
                                                    res.render('parking_station/home', {
                                                        records: dt,
                                                        pl_per: per,
                                                        form_data: false,
                                                        empty_lots: false,
                                                        "is_driver": false,
                                                        "login": (req.session.sid !== undefined),
                                                        'lang': req.session.lang,
                                                        notifications: data3,
                                                        unread_notification_number: c,
                                                        drivers: data5,
                                                        cars: data6,
                                                        local: vl
                                                    });
                                                });
                                            }
                                            else {
                                                res.render('parking_station/home', {
                                                    records: dt,
                                                    pl_per: per,
                                                    form_data: false,
                                                    empty_lots: false,
                                                    "is_driver": false,
                                                    "login": (req.session.sid !== undefined),
                                                    'lang': req.session.lang,
                                                    notifications: data3,
                                                    unread_notification_number: c,
                                                    drivers: data5,
                                                    cars: data6,
                                                    local: lcl
                                                });
                                            }
                                        });
                                        
                                    });
                                });
                            });
                        });
                    });
                });
            }
        });
    }
};

function search_parking_station_reservation_availability(req, res) {
    if (req.session.sid === undefined || req.session.is_driver) {
        console.log("To see home page you must sign in first");
        res.redirect('/parking_station/sign_in');
    }
    else {
        dataModel.get_("parking_station", req.session.sid, function (data0) { // check if id exists
            if (data0) {
                let n_dt = new Date();
                n_dt = n_dt.getTime();
                dataModel.load_parking_station_current_reservations(req.session.sid, n_dt, function (data) {
                    const dt = JSON.parse(JSON.stringify(data));
                    dataModel.read_("parking_lot", "", `parking_station_id = ${req.session.sid}`, function (data1) {
                        const dt1 = JSON.parse(JSON.stringify(data1));
                        let ids = [];
                        for (let ell of dt1) ids.push(ell.id);
                        for (let el of dt) el.parking_lot_id = ids.indexOf(el.parking_lot_id) + 1;
                        let cl = 0;
                        for (let el of dt) if (el.r_start < n_dt) cl++;
                        dataModel.get2_("parking_station", "lots", req.session.sid, function (data2) { // get number of all parking lots
                            let dt2 = JSON.parse(JSON.stringify(data2));
                            let per = parseInt(100 * parseFloat(cl) / parseFloat(dt2.lots));
                            dataModel.find_free_parking_lots_of_parking_station(req.session.sid, Date.parse(req.body.r_start), Date.parse(req.body.r_end), function (data3) {
                                const dt3 = JSON.parse(JSON.stringify(data3));
                                let e_lots = [];
                                let f_dt = {};
                                let flds = ["driver", "email", "name", "phone", "car", "plate", "model", "color", "r_start", "r_end", "price"];
                                req.body.price = final_price_calculation(data0.price_list, data0.discount, req.body.r_start, req.body.r_end);
                                for (let field of flds) f_dt[field] = req.body[field];
                                if (check_work_hours(data0.work_hours, req.body.r_start, req.body.r_end)) {
                                    for (let el of dt3) {
                                        e_lots.push(ids.indexOf(el.id) + 1);
                                    }
                                }
                                dataModel.read_("driver", "email, name, phone", `parking_station_id LIKE '%${req.session.sid}%'`, function (data5) {
                                    data5 = JSON.parse(JSON.stringify(data5));
                                    let dr_id = "";
                                    if (req.body.driver === "new") dr_id = 0;
                                    else dr_id = req.body.driver;
                                    dataModel.read_("car", "driver_id, plate, model, color", `driver_id IN (SELECT id FROM driver WHERE parking_station_id LIKE '%${req.session.sid}%')`, function (data6) {
                                        data6 = JSON.parse(JSON.stringify(data6));
                                        dataModel.read_("notification", dataModel.schema_show.notification.join(", "), `user_id = 'p${req.session.sid}' ORDER BY date_created DESC`, function (data4) {
                                            data4 = JSON.parse(JSON.stringify(data4));
                                            let c = 0;
                                            for (let el of data4) if (!el.viewed) c++;
                                            res.render('parking_station/home', {
                                                records: dt,
                                                pl_per: per,
                                                empty_lots: e_lots,
                                                form_data: JSON.stringify(f_dt),
                                                "is_driver": false,
                                                "login": (req.session.sid !== undefined),
                                                'lang': req.session.lang,
                                                notifications: data4,
                                                unread_notification_number: c,
                                                drivers: data5,
                                                cars: data6,
                                                local: 0
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            }
        });
    }
};

function add_parking_station_reservation(req, res) {
    if (req.session.sid !== undefined && !req.session.is_driver) {
        if (req.body.driver === "new" || !req.body.driver) { // if new driver
            // add user
            let new_driver = {};
            for (let field of dataModel.schema_required["driver"]) {
                if (field === "password") {
                    new_driver[field] = "dummy";
                }
                else new_driver[field] = req.body[field]; // dynamically get driver keys and values
            }
            // check fields agree with patterns
            let fields_check = true;
            if (!mail_regex.test(new_driver.email)) fields_check = false;
            if (!phone_regex.test(new_driver.phone)) fields_check = false;

            // add reservation
            if (fields_check) {
                // check if driver already exists (email and phone)
                dataModel.check2_("driver", `email = "${new_driver.email}"`, function (data) {  // check if email exists
                    if (!data) { // if email not found in database
                        dataModel.check2_("driver", `phone = "${new_driver.phone}"`, function (data2) { // check if phone exists
                            if (!data2) { // phone not found in database
                                // insert new_driver to database
                                const required_values = Object.values(new_driver); // put required values in an array

                                dataModel.create_("driver", required_values, function () {
                                    dataModel.check2_("driver", `email = "${new_driver.email}"`, function (data3) {
                                        dataModel.update_ps_driver(data3.id, req.session.sid, function () {
                                            console.log("New driver added succesfully");
                                            let car = {};
                                            for (let field of dataModel.schema_required["car"]) { // dynamically get car keys and values
                                                if (field === "driver_id") car[field] = data3.id;
                                                else car[field] = req.body[field];
                                            }
                                            dataModel.check2_("car", `plate = "${car.plate}"`, function (data4) {
                                                if (!data4) {
                                                    // add car
                                                    const vls = Object.values(car);
                                                    dataModel.create_("car", vls, function () {
                                                        dataModel.check2_("car", `plate = "${car.plate}"`, function (data5) {
                                                            console.log("New car added succesfully");
                                                            dataModel.read_("parking_lot", "", `parking_station_id = ${req.session.sid}`, function (data1) {
                                                                const dt1 = JSON.parse(JSON.stringify(data1));
                                                                let ids = [];
                                                                for (let ell of dt1) ids.push(ell.id);
                                                                let resv = {};
                                                                for (let field of dataModel.schema_required["reservation"]) { // dynamically get car keys and values
                                                                    if (field === "car_id") resv[field] = data5.id;
                                                                    else if (field === "r_start") resv[field] = Date.parse(req.body.r_start);
                                                                    else if (field === "r_end") resv[field] = Date.parse(req.body.r_end);
                                                                    else if (field === "parking_lot_id") resv[field] = ids[(req.body[field] - 1)];
                                                                    else resv[field] = req.body[field];
                                                                }
                                                                const req_values = Object.values(resv);
                                                                dataModel.create_("reservation", req_values, function () {
                                                                    dataModel.update_points(data3.id, parseInt(resv.price / 10), function () {
                                                                        console.log("Reservation booked");
                                                                        res.redirect('/parking_station/home'); //res.redirect("back");
                                                                    });
                                                                });
                                                            });
                                                        });
                                                    });
                                                }
                                                else {
                                                    console.log("Car is already in database");
                                                    res.redirect('/parking_station/home'); //res.redirect("back");
                                                }
                                            });
                                        });
                                    });

                                });
                            }
                            else { // phone found in database
                                console.log("Phone already exist");
                                res.redirect('/parking_station/home'); //res.redirect("back");
                            }
                        });
                    }
                    else {
                        dataModel.check2_("driver", `phone = "${new_driver.phone}"`, function (datap) { // check if phone exists
                            if (datap) { // email and phone exists
                                dataModel.check2_("driver", `email = "${new_driver.email}" AND parking_station_id != 'null'`, function (datadr) { // check if driver (new_driver.email) has parking_station_id 
                                    if (datadr) { // if yes then add this parking_station_id
                                        dataModel.get2_("driver", "parking_station_id", datadr.id, function (datadr2) { // read driver's parking_station_id
                                            datadr2 = JSON.parse(JSON.stringify(datadr2));
                                            // update its value (check if already include this parking station id)
                                            let ps_ids = datadr2.parking_station_id.split(",");
                                            if (!ps_ids.includes(`'${req.session.sid}'`)) datadr2.parking_station_id += `,${req.session.sid}`;
                                            dataModel.update_ps_driver(datadr.id, datadr2.parking_station_id, function () {
                                                // add new reservation
                                                dataModel.check2_("car", `plate = "${req.body.plate}"`, function (datacr) {
                                                    dataModel.read_("parking_lot", "", `parking_station_id = ${req.session.sid}`, function (data1) {
                                                        const dt1 = JSON.parse(JSON.stringify(data1));
                                                        let ids = [];
                                                        for (let ell of dt1) ids.push(ell.id);
                                                        let resv = {};
                                                        for (let field of dataModel.schema_required["reservation"]) { // dynamically get car keys and values
                                                            if (field === "car_id") resv[field] = datacr.id;
                                                            else if (field === "r_start") resv[field] = Date.parse(req.body.r_start);
                                                            else if (field === "r_end") resv[field] = Date.parse(req.body.r_end);
                                                            else if (field === "parking_lot_id") resv[field] = ids[(req.body[field] - 1)];
                                                            else resv[field] = req.body[field];
                                                        }
                                                        const req_values = Object.values(resv);
                                                        dataModel.create_("reservation", req_values, function () {
                                                            dataModel.update_points(data.id, parseInt(resv.price / 10), function () {
                                                                console.log("Reservation booked");
                                                                res.redirect('/parking_station/home'); //res.redirect("back");
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    }
                                    else { // if no abort mission
                                        console.log("Driver is an online driver, can't make a reservation");
                                        res.redirect('/parking_station/home'); //res.redirect("back");
                                    }
                                });
                            }
                            else {
                                console.log("Email already exist");
                                res.redirect('/parking_station/home'); //res.redirect("back");
                            }
                        });
                    }
                });
            }
            else {
                console.log("Fields check failed");
                res.redirect('/parking_station/home'); //res.redirect("back");
            }
        }
        else { // if parking station driver
            if (req.body.car === "new") { // if parking station driver and new car
                let car = {};
                for (let field of dataModel.schema_required["car"]) { // dynamically get car keys and values
                    if (field === "driver_id") car[field] = req.body.driver;
                    else car[field] = req.body[field];
                }
                dataModel.check2_("car", `plate = "${car.plate}"`, function (data4) {
                    if (!data4) {
                        // add car
                        const vls = Object.values(car);
                        dataModel.create_("car", vls, function () {
                            dataModel.check2_("car", `plate = "${car.plate}"`, function (data5) {
                                console.log("New car added succesfully");
                                dataModel.read_("parking_lot", "", `parking_station_id = ${req.session.sid}`, function (data1) {
                                    const dt1 = JSON.parse(JSON.stringify(data1));
                                    let ids = [];
                                    for (let ell of dt1) ids.push(ell.id);
                                    let resv = {};
                                    for (let field of dataModel.schema_required["reservation"]) { // dynamically get car keys and values
                                        if (field === "car_id") resv[field] = data5.id;
                                        else if (field === "r_start") resv[field] = Date.parse(req.body.r_start);
                                        else if (field === "r_end") resv[field] = Date.parse(req.body.r_end);
                                        else if (field === "parking_lot_id") resv[field] = ids[(req.body[field] - 1)];
                                        else resv[field] = req.body[field];
                                    }
                                    const req_values = Object.values(resv);
                                    dataModel.create_("reservation", req_values, function () {
                                        dataModel.update_points(req.body.driver, parseInt(resv.price / 10), function () {
                                            console.log("Reservation booked");
                                            res.redirect('/parking_station/home'); //res.redirect("back");
                                        });
                                    });
                                });
                            });
                        });
                    }
                    else {
                        console.log("Car is already in database");
                        res.redirect('/parking_station/home'); //res.redirect("back");
                    }
                });
            }
            else { // if parking station driver and car
                dataModel.read_("parking_lot", "", `parking_station_id = ${req.session.sid}`, function (data1) {
                    const dt1 = JSON.parse(JSON.stringify(data1));
                    let ids = [];
                    for (let ell of dt1) ids.push(ell.id);
                    let resv = {};
                    for (let field of dataModel.schema_required["reservation"]) { // dynamically get car keys and values
                        if (field === "car_id") resv[field] = req.body.car;
                        else if (field === "r_start") resv[field] = Date.parse(req.body.r_start);
                        else if (field === "r_end") resv[field] = Date.parse(req.body.r_end);
                        else if (field === "parking_lot_id") resv[field] = ids[(req.body[field] - 1)];
                        else resv[field] = req.body[field];
                    }
                    const req_values = Object.values(resv);
                    dataModel.create_("reservation", req_values, function () {
                        dataModel.update_points(req.body.driver, parseInt(resv.price / 10), function () {
                            console.log("Reservation booked");
                            res.redirect('/parking_station/home'); //res.redirect("back");
                        });
                    });
                });
            }
        }
    }
    else {
        console.log("important error!");
        res.redirect('/parking_station/sign_in');
    }
};

function get_parking_station_my_parking_page(req, res) {
    if (req.session.sid === undefined || req.session.is_driver) {
        console.log("To see my_parking page you must sign in first");
        res.redirect('/parking_station/sign_in');
    }
    else {
        dataModel.get_("parking_station", req.session.sid, function (data_) { // check if id exists
            if (data_) {
                dataModel.load_parking_station_reservations(req.session.sid, function (data0) {
                    const dt0 = JSON.parse(JSON.stringify(data0));
                    dataModel.read_("parking_lot", "", `parking_station_id = ${req.session.sid}`, function (data1) {
                        const dt1 = JSON.parse(JSON.stringify(data1));
                        let ids = [];
                        for (let ell of dt1) ids.push(ell.id);
                        for (let el of dt0) el.parking_lot_id = ids.indexOf(el.parking_lot_id) + 1;
                        let today = new Date();
                        let tday = new Date();
                        let tod = tday.toLocaleDateString().split("/"); //! not right format
                        if (tod[0] < 10) { tod[0] = '0' + tod[0]; }
                        if (tod[1] < 10) { tod[1] = '0' + tod[1]; }
                        let tod2 = tod[2] + "-" + tod[1] + "-" + tod[0];
                        let dt_st = Date.parse(tod2 + "T00:00:00");
                        let dt_en = Date.parse(today);
                        dataModel.calculate_income(req.session.sid, dt_st, dt_en, function (data2) { // today income
                            const dt2 = JSON.parse(JSON.stringify(data2));
                            tday.setDate(tday.getMonth() - 1);
                            let tod3 = tday.toLocaleDateString().split("/"); //! not right format
                            if (tod3[0] < 10) { tod3[0] = '0' + tod3[0]; }
                            if (tod3[1] < 10) { tod3[1] = '0' + tod3[1]; }
                            let tod4 = tod3[2] + "-" + tod3[1] + "-" + tod3[0];
                            let dt_st = Date.parse(tod4 + "T00:00:00");
                            let dt_en = Date.parse(today);
                            dataModel.calculate_income(req.session.sid, dt_st, dt_en, function (data3) { // monthly income
                                const dt3 = JSON.parse(JSON.stringify(data3));
                                let incom = { "today": dt2[0].price, "monthly": dt3[0].price };
                                incom = JSON.stringify(incom);
                                dataModel.read_("review", "stars, description", `parking_station_id = ${req.session.sid}`, function (data4) {
                                    const dt_2 = JSON.parse(JSON.stringify(data4));
                                    let rvs = {};
                                    let sum = 0;
                                    let count = 0;
                                    for (let el2 of dt_2) {
                                        rvs[el2.id.toString()] = { "stars": el2.stars, "description": el2.description };
                                        sum = sum + el2.stars;
                                        count++;
                                    }
                                    const rat = (sum / count).toFixed(1);
                                    rvs = JSON.stringify(rvs);
                                    dataModel.read_("notification", dataModel.schema_show.notification.join(", "), `user_id = 'p${req.session.sid}' ORDER BY date_created DESC`, function (data) {
                                        data = JSON.parse(JSON.stringify(data));
                                        let c = 0;
                                        for (let el of data) if (!el.viewed) c++;
                                        res.render('parking_station/my_parking', {
                                            records: dt0,
                                            income: incom,
                                            rating: rat,
                                            reviews: rvs,
                                            "is_driver": false,
                                            "login": (req.session.sid !== undefined),
                                            'lang': req.session.lang,
                                            notifications: data,
                                            unread_notification_number: c
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            }
        });
    }
};

function delete_parking_station_reservation(req, res) {
    if (req.session.sid === undefined || req.session.is_driver) {
        console.log("To delete a reservation you must sign in first");
        res.redirect('/parking_station/sign_in');
    }
    else {
        dataModel.get_("reservation", req.body._id, function (data) { // check if reservation exists
            if (data) {
                let today = new Date();
                //data = JSON.parse(JSON.stringify(data));
                dataModel.read_driver_from_reservation(req.body._id, function (data3) {
                    dataModel.delete_("reservation", req.body._id, function () {
                        dataModel.check2_("driver", `email = "${req.body.d_email}"`, function (data2) {
                            const dt = JSON.parse(JSON.stringify(data2));
                            dataModel.update_points(dt.id, -parseInt(req.body._price / 10), function () {
                                dataModel.add_notification(`"d${data3}"`, Date.parse(today), `"Reservation (${req.body._id}) deleted from parking_station"`, function () {
                                    console.log("Reservation deleted succesfully");
                                    res.redirect('back');
                                });
                            });
                        });
                    });
                });
            }
        });
    }
};

function update_parking_station_reservation(req, res) {
    if (req.session.sid === undefined || req.session.is_driver) {
        console.log("To update a reservation you must sign in first");
        res.redirect('/parking_station/sign_in');
    }
    else {
        dataModel.get_("reservation", req.body._id, function (data) { // check if reservation exists
            if (data) {
                let today = new Date();
                const dt = JSON.parse(JSON.stringify(data));
                const prc = parseInt((req.body.price - dt.price) / 10);
                let rr = { "id": req.body._id, "price": req.body.price };
                dataModel.update_("reservation", rr, function () {
                    dataModel.check2_("driver", `email = "${req.body.d_email}"`, function (data2) {
                        const dt2 = JSON.parse(JSON.stringify(data2));
                        dataModel.update_points(dt2.id, prc, function () {
                            dataModel.read_driver_from_reservation(req.body._id, function (data3) {
                                dataModel.add_notification(`"d${data3}"`, Date.parse(today), `"Reservation (${req.body._id}) price updated from parking_station"`, function () {
                                    console.log("Reservation updated succesfully");
                                    res.redirect('back');
                                });
                            });
                        });
                    });
                });
            }
            else {
                console.log("Reservation not found");
                res.redirect('/parking_station/my_parking');
            }
        });
    }
};

function get_parking_station_info_page(req, res) {
    dataModel.read_("notification", dataModel.schema_show.notification.join(", "), `user_id = 'p${req.session.sid}' ORDER BY date_created DESC`, function (data) {
        data = JSON.parse(JSON.stringify(data));
        let c = 0;
        for (let el of data) if (!el.viewed) c++;
        res.render('parking_station/info', {
            "is_driver": false,
            "login": (req.session.sid !== undefined),
            'lang': req.session.lang,
            notifications: data,
            unread_notification_number: c
        });
    });
};

function read_parking_station_notifications(req, res) {
    if (req.session.sid === undefined || req.session.is_driver) {
        console.log("To read notifications you must sign in first");
        res.redirect('/parking_station/sign_in');
    }
    else {
        dataModel.read_all_user_notifications(`p${req.session.sid}`, function (data) {
            res.redirect('back');
        });
    }
};

function delete_parking_station_image(req, res) {
    fs.unlink("user_images/p" + req.session.sid + ".jpeg", (err) => {
        if (err) {
            throw err;
        }
        console.log("Delete Image successfully.");
        res.redirect('back');
    });
};

function change_reservation_state(req, res) {
    if (req.session.sid === undefined || req.session.is_driver) {
        console.log("To change state of a reservation you must sign in first");
        res.redirect('/parking_station/sign_in');
    }
    else {
        let n_dt = new Date();
        let n_dt2 = n_dt.getTime();
        dataModel.update_state(req.body._id, req.body.state, n_dt2, function () { //update state via datamodel
            if (req.body.state == 2) {
                dataModel.get2_("reservation", "r_start", req.body._id, function (data) {
                    data = JSON.parse(JSON.stringify(data));
                    dataModel.get2_("parking_station", "price_list, discount", req.session.sid, function (data2) {
                        data2 = JSON.parse(JSON.stringify(data2));
                        let f_price = final_price_calculation(data2.price_list, data2.discount, new Date(data.r_start), n_dt);
                        let rr = { "id": req.body._id, "price": f_price };
                        dataModel.update_("reservation", rr, function () {
                            dataModel.read_driver_from_reservation(req.body._id, function (data3) {
                                dataModel.add_notification(`"d${data3}"`, n_dt2, `"Reservation (${req.body._id}) confirmed exit from parking_station"`, function () {
                                    res.redirect('back');
                                    //alert(`Customer pays ${f_price} €`);
                                });
                            });
                        });
                    });
                });
            }
            else {
                dataModel.read_driver_from_reservation(req.body._id, function (data3) {
                    dataModel.add_notification(`"d${data3}"`, n_dt2, `"Reservation (${req.body._id}) confirmed entered in parking_station"`, function () {res.redirect('back');});
                });
            }
        });
    }
};

function final_price_calculation(price_list, disc, dt1, dt2) {
    let h = price_list.split("d")[0].slice(1).split(",");
    let d = price_list.split("d")[1].split("m")[0].split(",");
    let m = price_list.split("m")[1].split(",");
    for (let i = 0; i < 4; i++) {
        h[i] = parseFloat(h[i]);
        d[i] = parseFloat(d[i]);
        m[i] = parseFloat(m[i]);
    }
    let dif = Date.parse(dt2) - Date.parse(dt1);
    let price = 0;
    dif = dif / 3600000;
    if (dif < 24) { // hours
        dif = Math.ceil(dif);
        if (dif <= 3) price = h[dif - 1];
        else price = h[2] + (dif - 3) * h[3];
    }
    else if (dif < 24 * 30) { // days
        dif = Math.ceil(dif / 24);
        if (dif <= 3) price = d[dif - 1];
        else price = d[2] + (dif - 3) * d[3];
    } else { // months
        dif = Math.ceil(dif / 24 * 30);
        if (dif <= 3) price = m[dif - 1];
        else price = m[2] + (dif - 3) * m[3];
    }
    price = price * (100 - parseInt(disc)) / 100;
    //price = price.toFixed(2);
    return price;
}

function check_work_hours(work_hours, dt1, dt2) {
    if (work_hours === "24/7") return true;
    else {
        const hrs = work_hours.split(",");
        dt1 = new Date(dt1);
        dt2 = new Date(dt2);
        let d1 = new Date(dt1).toLocaleTimeString();
        let d2 = new Date(dt2).toLocaleTimeString();
        d1 = convert_12h_to_24h(d1);
        d2 = convert_12h_to_24h(d2);

        if (d1 > hrs[dt1.getDay()].split("-")[0] && d1 < hrs[dt1.getDay()].split("-")[1]) { // if start date between parking station work hours of that day
            if (d2 > hrs[dt2.getDay()].split("-")[0] && d2 < hrs[dt2.getDay()].split("-")[1]) { // if end date between parking station work hours of that day
                return true;
            }
        }
        return false;
    }

};
function convert_12h_to_24h(time12h) {
    const [time, modifier] = time12h.split(" ");
    let [hours, minutes] = time.split(":");
    if (hours === "12") hours = "00";
    if (modifier === "PM" || modifier === "μ.μ.") hours = parseInt(hours) + 12;
    if (hours < 10) { hours = '0' + hours; }
    if (minutes < 10) { minutes = '0' + parseInt(minutes); }
    return `${hours}:${minutes}`;
};

function get_local_parking_station_data(req, res) {
    const p_id = 3;
    const entered_ = 1;
    req.session.local_trigger = 0;
    if (entered_) {
        req.session.local_trigger = 1;
        res.redirect('/parking_station/home');
    }
    else {
        req.session.local_trigger = 2;
        res.redirect('/parking_station/home');
    }
};

function post_local_parking_station_data(req, res) {
    const p_id = req.body._id;
    const entered_ = req.body.sensor_value;
    if (entered_) {
        dataModel.check2_("sensor_data", `id = ${p_id}`, function (data) {
            if (data) {
                let rr = { "id": p_id, "sensor_value": entered_ };
                dataModel.update_("sensor_data", rr, function () {
                    res.status(200).send("ok");
                });
            }
            else {
                let vls = { "id": p_id, "sensor_value": entered_ };
                dataModel.create_("sensor_data", vls, function () {
                    res.status(200).send("ok");
                });
            }
        });
    }
    else {
        
    }
};

module.exports = {
    get_parking_station_home_page,
    search_parking_station_reservation_availability,
    get_parking_station_my_parking_page,
    get_parking_station_info_page,
    delete_parking_station_reservation,
    update_parking_station_reservation,
    add_parking_station_reservation,
    read_parking_station_notifications,
    delete_parking_station_image,
    change_reservation_state,
    get_local_parking_station_data,
    post_local_parking_station_data
}