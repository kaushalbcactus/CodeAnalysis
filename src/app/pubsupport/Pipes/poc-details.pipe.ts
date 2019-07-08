import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pocDetails'
})
export class PocDetailsPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    // console.log('value ', value);
    // console.log('args ', args.length);
    // tslint:disable-next-line:prefer-const
    let poc = args.find((pocData: any) => {
      if (pocData.ID === value) {
        return pocData;
      }
    });
    return poc.FName + ' ' + poc.LName;
  }

}
