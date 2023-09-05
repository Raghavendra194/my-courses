const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const rootDir = require('./util/path');
const router = require('./routes/default-route');

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.urlencoded({ extended: false }))


app.use(router);
//app.use('/users', router.deafultRouter);


app.use('/', (req, res, next) => {
    res.status(404).render('404', { pageTitle: 'Page Not Found' });
});


app.listen(3000);



