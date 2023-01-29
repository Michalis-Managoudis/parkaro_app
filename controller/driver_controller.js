'use strict';
const { data } = require('jquery');
// const dataModel = require('../models/sqlite_data_model.js');
const dataModel = require('../models/mysql_data_model.js');

function get_driver_home_page(req, res) {
    if (req.session.sid === undefined || !req.session.is_driver) {
        dataModel.read2_("parking_type = 0", function (data2) {
            data2 = JSON.parse(JSON.stringify(data2));
            for (let row of data2) {
                row.location = row.location.split("/").map(parseFloat);
                //get price for each parking
                let prc = 0;
                if (req.session._dts) {
                    if (row.id != 1 && row.id != 2) prc = final_price_calculation(row.price_list, row.discount, req.session._dts.start, req.session._dts.end);
                }
                row.price = prc;
                row.rating = parseFloat(row.rating).toFixed(1);
            }
            res.render('driver/home', {
                "is_driver": true,
                "login": (req.session.sid !== undefined),
                'lang': req.session.lang,
                dates: req.session._dts,
                parking_station_locations: JSON.stringify(data2)
            });
        });
    }
    else {
        dataModel.read2_("parking_type = 0", function (data2) {
            data2 = JSON.parse(JSON.stringify(data2));
            for (let row of data2) {
                row.location = row.location.split("/").map(parseFloat);
                //get price for each parking
                let prc = 0;
                if (req.session._dts) {
                    if (row.id != 1 && row.id != 2) prc = final_price_calculation(row.price_list, row.discount, req.session._dts.start, req.session._dts.end);
                }
                row.price = prc;
                row.rating = parseFloat(row.rating).toFixed(1);
            }
            dataModel.read_("notification", dataModel.schema_show.notification.join(", "), `user_id = 'd${req.session.sid}' ORDER BY date_created DESC`, function (data) {
                data = JSON.parse(JSON.stringify(data));
                let c = 0;
                for (let el of data) if (!el.viewed) c++;
                dataModel.get2_("driver", "points", req.session.sid, function (datap) {
                    res.render('driver/home', {
                        "is_driver": true,
                        "login": (req.session.sid !== undefined),
                        'lang': req.session.lang,
                        dates: req.session._dts,
                        parking_station_locations: JSON.stringify(data2),
                        notifications: data,
                        unread_notification_number: c,
                        points: JSON.stringify(datap.points)
                    });
                });
            });
        });
    }
};
function get_driver_city_page(req, res) {
    dataModel.read_("parking_station", "location", "parking_type = 0", function (rows) {
        rows.map(function (row) { row.location = row.location.split("/").map(parseFloat); });
        dataModel.read_("notification", dataModel.schema_show.notification.join(", "), `user_id = 'd${req.session.sid}' ORDER BY date_created DESC`, function (data) {
            data = JSON.parse(JSON.stringify(data));
            let c = 0;
            for (let el of data) if (!el.viewed) c++;
            dataModel.get2_("driver", "points", req.session.sid, function (datap) {
                res.render('driver/city', {
                    "is_driver": true,
                    "login": (req.session.sid !== undefined),
                    'lang': req.session.lang,
                    parking_station_locations: JSON.stringify(rows),
                    notifications: data,
                    unread_notification_number: c,
                    points: JSON.stringify(datap.points)
                });
            });
        });
    });

};
function get_driver_airport_page(req, res) {
    dataModel.read_("parking_station", "location", "parking_type = 1", function (rows) {
        rows.map(function (row) { row.location = row.location.split("/").map(parseFloat); });
        dataModel.read_("notification", dataModel.schema_show.notification.join(", "), `user_id = 'd${req.session.sid}' ORDER BY date_created DESC`, function (data) {
            data = JSON.parse(JSON.stringify(data));
            let c = 0;
            for (let el of data) if (!el.viewed) c++;
            dataModel.get2_("driver", "points", req.session.sid, function (datap) {
                res.render('driver/airport', {
                    "is_driver": true,
                    "login": (req.session.sid !== undefined),
                    'lang': req.session.lang,
                    parking_station_locations: JSON.stringify(rows),
                    notifications: data,
                    unread_notification_number: c,
                    points: JSON.stringify(datap.points)
                });
            });
        });
    });
};
function get_driver_port_page(req, res) {
    dataModel.read_("parking_station", "location", "parking_type = 2", function (rows) {
        rows.map(function (row) { row.location = row.location.split("/").map(parseFloat); });
        dataModel.read_("notification", dataModel.schema_show.notification.join(", "), `user_id = 'd${req.session.sid}' ORDER BY date_created DESC`, function (data) {
            data = JSON.parse(JSON.stringify(data));
            let c = 0;
            for (let el of data) if (!el.viewed) c++;
            dataModel.get2_("driver", "points", req.session.sid, function (datap) {
                res.render('driver/port', {
                    "is_driver": true,
                    "login": (req.session.sid !== undefined),
                    'lang': req.session.lang,
                    parking_station_locations: JSON.stringify(rows),
                    notifications: data,
                    unread_notification_number: c,
                    points: JSON.stringify(datap.points)
                });
            });
        });
    });
};

function search_driver_home_page(req, res) {
    if (req.session.sid === undefined || !req.session.is_driver) {
        console.log("To search for parking you must sign in first");
        res.redirect('/sign_in');
    }
    else {
        req.session._dts = { "start": req.body.s_dttm, "end": req.body.e_dttm };
        req.session._ready_to_add_reservation = true;
        let cond = `parking_type = 0 AND id IN (SELECT DISTINCT parking_station_id FROM parking_lot WHERE id NOT IN (SELECT parking_lot_id FROM reservation WHERE (${Date.parse(req.session._dts.start)} < r_end AND ${Date.parse(req.session._dts.end)} > r_start)))`;
        dataModel.read2_(cond, function (data) {
            data = JSON.parse(JSON.stringify(data));
            let valid_rows = [];
            for (let row of data) {
                row.location = row.location.split("/").map(parseFloat);
                let prc = 0;
                if (req.session._dts) {
                    if (row.id != 1 && row.id != 2) prc = final_price_calculation(row.price_list, row.discount, req.session._dts.start, req.session._dts.end);
                }
                row.price = prc;
                row.rating = parseFloat(row.rating).toFixed(1);

                if (check_work_hours(row.work_hours, req.session._dts.start, req.session._dts.end)) {
                    valid_rows.push(row);
                }
            }
            dataModel.read_("notification", dataModel.schema_show.notification.join(", "), `user_id = 'd${req.session.sid}' ORDER BY date_created DESC`, function (datan) {
                datan = JSON.parse(JSON.stringify(datan));
                let c = 0;
                for (let el of datan) if (!el.viewed) c++;
                dataModel.get2_("driver", "points", req.session.sid, function (datap) {
                    res.render('driver/home', {
                        "is_driver": true,
                        "login": (req.session.sid !== undefined),
                        'lang': req.session.lang,
                        dates: req.session._dts,
                        parking_station_locations: JSON.stringify(valid_rows),
                        notifications: datan,
                        unread_notification_number: c,
                        points: JSON.stringify(datap.points)
                    });
                });
            });
        });
    }

};
function search_driver_airport_page(req, res) {
    req.session._dts = { "start": req.body.s_dttm, "end": req.body.e_dttm };
    req.session._ready_to_add_reservation = true;
    let cond = `parking_type = 1 AND id IN (SELECT DISTINCT parking_station_id FROM parking_lot WHERE id NOT IN (SELECT parking_lot_id FROM reservation WHERE (${Date.parse(req.session._dts.start)} < r_end AND ${Date.parse(req.session._dts.end)} > r_start)))`;
    dataModel.read_("parking_station", "location", cond, function (rows) {
        rows = JSON.parse(JSON.stringify(rows));
        let valid_rows = [];
        for (let row of rows) {
            row.location = row.location.split("/").map(parseFloat);
            if (check_work_hours(row.work_hours, req.session._dts.start, req.session._dts.end)) {
                valid_rows.push(row);
            }
        }
        dataModel.read_("notification", dataModel.schema_show.notification.join(", "), `user_id = 'd${req.session.sid}' ORDER BY date_created DESC`, function (data) {
            data = JSON.parse(JSON.stringify(data));
            let c = 0;
            for (let el of data) if (!el.viewed) c++;
            dataModel.get2_("driver", "points", req.session.sid, function (datap) {
                res.render('driver/home', {
                    "is_driver": true,
                    "login": (req.session.sid !== undefined),
                    'lang': req.session.lang,
                    dates: req.session._dts,
                    parking_station_locations: JSON.stringify(valid_rows),
                    notifications: data,
                    unread_notification_number: c,
                    points: JSON.stringify(datap.points)
                });
            });
        });
    });
};
function search_driver_port_page(req, res) {
    req.session._dts = { "start": req.body.s_dttm, "end": req.body.e_dttm };
    req.session._ready_to_add_reservation = true;
    let cond = `parking_type = 2 AND id IN (SELECT DISTINCT parking_station_id FROM parking_lot WHERE id NOT IN (SELECT parking_lot_id FROM reservation WHERE (${Date.parse(req.session._dts.start)} < r_end AND ${Date.parse(req.session._dts.end)} > r_start)))`;
    dataModel.read_("parking_station", "location", cond, function (rows) {
        rows = JSON.parse(JSON.stringify(rows));
        let valid_rows = [];
        for (let row of rows) {
            row.location = row.location.split("/").map(parseFloat);
            if (check_work_hours(row.work_hours, req.session._dts.start, req.session._dts.end)) {
                valid_rows.push(row);
            }
        }
        dataModel.read_("notification", dataModel.schema_show.notification.join(", "), `user_id = 'd${req.session.sid}' ORDER BY date_created DESC`, function (data) {
            data = JSON.parse(JSON.stringify(data));
            let c = 0;
            for (let el of data) if (!el.viewed) c++;
            dataModel.get2_("driver", "points", req.session.sid, function (datap) {
                res.render('driver/home', {
                    "is_driver": true,
                    "login": (req.session.sid !== undefined),
                    'lang': req.session.lang,
                    dates: req.session._dts,
                    parking_station_locations: JSON.stringify(valid_rows),
                    notifications: data,
                    unread_notification_number: c,
                    points: JSON.stringify(datap.points)
                });
            });
        });
    });
};

function read_driver_notifications(req, res) {
    if (req.session.sid === undefined || !req.session.is_driver) {
        console.log("To read notifications you must sign in first");
        res.redirect('/sign_in');
    }
    else {
        dataModel.read_all_user_notifications(`d${req.session.sid}`, function (data) {
            res.redirect('back');
        });
    }
};

function get_driver_info_page(req, res) {
    // console.log(req.session.lang);
    dataModel.read_("notification", dataModel.schema_show.notification.join(", "), `user_id = 'd${req.session.sid}' ORDER BY date_created DESC`, function (data) {
        data = JSON.parse(JSON.stringify(data));
        let c = 0;
        for (let el of data) if (!el.viewed) c++;
        dataModel.get2_("driver", "points", req.session.sid, function (datap) {
            res.render('driver/info', {
                "is_driver": true,
                "login": (req.session.sid !== undefined),
                'lang': req.session.lang,
                notifications: data,
                unread_notification_number: c,
                points: JSON.stringify(datap.points)
            });
        });
    });
};

function get_driver_book_page(req, res) {
    if (req.session.sid === undefined || !req.session.is_driver) {
        console.log("To add a reservation you must sign in first");
        res.redirect('/sign_in');
    }
    else {
        //const ps_id = req.params.ps_id;
        req.session.ps_id = req.params.ps_id;
        // dataModel.get2_("parking_station", "name, location, photo, phone, price_list, work_hours", req.session.ps_id, function (ps) {
        dataModel.get_("parking_station", req.session.ps_id, function (ps) {
            ps.location = ps.location.split("/")[1] + "," + ps.location.split("/")[0];
            if (req.session.sid === undefined) {
                res.render('driver/book', {
                    parking_station: ps,
                    "is_driver": true,
                    "login": (req.session.sid !== undefined),
                    'lang': req.session.lang
                });
            }
            else {
                dataModel.get_("driver", req.session.sid, function (data) {
                    if (data) {
                        dataModel.read_("car", "plate, model, color", `driver_id=${req.session.sid}`, function (cars) {
                            let prc = 0;
                            if (req.session._dts) {
                                prc = final_price_calculation(ps.price_list, ps.discount, req.session._dts.start, req.session._dts.end);
                            }
                            for (let field of ["lots", "tax_office", "company_name", "tin", "email", "price_list"]) delete ps[field];
                            ps.id = req.session.ps_id;
                            ps = JSON.stringify(ps);
                            let srv = JSON.stringify(dataModel.schema_parking_station_boolean);
                            dataModel.read_("notification", dataModel.schema_show.notification.join(", "), `user_id = 'd${req.session.sid}' ORDER BY date_created DESC`, function (datan) {
                                datan = JSON.parse(JSON.stringify(datan));
                                let c = 0;
                                for (let el of datan) if (!el.viewed) c++;
                                dataModel.get2_("driver", "points", req.session.sid, function (datap) {
                                    res.render('driver/book', {
                                        driver: data,
                                        driver_car: cars,
                                        parking_station: ps,
                                        price: prc,
                                        dates: req.session._dts,
                                        services: srv,
                                        "is_driver": true,
                                        "found": req.session._ready_to_add_reservation,
                                        "login": (req.session.sid !== undefined),
                                        'lang': req.session.lang,
                                        notifications: datan,
                                        unread_notification_number: c,
                                        points: JSON.stringify(datap.points)
                                    });
                                });
                            });
                        })
                    }
                });
            }
        });
    }
};

function add_driver_review(req, res) {
    if (req.session.sid === undefined || !req.session.is_driver) {
        console.log("To add a review you must sign in first");
        res.redirect('/sign_in');
    }
    else {
        const res_id = req.body._id;
        const ps_id = req.body.parking_station_id;
        const stars = req.body.stars;
        const description = req.body.description;
        dataModel.add_review(res_id, ps_id, stars, description, function () {
            console.log("Review added/updated succesfully");
            res.redirect('/history');
        });
    }
};
function delete_driver_review(req, res) {
    if (req.session.sid === undefined || !req.session.is_driver) {
        console.log("To delete a review you must sign in first");
        res.redirect('/sign_in');
    }
    else {
        dataModel.delete_("review", req.body._id, function () {
            console.log("Review deleted succesfully");
            res.redirect('/history');
        });
    }
};

function add_driver_reservation(req, res) {
    if (req.session.sid === undefined || !req.session.is_driver) {
        console.log("To add a reservation you must sign in first");
        res.redirect('/sign_in');
    }
    else {
        const ps_id = req.session.ps_id;
        let resv = {};
        resv.car_id = req.body.car;
        let today = new Date();
        today = today.getTime();
        if (today <= Date.parse(req.body.s_date) && Date.parse(req.body.s_date) < Date.parse(req.body.e_date)) {
            dataModel.find_free_parking_lots_of_parking_station(ps_id, Date.parse(req.body.s_date), Date.parse(req.body.e_date), function (data) {
                let _id = JSON.parse(JSON.stringify(data));
                if (_id[0] === undefined) {
                    req.session._ready_to_add_reservation = false;
                    console.log("Can't find an available parking space try again other datetimes or another parking station");
                    res.redirect('/home');
                }
                else {
                    dataModel.get2_("parking_station", "price_list, work_hours, discount", ps_id, function (data2) {
                        const work_hours = JSON.parse(JSON.stringify(data2)).work_hours;
                        if (check_work_hours(work_hours, req.body.s_date, req.body.e_date)) {
                            resv.pl_id = _id[0].id;
                            resv.r_start = Date.parse(req.body.s_date); //new Date(req.body.s_date).getTime();
                            resv.r_end = Date.parse(req.body.e_date); //new Date(req.body.e_date).getTime();
                            resv.price = final_price_calculation(data2.price_list, data2.discount, req.body.s_date, req.body.e_date);
                            const required_values = Object.values(resv);
                            req.session._ready_to_add_reservation = false; //! IT WORKS WHYYYYYYY???????????????
                            // req.session._dts = {};
                            dataModel.create_("reservation", required_values, function () {
                                dataModel.update_points(req.session.sid, parseInt(resv.price / 10), function () {
                                    console.log("Reservation booked");
                                    res.redirect('/history');
                                });
                            });
                        }
                        else {
                            req.session._ready_to_add_reservation = false;
                            console.log("Can't find an available parking space try again other datetimes or another parking station");
                            res.redirect('/home');
                        }
                    });

                }
            });
        }
        else {
            console.log("Dates not valid");
            res.redirect('back');
        }
    }
};
function delete_driver_reservation(req, res) {
    if (req.session.sid === undefined || !req.session.is_driver) {
        console.log("To delete a reservation you must sign in first");
        res.redirect('/sign_in')
    }
    else {
        dataModel.get_("reservation", req.body._id, function (data) { // check if reservation exists
            if (data) {
                data = JSON.parse(JSON.stringify(data));
                let today = new Date();
                if (today.getTime() < data.r_start) { // check if reservation is future
                    dataModel.read_parking_station_from_reservation(req.body._id, function (data2) {
                        dataModel.delete_("reservation", req.body._id, function () {
                            dataModel.update_points(req.session.sid, -parseInt(req.body._price / 10), function () {
                                dataModel.add_notification(`"d${data2}"`, Date.parse(today), `"Reservation (${req.body._id}) deleted from driver"`, function (data3) {
                                    console.log("Reservation deleted succesfully");
                                    res.redirect('/history');
                                });
                            });
                        });
                    });
                }
            }
        });
    }
};

function delete_driver_car(req, res) {
    if (req.session.sid === undefined || !req.session.is_driver) {
        console.log("To delete a car you must sign in first");
        res.redirect('/sign_in');
    }
    else {
        dataModel.get_("car", req.body._id, function (data) { // check if car exists
            if (data) {
                dataModel.delete_("car", req.body._id, function () {
                    console.log("Car deleted succesfully");
                    res.redirect('/account');
                });
            }
        });
    }
};
function update_driver_car(req, res) {
    if (req.session.sid === undefined || !req.session.is_driver) {
        console.log("To update a car you must sign in first");
        res.redirect('/sign_in');
    }
    else {
        dataModel.get_("car", req.body._id, function (data) { // check if car exists
            if (data) {
                let rr = { "id": req.body._id, "model": req.body.model, "color": req.body.color };
                dataModel.update_("car", rr, function () {
                    console.log("Car updated succesfully");
                    res.redirect('back');
                    //res.redirect('/account');
                });
            }
        });
    }
};

// function update_driver_reservation(req, res) {
//     if (req.session.sid === undefined) {
//         console.log("To delete a reservation you must sign in first");
//         res.redirect('/sign_in');
//     }
//     else {
//         dataModel.get_("reservation", req.body._id, function (data) { // check if reservation exists
//             if (data) {
//                 data = JSON.parse(JSON.stringify(data));
//                 let today = new Date();
//                 if (today.getTime() < data.r_start) { // check if reservation is future
// 
//                     dataModel.update("reservation", req.body._id, function () {
//                         console.log("Reservation deleted succesfully");
//                         res.redirect('/history');
//                     });
//                 }
//             }
//         });
//     }
// };

function search_driver_reservation_availability(req, res) {
    let ps_id = "";
    if (req.session.ps_id) ps_id = req.session.ps_id;
    // else ps_id = req.body.ps_id; //! only if history page
    req.session._dts = { "start": req.body.s_date, "end": req.body.e_date }; //! if history page need ;
    let today = new Date();
    today = today.getTime();
    if (today <= Date.parse(req.session._dts.start) && Date.parse(req.session._dts.start) < Date.parse(req.session._dts.end)) {
        dataModel.find_free_parking_lots_of_parking_station2(ps_id, Date.parse(req.session._dts.start), Date.parse(req.session._dts.end), function (data) {
            let _id = JSON.parse(JSON.stringify(data));
            if (_id[0] === undefined) {
                req.session._ready_to_add_reservation = false;
                console.log("Can't find an available parking space try again other datetimes or another parking station!!");
            }
            else {
                const work_hours = _id[0].work_hours;
                if (check_work_hours(work_hours, req.session._dts.start, req.session._dts.end)) {
                    req.session._ready_to_add_reservation = true; //! for some reason if this line is inside a second datamodel.get2_ function (depth 2) it doesn't work, maybe because of redirect vs render
                    console.log("find an available parking space");
                }
            }
            res.redirect('back');
        });
    }
    else {
        req.session._ready_to_add_reservation = false;
        console.log("Dates not valid");
        res.redirect('back');
    }
};

function get_driver_history_page(req, res) {
    if (req.session.sid === undefined || !req.session.is_driver) {
        console.log("To see history page you must sign in first");
        res.redirect('/sign_in');
    }
    else {
        dataModel.get_("driver", req.session.sid, function (data) { // check if id exists
            if (data) {
                dataModel.load_reservation_history("driver", req.session.sid, function (data2) {
                    const dt = JSON.parse(JSON.stringify(data2));
                    let ids = [];
                    dataModel.read_("parking_lot", "", `parking_station_id = ${req.session.sid}`, function (data1) {
                        const dt1 = JSON.parse(JSON.stringify(data1));
                        let ids_ = [];
                        for (let ell of dt1) ids_.push(ell.id);
                        for (let el of dt) {
                            el.location = el.location.split("/")[1] + "," + el.location.split("/")[0];
                            el.parking_lot_id = ids_.indexOf(el.parking_lot_id) + 1;
                            ids.push(el.id);
                        }
                        if (Object.keys(data2).length !== 0) { // if driver has reservation history
                            dataModel.read_("review", "stars, description", `id IN (${ids.toString()})`, function (data_3) {
                                const dt_2 = JSON.parse(JSON.stringify(data_3));
                                let rvs = {};
                                for (let el2 of dt_2) { rvs[el2.id.toString()] = { "stars": el2.stars, "description": el2.description }; }
                                rvs = JSON.stringify(rvs);
                                //dt = JSON.stringify(dt);
                                dataModel.read_("notification", dataModel.schema_show.notification.join(", "), `user_id = 'd${req.session.sid}' ORDER BY date_created DESC`, function (datan) {
                                    datan = JSON.parse(JSON.stringify(datan));
                                    let c = 0;
                                    for (let el of datan) if (!el.viewed) c++;
                                    dataModel.get2_("driver", "points", req.session.sid, function (datap) {
                                        res.render('driver/history', {
                                            records: dt,
                                            reviews: rvs,
                                            "is_driver": true,
                                            "login": (req.session.sid !== undefined),
                                            'lang': req.session.lang,
                                            notifications: datan,
                                            unread_notification_number: c,
                                            points: JSON.stringify(datap.points)
                                        });
                                    });
                                });

                            });
                        }
                        else { // if driver hasn't a reservation history
                            dataModel.read_("notification", dataModel.schema_show.notification.join(", "), `user_id = 'd${req.session.sid}' ORDER BY date_created DESC`, function (datan) {
                                datan = JSON.parse(JSON.stringify(datan));
                                let c = 0;
                                for (let el of datan) if (!el.viewed) c++;
                                dataModel.get2_("driver", "points", req.session.sid, function (datap) {
                                    res.render('driver/history', {
                                        records: dt,
                                        "is_driver": true,
                                        "login": (req.session.sid !== undefined),
                                        'lang': req.session.lang,
                                        notifications: datan,
                                        unread_notification_number: c,
                                        points: JSON.stringify(datap.points)
                                    });
                                });
                            });
                        }
                    });
                })
            }
        });
    }
}

function add_new_driver_car(req, res) {
    if (req.session.sid === undefined || !req.session.is_driver) {
        console.log("You must sign in first");
        res.redirect('/sign_in');
    }
    else {
        dataModel.get_("driver", req.session.sid, function (data) { // check if email exists
            if (data) {
                let car = {};
                for (let field of dataModel.schema_required["car"]) { // dynamically get car keys and values
                    if (field === "driver_id") car[field] = req.session.sid;
                    else car[field] = req.body[field];
                }
                dataModel.check2_("car", `plate = '${car.plate}'`, function (data2) {
                    if (!data2) {
                        const vls = Object.values(car);
                        dataModel.create_("car", vls, function () {
                            console.log("New car added succesfully");
                            res.redirect('/account');
                        });
                    }
                    else {
                        console.log("Car is already in database");
                        res.redirect('/account');
                    }
                });
            }
        });
    }
}

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

}
function convert_12h_to_24h(time12h) {
    const [time, modifier] = time12h.split(" ");
    let [hours, minutes] = time.split(":");
    if (hours === "12") hours = "00";
    if (modifier === "PM" || modifier === "μ.μ.") hours = parseInt(hours) + 12;
    if (hours < 10) { hours = '0' + hours; }
    if (minutes < 10) { minutes = '0' + parseInt(minutes); }
    return `${hours}:${minutes}`;
}

module.exports = {
    get_driver_info_page,
    get_driver_home_page,
    get_driver_city_page,
    get_driver_airport_page,
    search_driver_home_page,
    search_driver_airport_page,
    search_driver_port_page,
    get_driver_port_page,
    read_driver_notifications,
    get_driver_book_page,
    add_driver_review,
    delete_driver_review,
    add_driver_reservation,
    // update_driver_reservation,
    delete_driver_reservation,
    delete_driver_car,
    update_driver_car,
    search_driver_reservation_availability,
    get_driver_history_page,
    add_new_driver_car
}