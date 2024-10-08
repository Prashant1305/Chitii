const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});

let current;
proxy.on('upgrade', function (req, socket, head) {
    console.log('WebSocket upgrade request');
    proxy.ws(req, socket, head);
});
proxy.on('error', (err, req, res) => {
    console.log('Proxy error:', err);
    res.status(500).json({ error: 'Proxy failed' });
});

const roundRobin = (servers, req, res) => {
    if (req.cookies.session_number) {
        current = req.cookies.session_number % servers.length;
    } else {
        current = 0;
        console.log("cokkies not available")
    }
    const target = servers[current];
    console.log(target);

    // proxy.web(req, res, { target: `http://${target.host}:${target.port}` });

    if (req.originalUrl.startsWith('/socket.io')) {
        console.log(`lb socket forwarded http://${target.host}:${target.port}`)
        proxy.ws(req, req.socket, { target: `http://${target.host}:${target.port}` });

    } else {
        proxy.web(req, res, { target: `http://${target.host}:${target.port}` });

    }

}

module.exports = roundRobin