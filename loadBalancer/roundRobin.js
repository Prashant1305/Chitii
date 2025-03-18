const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});

let currentForApi = 0;
proxy.on('upgrade', function (req, socket, head) {
    console.log('WebSocket upgrade request');
    // proxy.ws(req, socket, head,{ target: `http://${target.host}:${target.port}` });
});
proxy.on('error', (err, req, res) => {
    console.log('Proxy error:', err);
    if (res?.status) { // res is undefined for socket connection
        res.status(500).json({ error: 'Proxy failed' });
    }

});

const roundRobin = (servers, socket_servers, req, res) => {
    try {
        if (req.originalUrl.startsWith('/socket.io')) {
            // if (req.cookies.session_number) { // it will alway be there, as it is set by loadbalancer.js

            // }
            const currentForSocket = req.cookies.session_number % socket_servers.length;
            const target = socket_servers[currentForSocket];
            console.log("socket type", target);

            console.log(`lb socket forwarded http://${target.host}:${target.port}`)
            // proxy.ws(req, req.socket, { target: `http://${target.host}:${target.port}` });
            proxy.ws(req, req.socket, { target: `http://${target.host}:3013` });

        } else {

            const target = servers[currentForApi % servers.length];
            currentForApi++;
            // console.log("api type", target);
            // proxy.web(req, res, { target: `http://${target.host}:${target.port}` });
            console.log("api type 3004");

            proxy.web(req, res, { target: `http://${target.host}:3004` });

            currentForApi = currentForApi % 10000;

        }
    } catch (error) {
        console.log(error)
    }

}

module.exports = roundRobin