"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketIoAdapter = void 0;
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
class SocketIoAdapter extends platform_socket_io_1.IoAdapter {
    corsOrigin;
    constructor(appOrHttpServer, corsOrigin = 'http://localhost:5173') {
        super(appOrHttpServer);
        this.corsOrigin = corsOrigin;
    }
    createIOServer(port, options) {
        const opts = {
            ...options,
            cors: {
                origin: this.corsOrigin,
                methods: ['GET', 'POST'],
                credentials: true,
            },
        };
        return super.createIOServer(port, opts);
    }
}
exports.SocketIoAdapter = SocketIoAdapter;
//# sourceMappingURL=socket-io.adapter.js.map