// ccp-events.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CcpEventsService {
  private callConnectedSubject = new BehaviorSubject<{ channel: string; value: string } | null>(null);
  private passCustomAttributesSubject = new BehaviorSubject<any | null>(null);
  public incomingChannel : string = '';

  // Observable stream for components to subscribe to
  callConnected$ = this.callConnectedSubject.asObservable();
  passCustomAttributes$ = this.passCustomAttributesSubject.asObservable();

  // Method to notify when call is connected with email
  notifyCallConnected(channel: string, value: string) {
    this.callConnectedSubject.next({ channel, value });
  }

  passCustomAttributes(attributes: any) {
    // Logic to pass custom attributes
    this.passCustomAttributesSubject.next(attributes);
  }

  // Method to reset/clear the call state
  notifyCallReset() {
    this.callConnectedSubject.next(null);
  }
}