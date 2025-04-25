export interface InputState {
    fullname:string,
    email:string,
    phoneNumber:string,
    password:string,
    role:string,
    file:File | null,
}

export interface ILoginState {
    email:string,
    password:string,
    role:string
}