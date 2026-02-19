// ccp-events.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface TranscriptSegment {
  speaker: 'AGENT' | 'CUSTOMER' | 'SYSTEM';
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class CcpEventsService {
  private callConnectedSubject = new BehaviorSubject<{ channel: string; value: string } | null>(null);
  private passCustomAttributesSubject = new BehaviorSubject<any | null>(null);
  private transcriptsSubject = new BehaviorSubject<TranscriptSegment[]>([]);
  private agentNameSubject = new BehaviorSubject<string>('');

  public incomingChannel: string = '';

  // Observable streams
  callConnected$ = this.callConnectedSubject.asObservable();
  passCustomAttributes$ = this.passCustomAttributesSubject.asObservable();
  transcripts$ = this.transcriptsSubject.asObservable();
  agentName$ = this.agentNameSubject.asObservable();

  notifyCallConnected(channel: string, value: string) {
    this.callConnectedSubject.next({ channel, value });
  }

  passCustomAttributes(attributes: any) {
    this.passCustomAttributesSubject.next(attributes);
  }

  notifyCallReset() {
    this.callConnectedSubject.next(null);
  }

  addTranscript(segment: TranscriptSegment) {
    this.transcriptsSubject.next([...this.transcriptsSubject.value, segment]);
  }

  clearTranscripts() {
    this.transcriptsSubject.next([]);
  }

  setAgentName(name: string) {
    this.agentNameSubject.next(name);
  }
}
