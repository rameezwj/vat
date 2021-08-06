import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

	_a = 12345;

	private internalConnectionChanged = new Subject<boolean>();

	test() {
	  return this.internalConnectionChanged.asObservable();
	}

  constructor() {
  	setTimeout(()=>{
  		this._a = 10;
  	}, 5000);
  }

  print(){

  	return new Observable((observer)=>{
  		observer.next('1');

  		setInterval(()=>{
  			// observer.next('done');
  		}, 1000)
  	});

  	// console.log('printed');
  }
}
