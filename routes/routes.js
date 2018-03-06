
var session = require('express-session');
const admin = require('firebase-admin');

var appRouter = function (app) {

    //app.use(session({ secret: 'Dorian@Suji', resave: false, saveUninitialized: true }));
    app.use(session({ secret: 'Dorian@Suji', resave: false, saveUninitialized: true }));
    // app.use(session({
    //     secret: 'Dorian@Suji',
    //     resave: false,
    //     saveUninitialized: true,
    //     cookie: { secure: true }
    //   }))

    var sess;

    var serviceAccount = require("../serviceAccountKey.json");

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    var db = admin.firestore();

    app.get("/", function (req, res) {

        res.redirect('/Login.html');
    });

    app.get("/logout", function (req, res) {
        if (req.session) {
            req.session.destroy(function () {
                res.clearCookie('connect.sid', { path: '/' });
                res.redirect('/Login.html');
            });
        } else {
            res.redirect('/Login.html');
        }

    });
    // User Regisration 

    app.post('/register', function (req, res) {

        var full_name = req.body.full_name;
        var email = req.body.email;
        var upassword = req.body.upassword;
        var utype = "admin";

        var result = false;
        var user_ref = db.collection('users');
        var query = user_ref.where('email', '==', email).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    result = true;
                });

                if (result == false) {
                    user_ref.doc(email).set({
                        full_name: full_name,
                        email: email,
                        upassword: upassword,
                        utype: utype,
                    });
                    res.status(200).send({ "status": "success", "message": "User Regisration successfully" });
                } else {
                    res.status(400).send({ "status": "error", "message": "User registration fail please try again" });
                }
            });

    });

    //User Login 
    app.post('/login', function (req, res) {

        var email = req.body.email;

        var upassword = req.body.upassword;
        var userref = db.collection('users');
        var result = userref.where('email', '==', email).where('upassword', '==', upassword).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    console.log(doc.data().active);
                    if (doc.data().active == 'No') {

                        res.status(400).send({ "status": "error", "message": "You account is not active." });
                    } else {

                        var result = true;
                        sess = req.session;
                        sess.email = doc.data().email;

                        var returnResult = {
                            type: doc.data().utype,
                            email: doc.data().email
                        }
                        res.status(200).send({ status: "success", data: returnResult, message: "Login Successfully done" });
                    }
                });
            })

    });

    //Add client and users
    app.post('/AddClients', function (req, res) {
        sess = req.session.email;

        if (!sess) {
            res.status(400).send({ "status": "Error", data: "Login", "message": "You can not allow this request with login" });
        } else {
            var Clients_ref = db.collection("users");
            if (!req.body.firstName) { req.body.firstName = ""; }
            if (!req.body.lastName) { req.body.lastName = ""; }
            if (!req.body.company) { req.body.company = ""; }
            if (!req.body.jobTitle) { req.body.jobTitle = ""; }
            if (!req.body.group) { req.body.group = ""; }
            if (!req.body.active) { req.body.active = ""; }
            if (!req.body.address) { req.body.address = ""; }
            if (!req.body.city) { req.body.city = ""; }
            if (!req.body.state) { req.body.state = ""; }
            if (!req.body.zipCode) { req.body.zipCode = ""; }
            if (!req.body.phone) { req.body.phone = ""; }
            if (!req.body.email) { req.body.email = ""; }
            if (!req.body.active == "Yes") { req.body.utype = "client"; }
            if (!req.body.active == "No") { req.body.utype = "user"; }
            if (!req.body.upassword) { req.body.upassword = "12345"; }
            var result = false;
            var query = Clients_ref.where('email', '==', req.body.email).get()
                .then(snapshot => {
                    snapshot.forEach(doc => {
                        result = true;
                    });

                    if (result == false) {
                        Clients_ref.doc(req.body.email).set({
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            company: req.body.company,
                            jobTitle: req.body.jobTitle,
                            group: req.body.group,
                            active: req.body.active,
                            address: req.body.address,
                            city: req.body.city,
                            state: req.body.state,
                            zipCode: req.body.zipCode,
                            phone: req.body.phone,
                            email: req.body.email,
                            upassword: req.body.upassword,
                            utype: req.body.utype,
                        });
                        res.status(200).send({ "status": "success", "message": "Added successfully" });
                    } else {
                        res.status(400).send({ "status": "error", "message": "fail please try again" });
                    }
                });
        }
    });

    //get all client and user 
    app.get('/get_All_CLeint', function (req, res) {
        sess = req.session.email;
        if (!sess) {
            res.status(400).send({ "status": "Error", data: "Login", "message": "You can not allow this request with login" });
        } else {
            var result = false;
            var users_ref = db.collection("users");
            var query = users_ref.where('utype', '==', 'user').get()
                .then(snapshot => {
                    var lstClient = {};

                    snapshot.forEach(doc => {
                        result = true;
                        lstClient[doc.id] = [];
                        lstClient[doc.id].push(doc.data());

                    });
                    res.status(200).send({ status: "success", data: JSON.stringify(lstClient), message: "Data load successfully" });

                }
                    , function (error) {
                        // Something went wrong.
                        console.error(error);
                        res.status(400).send({ "status": "error", "message": "Data load fail" });
                    });
        }
    });

    //get all client 
    app.get('/getOnlyCLeints', function (req, res) {
        console.log(req.body);
        sess = req.session.email;
        console.log(sess);
        if (!sess) {
            result = true;
            res.status(400).send({ "status": "Error", data: "Login", "message": "You can not allow this request with login" });
        }
        else {
            var users_ref = db.collection("users");
            var query = users_ref.where('utype', '==', 'user').get()
                .then(snapshot => {
                    var lstClient = {};

                    snapshot.forEach(doc => {
                        result = true;
                        lstClient[doc.id] = [];
                        lstClient[doc.id].push(doc.data());

                    });
                    res.status(200).send({ status: "success", data: JSON.stringify(lstClient), message: "Data load successfully" });

                }
                    , function (error) {
                        // Something went wrong.
                        console.error(error);
                        res.status(400).send({ "status": "error", "message": "Data load fail" });
                    });
        }
    });

    //get client and user by Id
    app.get('/getClientById', function (req, res) {
        sess = req.session.email;
        if (!sess) {
            res.status(400).send({ "status": "Error", data: "Login", "message": "You can not allow this request with login" });
        }
        else {
            var result = false;

            var users_ref = db.collection("users");
            var query = users_ref.where('email', '==', req.query.id).get()
                .then(snapshot => {
                    var lstClient = {};

                    snapshot.forEach(doc => {
                        result = true;
                        //    lstClient[doc.id] = [];
                        lstClient = doc.data();

                    });

                    res.status(200).send({ status: "success", data: JSON.stringify(lstClient), message: "Data get successfully" });

                }
                    , function (error) {
                        // Something went wrong.
                        console.error(error);
                        res.status(400).send({ "status": "error", "message": "Data load fail" });
                    });
        }
    });

    //Edit client and user by Id
    app.post('/EditClient', function (req, res) {
        sess = req.session.email;
        if (!sess) {
            res.status(400).send({ "status": "Error", data: "Login", "message": "You can not allow this request with login" });
        } else {
            var Clients_ref = db.collection("users");
            if (!req.body.firstName) { req.body.firstName = ""; }
            if (!req.body.lastName) { req.body.lastName = ""; }
            if (!req.body.company) { req.body.company = ""; }
            if (!req.body.jobTitle) { req.body.jobTitle = ""; }
            if (!req.body.group) { req.body.group = ""; }
            if (!req.body.active) { req.body.active = ""; }
            if (!req.body.address) { req.body.address = ""; }
            if (!req.body.city) { req.body.city = ""; }
            if (!req.body.state) { req.body.state = ""; }
            if (!req.body.zipCode) { req.body.zipCode = ""; }
            if (!req.body.phone) { req.body.phone = ""; }
            if (!req.body.email) { req.body.email = ""; }
            if (!req.body.active == "Yes") { req.body.utype = "client"; }
            if (!req.body.active == "No") { req.body.utype = "user"; }
            if (!req.body.upassword) { req.body.upassword = "12345"; }

            Clients_ref.doc(req.body.email).set({

                firstName: req.body.firstName,
                lastName: req.body.lastName,
                company: req.body.company,
                jobTitle: req.body.jobTitle,
                group: req.body.group,
                active: req.body.active,
                address: req.body.address,
                city: req.body.city,
                state: req.body.state,
                zipCode: req.body.zipCode,
                phone: req.body.phone,
                email: req.body.email,
                upassword: req.body.upassword,
                utype: req.body.utype,
            });
            res.status(200).send({ "status": "success", "message": "Client data updated" });
        }
    });

    //Add Activity
    app.post('/AddActivitys', function (req, res) {
        sess = req.session.email;
        if (!sess) {
            res.status(400).send({ "status": "Error", data: "Login", "message": "You can not allow this request with login" });
        }
        else {
            var Activitys_ref = db.collection("activity");
            if (!req.body.status) { req.body.status = ""; }
            if (!req.body.clientId) { req.body.clientId = ""; }
            if (!req.body.title) { req.body.title = ""; }
            if (!req.body.date) { req.body.date = ""; }
            if (!req.body.group) { req.body.group = ""; }

            Activitys_ref.doc().set({
                status: req.body.status,
                clientId: req.body.clientId,
                title: req.body.title,
                date: req.body.date,
                group: req.body.group,

            });

            res.status(200).send({ "status": "success", "message": "Activity added successfully" });
        }
    });

    //get all Activity 
    app.get('/get_All_Activity', function (req, res) {
        sess = req.session.email;
        if (!sess) {
            res.status(400).send({ "status": "Error", data: "Login", "message": "You can not allow this request with login" });
        } else {
            var result = false;
            var users_ref = db.collection("activity");
            var query = users_ref.get()
                .then(snapshot => {
                    var lstActivity = {};

                    snapshot.forEach(doc => {
                        result = true;
                        lstActivity[doc.id] = [];
                        lstActivity[doc.id].push(doc.data());

                    });
                    res.status(200).send({ status: "success", data: JSON.stringify(lstActivity), message: "Data load successfully" });

                }
                    , function (error) {
                        // Something went wrong.
                        console.error(error);
                        res.status(400).send({ "status": "error", "message": "Data load fail" });
                    });
        }
    });

    //get Activity by Id
    app.get('/getActivityById', function (req, res) {
        sess = req.session.email;
        if (!sess) {
            res.status(400).send({ "status": "Error", data: "Login", "message": "You can not allow this request with login" });
        } else {
            var result = false;

            var users_ref = db.collection("activity");
            var contact_info_ref = db.collection("activity").doc(req.query.id);

            var getDoc = contact_info_ref.get()
                .then(doc => {
                    if (!doc.exists) {
                        res.status(400).send({ "status": "error", "message": "Data load fail" });
                    } else {
                        res.status(200).send({ status: "success", data: JSON.stringify(doc.data()), message: "Data get successfully" });

                    }
                })
        }
    });

    //get client and user by Id
    app.get('/getActivityAssignByAdmin', function (req, res) {
        sess = req.session.email;
        if (!sess) {
            res.status(400).send({ "status": "Error", data: "Login", "message": "You can not allow this request with login" });
        } else {
            var result = false;
            var users_ref = db.collection("activity");
            var query = users_ref.where('clientId', '==', req.query.id).get()
                .then(snapshot => {
                    var lstContracts = {};

                    snapshot.forEach(doc => {
                        result = true;
                        lstContracts[doc.id] = [];
                        lstContracts[doc.id].push(doc.data());

                    });
                    res.status(200).send({ status: "success", data: JSON.stringify(lstContracts), message: "Data load successfully" });

                }
                    , function (error) {
                        // Something went wrong.
                        console.error(error);
                        res.status(400).send({ "status": "error", "message": "Data load fail" });
                    });
        }
    });

    app.post('/EditActivitys', function (req, res) {
        sess = req.session.email;
        if (!sess) {
            res.status(400).send({ "status": "Error", data: "Login", "message": "You can not allow this request with login" });
        }
        else {
            var Activity_ref = db.collection("activity");
            if (!req.body.status) { req.body.status = ""; }
            if (!req.body.clientId) { req.body.clientId = ""; }
            if (!req.body.title) { req.body.title = ""; }
            if (!req.body.date) { req.body.date = ""; }
            if (!req.body.group) { req.body.group = ""; }

            var result = false;

            Activity_ref.doc(req.body.id).set({

                status: req.body.status,
                clientId: req.body.clientId,
                title: req.body.title,
                date: req.body.date,
                group: req.body.group,


            });
            res.status(200).send({ "status": "success", "message": "Activity data updated" });
        }
    });

    app.post('/DeletActivitys', function (req, res) {
        sess = req.session.email;
        if (!sess) {
            res.status(400).send({ "status": "Error", data: "Login", "message": "You can not allow this request with login" });
        }
        else {
            var Activity_ref = db.collection("activity").doc(req.body.id).delete();

            res.status(200).send({ "status": "success", "message": "Activity data Deleted" });
        }
    });

    //Add Cotrancts
    app.post('/AddContracts', function (req, res) {
        sess = req.session.email;
        if (!sess) {
            res.status(400).send({ "status": "Error", data: "Login", "message": "You can not allow this request with login" });
        } else {
            var Activitys_ref = db.collection("Contracts");

            if (!req.body.clientId) { req.body.clientId = ""; }
            if (!req.body.title) { req.body.title = ""; }
            if (!req.body.date) { req.body.date = ""; }
            if (!req.body.link) { req.body.link = ""; }

            Activitys_ref.doc().set({

                clientId: req.body.clientId,
                title: req.body.title,
                date: req.body.date,
                link: req.body.link,

            });

            res.status(200).send({ "status": "success", "message": "Contracts added successfully" });
        }
    });


    //get all Activity 
    app.get('/get_All_Contracts', function (req, res) {
        sess = req.session.email;
        if (!sess) {
            res.status(400).send({ "status": "Error", data: "Login", "message": "You can not allow this request with login" });
        } else {
            var result = false;
            var users_ref = db.collection("Contracts");
            var query = users_ref.get()
                .then(snapshot => {
                    var lstContract = {};

                    snapshot.forEach(doc => {
                        result = true;
                        lstContract[doc.id] = [];
                        lstContract[doc.id].push(doc.data());

                    });
                    res.status(200).send({ status: "success", data: JSON.stringify(lstContract), message: "Data load successfully" });

                }
                    , function (error) {
                        // Something went wrong.
                        console.error(error);
                        res.status(400).send({ "status": "error", "message": "Data load fail" });
                    });
        }
    });

    //get Activity by Id
    app.get('/getContractsById', function (req, res) {
        sess = req.session.email;
        if (!sess) {
            res.status(400).send({ "status": "Error", data: "Login", "message": "You can not allow this request with login" });
        } else {
            var result = false;
            var contact_info_ref = db.collection("Contracts").doc(req.query.id);

            var getDoc = contact_info_ref.get()
                .then(doc => {
                    if (!doc.exists) {
                        res.status(400).send({ "status": "error", "message": "Data load fail" });
                    } else {
                        res.status(200).send({ status: "success", data: JSON.stringify(doc.data()), message: "Data get successfully" });

                    }
                })
        }
    });

    app.post('/EditContracts', function (req, res) {
        sess = req.session.email;
        if (!sess) {
            res.status(400).send({ "status": "Error", data: "Login", "message": "You can not allow this request with login" });
        } else {
            var Activity_ref = db.collection("Contracts");

            if (!req.body.clientId) { req.body.clientId = ""; }
            if (!req.body.title) { req.body.title = ""; }
            if (!req.body.date) { req.body.date = ""; }
            if (!req.body.link) { req.body.link = ""; }

            var result = false;

            Activity_ref.doc(req.body.id).set({

                clientId: req.body.clientId,
                title: req.body.title,
                date: req.body.date,
                link: req.body.link,
            });
            res.status(200).send({ "status": "success", "message": "Contracts data updated" });
        }
    });

    app.post('/DeletContracts', function (req, res) {
        sess = req.session.email;
        if (!sess) {
            res.status(400).send({ "status": "Error", data: "Login", "message": "You can not allow this request with login" });
        }
        else {
            var Activity_ref = db.collection("Contracts").doc(req.body.id).delete();

            res.status(200).send({ "status": "success", "message": "Contracts data Deleted" });
        }
    });


    //Add Timer
    app.post('/AddTimer', function (req, res) {
        sess = req.session.email;
        if (!sess) {
            res.status(400).send({ "status": "Error", data: "Login", "message": "You can not allow this request with login" });
        } else {
            console.log(req.body);
            var Activitys_ref = db.collection("Timer");

            if (!req.body.clientId) { req.body.clientId = ""; }
            if (!req.body.time) { req.body.time = ""; }
            if (!req.body.date) { req.body.date = ""; }
            if (!req.body.rate) { req.body.rate = ""; }

            Activitys_ref.doc().set({

                clientId: req.body.clientId,
                time: req.body.time,
                date: req.body.date,
                rate: req.body.rate,

            });

            res.status(200).send({ "status": "success", "message": "Contracts added successfully" });
        }
    });


    //User Side

    //get client and user by Id
    app.get('/getAllContractAssignByAdmin', function (req, res) {
        sess = req.session.email;
        if (!sess) {
            res.status(400).send({ "status": "Error", data: "Login", "message": "You can not allow this request with login" });
        } else {
            var result = false;
            var users_ref = db.collection("Contracts");
            var query = users_ref.where('clientId', '==', req.query.id).get()
                .then(snapshot => {
                    var lstContracts = {};

                    snapshot.forEach(doc => {
                        result = true;
                        lstContracts[doc.id] = [];
                        lstContracts[doc.id].push(doc.data());

                    });
                    res.status(200).send({ status: "success", data: JSON.stringify(lstContracts), message: "Data load successfully" });

                }
                    , function (error) {
                        // Something went wrong.
                        console.error(error);
                        res.status(400).send({ "status": "error", "message": "Data load fail" });
                    });
        }
    });

    //get UserProfile Data
    app.get('/getUserParticularUser', function (req, res) {
        sess = req.session.email;
        if (!sess) {
            res.status(400).send({ "status": "Error", data: "Login", "message": "You can not allow this request with login" });
        }
        else {
            var result = false;

            var users_ref = db.collection("users").doc(req.query.id);

            var getDoc = users_ref.get()
                .then(doc => {
                    doc.id = doc.data().id;
                    if (!doc.exists) {
                        res.status(400).send({ "status": "error", "message": "Data load fail" });
                    } else {

                        res.status(200).send({ status: "success", data: JSON.stringify(doc.data()), message: "Data get successfully" });

                    }
                })
        }
    });

    //Add Account
    app.post('/AddAccounts', function (req, res) {
        sess = req.session.email;
        if (!sess) {
            res.status(400).send({ "status": "Error", data: "Login", "message": "You can not allow this request with login" });
        }
        else {
            var Activitys_ref = db.collection("Accounts");

            if (!req.body.clientId) { req.body.clientId = ""; }
            if (!req.body.title) { req.body.title = ""; }
            if (!req.body.AccountUserName) { req.body.AccountUserName = ""; }
            if (!req.body.AccountPassword) { req.body.AccountPassword = ""; }

            Activitys_ref.doc().set({

                clientId: req.body.clientId,
                title: req.body.title,
                AccountUserName: req.body.AccountUserName,
                AccountPassword: req.body.AccountPassword,

            });

            res.status(200).send({ "status": "success", "message": "Contracts added successfully" });
        }
    });

    //get all Account 
    app.get('/get_All_Accounts', function (req, res) {
        sess = req.session.email;
        if (!sess) {
            res.status(400).send({ "status": "Error", data: "Login", "message": "You can not allow this request with login" });
        }
        else {
            var result = false;
            var users_ref = db.collection("Accounts");
            var query = users_ref.get()
                .then(snapshot => {
                    var lstContract = {};

                    snapshot.forEach(doc => {
                        result = true;
                        lstContract[doc.id] = [];
                        lstContract[doc.id].push(doc.data());

                    });
                    res.status(200).send({ status: "success", data: JSON.stringify(lstContract), message: "Data load successfully" });

                }
                    , function (error) {
                        // Something went wrong.
                        console.error(error);
                        res.status(400).send({ "status": "error", "message": "Data load fail" });
                    });
        }
    });

    //get Account by Id
    app.get('/getAccountsById', function (req, res) {
        sess = req.session.email;
        if (!sess) {
            res.status(400).send({ "status": "Error", data: "Login", "message": "You can not allow this request with login" });
        }
        else {
            var result = false;
            var contact_info_ref = db.collection("Accounts").doc(req.query.id);

            var getDoc = contact_info_ref.get()
                .then(doc => {
                    if (!doc.exists) {
                        res.status(400).send({ "status": "error", "message": "Data load fail" });
                    } else {
                        res.status(200).send({ status: "success", data: JSON.stringify(doc.data()), message: "Data get successfully" });

                    }
                })
        }
    });

    //Edit Account
    app.post('/EditAccounts', function (req, res) {
        sess = req.session.email;
        if (!sess) {
            res.status(400).send({ "status": "Error", data: "Login", "message": "You can not allow this request with login" });
        }
        else {
            var Activity_ref = db.collection("Accounts");

            if (!req.body.clientId) { req.body.clientId = ""; }
            if (!req.body.title) { req.body.title = ""; }
            if (!req.body.AccountUserName) { req.body.AccountUserName = ""; }
            if (!req.body.AccountPassword) { req.body.AccountPassword = ""; }

            var result = false;

            Activity_ref.doc(req.body.id).set({

                clientId: req.body.clientId,
                title: req.body.title,
                AccountUserName: req.body.AccountUserName,
                AccountPassword: req.body.AccountPassword,
            });
            res.status(200).send({ "status": "success", "message": "Accounts data updated" });
        }
    });

    //get client and user by Id
    app.get('/getAllAccountAssignByAdmin', function (req, res) {
        sess = req.session.email;
        if (!sess) {
            res.status(400).send({ "status": "Error", data: "Login", "message": "You can not allow this request with login" });
        }
        else {
            var result = false;
            var users_ref = db.collection("Accounts");
            var query = users_ref.where('clientId', '==', req.query.id).get()
                .then(snapshot => {
                    var lstContracts = {};

                    snapshot.forEach(doc => {
                        result = true;
                        lstContracts[doc.id] = [];
                        lstContracts[doc.id].push(doc.data());

                    });
                    res.status(200).send({ status: "success", data: JSON.stringify(lstContracts), message: "Data load successfully" });

                }
                    , function (error) {
                        // Something went wrong.
                        console.error(error);
                        res.status(400).send({ "status": "error", "message": "Data load fail" });
                    });
        }
    });

    //Get Timer data by userwise
    app.get('/getAllTimerAssignByAdmin', function (req, res) {
        sess = req.session.email;
        if (!sess) {
            res.status(400).send({ "status": "Error", data: "Login", "message": "You can not allow this request with login" });
        }
        else {
            var result = false;
            var users_ref = db.collection("Timer");
            var query = users_ref.where('clientId', '==', req.query.id).get()
                .then(snapshot => {
                    var lstContracts = {};

                    snapshot.forEach(doc => {
                        result = true;
                        lstContracts[doc.id] = [];
                        lstContracts[doc.id].push(doc.data());

                    });
                    res.status(200).send({ status: "success", data: JSON.stringify(lstContracts), message: "Data load successfully" });

                }
                    , function (error) {
                        // Something went wrong.
                        console.error(error);
                        res.status(400).send({ "status": "error", "message": "Data load fail" });
                    });
        }
    });

    app.get('/getAllTimerByUser', function (req, res) {
        sess = req.session.email;
        if (!sess) {
            res.status(400).send({ "status": "Error", data: "Login", "message": "You can not allow this request with login" });
        }
        else {
            var result = false;
            var users_ref = db.collection("Timer");
            var query = users_ref.orderBy('clientId').get()
                .then(snapshot => {
                   
                    var lstContracts = [];

                    snapshot.forEach(doc => {
                        
                        result = true;
                       
                        lstContracts.push(doc.data());

                    });
                    res.status(200).send({ status: "success", data: JSON.stringify(lstContracts), message: "Data load successfully" });

                }
                    , function (error) {
                        // Something went wrong.
                        console.error(error);
                        res.status(400).send({ "status": "error", "message": "Data load fail" });
                    });
        }
    });
}

module.exports = appRouter;