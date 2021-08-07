import {Injectable} from '@angular/core';


@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {
    thisUserKey = null;
    thisUserObject = {};

    constructor() {
    }

    getItem(keyName) {
        return JSON.parse(localStorage.getItem(keyName));
    }

    setItem(keyName, val) {
        localStorage.setItem(keyName, JSON.stringify(val));
    }

    logout() {
        localStorage.removeItem('user_info');
        localStorage.removeItem('status_login');
        localStorage.removeItem('customers');
        const loginRoute = `${window.location.protocol}//${window.location.host}/`;
        window.location.href = loginRoute;
    }
}