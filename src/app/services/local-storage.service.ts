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
}