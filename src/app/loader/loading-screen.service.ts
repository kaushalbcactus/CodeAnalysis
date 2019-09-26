import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingScreenService {

  constructor() { }

  private _loading: boolean = false;
  public loadingStatus = new Subject<any>();

  get loading(): boolean {
    return this._loading;
  }

  set loading(value) {
    this._loading = value;
    this.loadingStatus.next(value);
  }

  startLoading() {
    this.loading = true;
  }

  stopLoading() {
    this.loading = false;
  }
}
