"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(id, name, email, password, userStatus = 'Active', role = "user") {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.userStatus = userStatus;
        this.role = role;
    }
}
exports.User = User;
