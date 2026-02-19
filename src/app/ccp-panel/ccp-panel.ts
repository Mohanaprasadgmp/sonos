// ccp-panel.ts
import { Component, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CcpEventsService } from '../services/ccp-events.service';

declare const connect: any;

@Component({
  selector: 'ccp-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ccp-panel.html',
  styleUrls: ['./ccp-panel.scss'],
})
export class CcpPanel implements AfterViewInit, OnDestroy {
  private ws: WebSocket | null = null;
  private activeContactId: string | null = null;

  constructor(private ccpEvents: CcpEventsService, private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    if (typeof window === 'undefined' || typeof connect === 'undefined') return;

    connect.core.initCCP(document.getElementById('ccpContainer'), {
      ccpUrl: 'https://cct-lab-hexabanking.my.connect.aws/ccp-v2/',
      loginPopup: true,
      loginPopupAutoClose: true,
      softphone: { allowFramedSoftphone: true },
    });

    // Resolve the logged-in agent name once the CCP is ready
    connect.agent((agent: any) => {
      this.ngZone.run(() => this.ccpEvents.setAgentName(agent.getName() || ''));
    });

    connect.contact((contact: any) => {
      contact.onConnected(async () => {
        try {
          const attrs = await contact.getAttributes();
          const contactId = contact.getContactId();
          console.log('Call connected with attributes:', attrs);

          // Run all state updates inside the zone so Angular re-renders immediately
          this.ngZone.run(() => {
            this.ccpEvents.clearTranscripts();
            this.ccpEvents.passCustomAttributes(attrs);
          });

          this.activeContactId = contactId;
          this.startTranscript(contactId);
        } catch (e) {
          console.error('onConnected error:', e);
        }
      });

      contact.onRefresh(async () => {
        try {
          const attrs = await contact.getAttributes();
          console.log('Call Refreshed with attributes:', attrs);
        } catch (e) {
          console.error('getAttributes failed', e);
        }
      });

      // Call disconnected — stop polling but keep transcript visible (ACW)
      contact.onEnded(() => {
        this.stopTranscript();
        this.ngZone.run(() => this.ccpEvents.notifyCallReset());
        this.ccpEvents.passCustomAttributes({});
      });

      contact.onACW(() => {
        this.ngZone.run(() => this.ccpEvents.notifyCallReset());
        this.ccpEvents.passCustomAttributes({});
      });

      contact.onDestroy(() => {
        this.ngZone.run(() => this.ccpEvents.notifyCallReset());
      });
    });
  }

  private startTranscript(contactId: string): void {
    // Open WebSocket to the backend (same host)
    if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      this.ws = new WebSocket(`${protocol}//${window.location.host}`);

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'transcript') {
            this.ngZone.run(() => {
              this.ccpEvents.addTranscript({
                speaker: data.speaker,
                text: data.text,
              });
            });
          }
        } catch {
          // ignore malformed messages
        }
      };

      this.ws.onerror = (err) => console.error('[WebSocket] error:', err);
    }

    // Tell the backend to start polling Contact Lens for this contact
    fetch('/api/start-transcript', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactId }),
    }).catch((err) => console.error('[Transcript] start-transcript failed:', err));
  }

  private stopTranscript(): void {
    if (!this.activeContactId) return;
    fetch('/api/stop-transcript', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactId: this.activeContactId }),
    }).catch((err) => console.error('[Transcript] stop-transcript failed:', err));
    this.activeContactId = null;
  }

  ngOnDestroy(): void {
    this.stopTranscript();
    this.ws?.close();
  }
}
