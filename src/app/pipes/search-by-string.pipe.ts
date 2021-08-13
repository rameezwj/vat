import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchByString'
})
export class SearchByStringPipe implements PipeTransform {

  transform(value: any, ...args: any): any {
    return null;
  }

}
