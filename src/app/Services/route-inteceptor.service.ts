import { Injectable } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import {
  ActivatedRoute,
  Router, NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
  RouteConfigLoadStart,
  RouteConfigLoadEnd,
  RoutesRecognized
} from '@angular/router';

/**
 * This service intercepts all routing requests going through Angular.
 * Source: https://codereview.stackexchange.com/questions/161783/angular2-route-interceptor
 */
@Injectable({
  providedIn: 'root'
})
export class RouteInteceptorService {
  private events: Map<RouteInterceptorEvents, Observable<Event>> = new Map();
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this._populateEventMap();
  }
  /**
   * Signs up a callback for when navigation starts.
   * @param callback The callback function to invoke.
   */
  onNavigationStart(callback: (router: ActivatedRoute) => void): Subscription {
    return this._getRouteOn(RouteInterceptorEvents.NavigationStart, callback);
  }

  /**
   * Signs up a callback for when navigation ends.
   * @param callback The callback function to invoke.
   */
  onNavigationEnd(callback: (router: ActivatedRoute) => void): Subscription {
    return this._getRouteOn(RouteInterceptorEvents.NavigationEnd, callback);
  }

  /**
   * Signs up a callback for when navigation is cancelled.
   * @param callback The callback function to invoke.
   */
  onNavigationCancel(callback: (router: ActivatedRoute) => void): Subscription {
    return this._getRouteOn(RouteInterceptorEvents.NavigationCancel, callback);
  }

  /**
   * Signs up a callback for when navigation errors.
   * @param callback The callback function to invoke.
   */
  onNavigationError(callback: (router: ActivatedRoute) => void): Subscription {
    return this._getRouteOn(RouteInterceptorEvents.NavigationError, callback);
  }

  /**
   * Signs up a callback for when configuration load starts.
   * @param callback The callback function to invoke.
   */
  onConfigLoadStart(callback: (router: ActivatedRoute) => void): Subscription {
    return this._getRouteOn(RouteInterceptorEvents.ConfigLoadStart, callback);
  }

  /**
   * Signs up a callback for when configuration load ends.
   * @param callback The callback function to invoke.
   */
  onConfigLoadEnd(callback: (router: ActivatedRoute) => void): Subscription {
    return this._getRouteOn(RouteInterceptorEvents.ConfigLoadEnd, callback);
  }

  /**
   * Signs up a callback for when the route is recongized.
   * @param callback The callback function to invoke.
   */
  onRouteRecognized(callback: (router: ActivatedRoute) => void): Subscription {
    return this._getRouteOn(RouteInterceptorEvents.RouteRecognized, callback);
  }

  private _getRouteOn(
    eventType: RouteInterceptorEvents,
    callback: (router: ActivatedRoute) => void
  ): Subscription {
    return this.events[eventType]
      // By returning a new Object (this.activatedRoute) into the stream, we
      // essentially swap what we're observing.
      // At this point we only run .map() if the filtered event (this.events[eventType])
      // successfully returns the event, meaning the event of 'eventType' has been triggered.
      .map(() => this.activatedRoute)
      // Traverse the state tree to find the last activated route, and then
      // return it to the stream. Doing this allows us to dive into the 'children'
      // property of the routes config to fetch the corresponding page title(s).
      .map(route => {
        while (route.firstChild) {
          route = route.firstChild;
          return route;
        }
      })
      // Filter un-named (primary) router outlets only.
      .filter(route => route.outlet === 'primary')
      .subscribe(route => callback(route));
  }

  private _populateEventMap() {
    const events = this.events;
    const routerEvents = this.router.events;
    events[RouteInterceptorEvents.NavigationStart] = routerEvents.pipe(
      filter(event => event instanceof NavigationStart)
    ).subscribe(x => console.log(x));
    events[RouteInterceptorEvents.NavigationEnd] = routerEvents.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(x => console.log(x));
    events[RouteInterceptorEvents.NavigationCancel] = routerEvents.pipe(
      filter(event => event instanceof NavigationCancel)
    ).subscribe(x => console.log(x));
    events[RouteInterceptorEvents.NavigationError] = routerEvents.pipe(
      filter(event => event instanceof NavigationError)
    ).subscribe(x => console.log(x));
    events[RouteInterceptorEvents.ConfigLoadStart] = routerEvents.pipe(
      filter(event => event instanceof RouteConfigLoadStart)
    ).subscribe(x => console.log(x));
    events[RouteInterceptorEvents.ConfigLoadEnd] = routerEvents.pipe(
      filter(event => event instanceof RouteConfigLoadEnd)
    ).subscribe(x => console.log(x));
    events[RouteInterceptorEvents.RouteRecognized] = routerEvents.pipe(
      filter(event => event instanceof RoutesRecognized)
    ).subscribe(x => console.log(x));
  }

}
enum RouteInterceptorEvents {
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
  ConfigLoadStart,
  ConfigLoadEnd,
  RouteRecognized
}
