const http = require('http');

const server = http.createServer((req, res) => {
    //   console.log(req.url, req.method, req.headers);
    const url = req.url;
    const method = req.method;

    if (url === '/') {
        res.setHeader('Content-Type', 'text/html');
        res.write('<html>')
        res.write('<head>My Page</head><body><p>My first html from node server</p></body>')
        res.write('/<html>')
        res.end();
    }

    else if (url === '/users') {

        res.setHeader('Content-Type', 'text/html');
        res.write('<html>');
        res.write('<head>My Page</head>');
        res.write('<body><ul><li>users</li></ul></body>');
        res.write('/<html>')
        res.end();

    }
    else if (url === '/create-users') {

        if (method === 'POST') {
            const body = [];
            req.on('data', (chunk) => {
                body.push(chunk);
            });

            req.on('end', () => {
                let parsedBody = Buffer.concat(body).toString();
                console.log(parsedBody);
            });
            res.statusCode = 300;
            res.setHeader('Location', '/');
            return res.end()
        }

        res.setHeader('Content-Type', 'text/html');
        res.write('<html>');
        res.write('<head>My Page</head>');
        res.write('<body><ul><li>users</li></ul> <form action="create-users" method="POST"><input type="text" name="username"> <input type="submit" value="send"></form></body>');
        res.write('/<html>')
        res.end();

    }


    //process.exit();
})

server.listen(3000);