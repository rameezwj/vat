import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InterationService {

	public splashMessageSource = new Subject<string>();
	splashMessage = this.splashMessageSource.asObservable();

  constructor() { }

  sendSplashMessage(message: string){
  	this.splashMessageSource.next(message);
  }
}
