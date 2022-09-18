'use strict';
// const dataModel = require('../models/sqlite_data_model.js');
const dataModel = require('../models/mysql_data_model.js');

function get_admin_home_page(req, res) {
    res.render('admin/home', {
        "is_user": false,
        "login": (req.session.sid !== undefined),
        'lang': req.session.lang
    });
};

module.exports = {
    get_admin_home_page
}