const express = require('express')
const deafultRouter = express.Router();
let users = [];

deafultRouter.get('/', (req, res, next) => {
    res.status(200).render('users-input', {
        pageTitle: 'startPage'
    });
})

deafultRouter.post('/users', (req, res, next) => {
    users.push({ username: req.body.username });
    res.status(200).render('users-list', {
        pageTitle: 'user-page',
        userlist: users
    });
})

module.exports = deafultRouter;


