'use strict';
// const dataModel = require('../models/sqlite_data_model.js');
const dataModel = require('../models/mysql_data_model.js');

function get_driver_home_page(req, res) {
    // if (req.session._dts) {
    //     if (req.session._dts.start != undefined && req.session._dts.end != undefined) {
    //         req.session._ready_to_add_reservation = false;
    //     }
    // }
    dataModel.read_("parking_station", "id, location", "parking_type = 0", function (rows) {
        rows.map(function (row) { row.location = row.location.split("/").map(parseFloat); });
        res.render('driver/home', {
            "is_driver": true,
            "login": (req.session.sid !== undefined),
            'lang': req.session.lang,
            dates: req.session._dts,
            parking_station_locations: JSON.stringify(rows)
        });
    });
};
function get_driver_city_page(req, res) {
    dataModel.read_("parking_station", "id, location", "parking_type = 0", function (rows) {
        rows.map(function (row) { row.location = row.location.split("/").map(parseFloat); });
        res.render('driver/city', {
            "is_driver": true,
            "login": (req.session.sid !== undefined),
            'lang': req.session.lang,
            parking_station_locations: JSON.stringify(rows)
        });
    });

};
function get_driver_airport_page(req, res) {
    dataModel.read_("parking_station", "id, location", "parking_type = 1", function (rows) {
        rows.map(function (row) { row.location = row.location.split("/").map(parseFloat); });
        res.render('driver/airport', {
            "is_driver": true,
            "login": (req.session.sid !== undefined),
            'lang': req.session.lang,
            parking_station_locations: JSON.stringify(rows)
        });
    });
};
function get_driver_port_page(req, res) {
    dataModel.read_("parking_station", "id, location", "parking_type = 2", function (rows) {
        rows.map(function (row) { row.location = row.location.split("/").map(parseFloat); });
        res.render('driver/port', {
            "is_driver": true,
            "login": (req.session.sid !== undefined),
            'lang': req.session.lang,
            parking_station_locations: JSON.stringify(rows)
        });
    });
};

function search_driver_home_page(req, res) {
    req.session._dts = { "start": req.body.s_dttm, "end": req.body.e_dttm };
    req.session._ready_to_add_reservation = true;
    let cond = `parking_type = 0 AND id IN (SELECT DISTINCT parking_station_id FROM parking_lot WHERE id NOT IN (SELECT parking_lot_id FROM reservation WHERE (${Date.parse(req.session._dts.start)} < r_end AND ${Date.parse(req.session._dts.end)} > r_start)))`;
    dataModel.read_("parking_station", "id, location", cond, function (rows) {
        rows.map(function (row) { row.location = row.location.split("/").map(parseFloat); });
        res.render('driver/home', {
            "is_driver": true,
            "login": (req.session.sid !== undefined),
            'lang': req.session.lang,
            dates: req.session._dts,
            parking_station_locations: JSON.stringify(rows)
        });
    });
};
function search_driver_airport_page(req, res) {
    req.session._dts = { "start": req.body.s_dttm, "end": req.body.e_dttm };
    req.session._ready_to_add_reservation = true;
    let cond = `parking_type = 1 AND id IN (SELECT DISTINCT parking_station_id FROM parking_lot WHERE id NOT IN (SELECT parking_lot_id FROM reservation WHERE (${Date.parse(req.session._dts.start)} < r_end AND ${Date.parse(req.session._dts.end)} > r_start)))`;
    dataModel.read_("parking_station", "id, location", cond, function (rows) {
        rows.map(function (row) { row.location = row.location.split("/").map(parseFloat); });
        res.render('driver/home', {
            "is_driver": true,
            "login": (req.session.sid !== undefined),
            'lang': req.session.lang,
            dates: req.session._dts,
            parking_station_locations: JSON.stringify(rows)
        });
    });
};
function search_driver_port_page(req, res) {
    req.session._dts = { "start": req.body.s_dttm, "end": req.body.e_dttm };
    req.session._ready_to_add_reservation = true;
    let cond = `parking_type = 2 AND id IN (SELECT DISTINCT parking_station_id FROM parking_lot WHERE id NOT IN (SELECT parking_lot_id FROM reservation WHERE (${Date.parse(req.session._dts.start)} < r_end AND ${Date.parse(req.session._dts.end)} > r_start)))`;
    dataModel.read_("parking_station", "id, location", cond, function (rows) {
        rows.map(function (row) { row.location = row.location.split("/").map(parseFloat); });
        res.render('driver/home', {
            "is_driver": true,
            "login": (req.session.sid !== undefined),
            'lang': req.session.lang,
            dates: req.session._dts,
            parking_station_locations: JSON.stringify(rows)
        });
    });
};

function get_driver_info_page(req, res) {
    // console.log(req.session.lang);
    res.render('driver/info', {
        "is_driver": true,
        "login": (req.session.sid !== undefined),
        'lang': req.session.lang
    });
};

function get_driver_book_page(req, res) {
    if (req.session.sid === undefined) {
        console.log("To add a reservation you must sign in first");
        res.redirect('/sign_in')
    }
    else {
        //const ps_id = req.params.ps_id;
        req.session.ps_id = req.params.ps_id;
        dataModel.get2_("parking_station", "name, location, photo, phone, price_list", req.session.ps_id, function (ps) {
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
                            if (req.session._dts) prc = final_price_calculation(ps.price_list, req.session._dts.start, req.session._dts.end);
                            res.render('driver/book', {
                                price: prc,
                                parking_station: ps,
                                driver_car: cars,
                                driver: data,
                                dates: req.session._dts,
                                "is_driver": true,
                                "found": req.session._ready_to_add_reservation,
                                "login": (req.session.sid !== undefined),
                                'lang': req.session.lang
                            });
                        })
                    }
                });
            }
        });
    }
};

function add_driver_review(req, res) {
    if (req.session.sid === undefined) {
        console.log("To add a review you must sign in first");
        res.redirect('/sign_in')
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
    if (req.session.sid === undefined) {
        console.log("To delete a review you must sign in first");
        res.redirect('/sign_in')
    }
    else {
        dataModel.delete_("review", req.body._id, function () {
            console.log("Review deleted succesfully");
            res.redirect('/history');
        });
    }
};

function add_driver_reservation(req, res) {
    if (req.session.sid === undefined) {
        console.log("To add a reservation you must sign in first");
        res.redirect('/sign_in')
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
                    resv.pl_id = _id[0].id;
                    resv.r_start = Date.parse(req.body.s_date); //new Date(req.body.s_date).getTime();
                    resv.r_end = Date.parse(req.body.e_date); //new Date(req.body.e_date).getTime();
                    resv.price = 10 * (new Date(req.body.e_date) - new Date(req.body.s_date)) / 3600000;
                    const required_values = Object.values(resv);
                    req.session._ready_to_add_reservation = false;
                    // req.session._dts = {};
                    dataModel.create_("reservation", required_values, function () {
                        dataModel.update_points(req.session.sid, parseInt(resv.price / 10), function () {
                            console.log("Reservation booked");
                            res.redirect('/history');
                        });
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
    if (req.session.sid === undefined) {
        console.log("To delete a reservation you must sign in first");
        res.redirect('/sign_in')
    }
    else {
        dataModel.get_("reservation", req.body._id, function (data) { // check if reservation exists
            if (data) {
                data = JSON.parse(JSON.stringify(data));
                let today = new Date();
                if (today.getTime() < data.r_start) { // check if reservation is future
                    dataModel.delete_("reservation", req.body._id, function () {
                        dataModel.update_points(req.session.sid, -parseInt(req.body._price / 10), function () {
                            console.log("Reservation deleted succesfully");
                            res.redirect('/history');
                        });
                    });
                }
            }
        });
    }
};

function delete_driver_car(req, res) {
    if (req.session.sid === undefined) {
        console.log("To delete a car you must sign in first");
        res.redirect('/sign_in')
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
    if (req.session.sid === undefined) {
        console.log("To update a car you must sign in first");
        res.redirect('/sign_in')
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
//         res.redirect('/sign_in')
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
        dataModel.find_free_parking_lots_of_parking_station(ps_id, Date.parse(req.session._dts.start), Date.parse(req.session._dts.end), function (data) {
            let _id = JSON.parse(JSON.stringify(data));
            if (_id[0] === undefined) {
                req.session._ready_to_add_reservation = false;
                console.log("Can't find an available parking space try again other datetimes or another parking station!!");
            }
            else {
                req.session._ready_to_add_reservation = true;
                console.log("find an available parking space");
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
    if (req.session.sid === undefined) {
        console.log("To see history page you must sign in first");
        res.redirect('/sign_in');
    }
    else {
        dataModel.get_("driver", req.session.sid, function (data) { // check if id exists
            if (data) {
                dataModel.load_reservation_history("driver", req.session.sid, function (data2) {
                    const dt = JSON.parse(JSON.stringify(data2));
                    let ids = [];
                    for (let el of dt) {
                        el.location = el.location.split("/")[1] + "," + el.location.split("/")[0];
                        ids.push(el.id);
                        // el.r_start = el.r_start.replace("T"," ");
                        // el.r_end = el.r_end.replace("T"," ");
                    }
                    if (Object.keys(data2).length !== 0) { // if driver has reservation history
                        dataModel.read_("review", "stars, description", `id IN (${ids.toString()})`, function (data_3) {
                            const dt_2 = JSON.parse(JSON.stringify(data_3));
                            let rvs = {};
                            for (let el2 of dt_2) { rvs[el2.id.toString()] = { "stars": el2.stars, "description": el2.description }; }
                            rvs = JSON.stringify(rvs);
                            //dt = JSON.stringify(dt);
                            res.render('driver/history', {
                                records: dt,
                                reviews: rvs,
                                "is_driver": true,
                                "login": (req.session.sid !== undefined),
                                'lang': req.session.lang
                            });

                        });
                    }
                    else { // if driver hasn't a reservation history
                        res.render('driver/history', {
                            records: dt,
                            "is_driver": true,
                            "login": (req.session.sid !== undefined),
                            'lang': req.session.lang
                        });
                    }
                })
            }
        });
    }
}

function add_new_driver_car(req, res) {
    if (req.session.sid === undefined) {
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

function final_price_calculation(price_list, dt1, dt2) {
    let h = price_list.split("d")[0].slice(1).split(",");
    let d = price_list.split("d")[1].split("m")[0].split(",");
    let m = price_list.split("m")[1].split(",");
    for (let i = 0 ; i < 4 ; i++) {
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
    //price = price.toFixed(2);
    return price;
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