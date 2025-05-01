
export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  userStatus : "Active" | "Blocked";
  role: 'user' | 'admin';
  photo : string
}

export class User {
  constructor(
    public id: string | null,
    public name: string,
    public email: string,
    public password: string,
    public userStatus : "Active" | "Blocked" = 'Active',
    public role: "user" | "admin" = "user"
  ) {}
}

