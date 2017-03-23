var app = require('http').createServer(handler)
        , io = require('socket.io').listen(app)
        , fs = require('fs');
var port = process.env.PORT || 3000;

app.listen(port, function () {
    console.log('starting at 3000');
});

var clients = [];

function handler(req, res) {
    fs.readFile(__dirname + '/index.html',
            function (err, data) {
                if (err) {
                    res.writeHead(500);
                    return res.end('Error loading index.html');
                }

                res.writeHead(200);
                res.end(data);
            });
}

io.sockets.on('connection', function (socket) {

    socket.on('add-user', function (data) {
        clients.push({'username': data.username, 'socid': socket.id});
        console.log('clients : ', clients);
        //clients.splice(clients.indexOf(socket.username), 1);

        update_users();
    });

    socket.on('private-message', function (data) {
        console.log("Sending: " + data.content + " to " + data.username);
        //var uni = data.username;
        for (var i in clients) {
            console.log('socid: ' + clients[i].socid);
            console.log('uname: ' + clients[i].username);
            //socket.emit('get_users', {username: rows[i].username, soc_id: rows[i].soc_id});
            if (data.username == clients[i].username) {
                io.sockets.connected[clients[i].socid].emit("add-message", data);
                break;
            }
//            else {
//                console.log("User does not exist: " + data.username);
//            }
        }
        io.sockets.connected[socket.id].emit("own_message", data);
//        if (clients.username == data.username) {
//            console.log(clients.username.socket);
//            io.sockets.connected[clients.socket].emit("add-message", data);
//        } else {
//            console.log("User does not exist: " + data.username);
//        }
    });

    //Removing the socket on disconnect
    socket.on('disconnect', function () {
        for (var ki in clients) {
            if (clients[ki].socid === socket.id) {
                delete clients[ki];
                break;
            }
        }
        update_users();
    })

    function update_users() {
        io.emit('users_list', {users: clients});
    }

});



