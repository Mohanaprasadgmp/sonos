import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CcpEventsService, TranscriptSegment } from '../services/ccp-events.service';

@Component({
  selector: 'transcript-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transcript-panel.html',
  styleUrl: './transcript-panel.scss',
})
export class TranscriptPanel implements OnInit, AfterViewChecked {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  transcripts: TranscriptSegment[] = [];
  private shouldScroll = false;

  constructor(private ccpEvents: CcpEventsService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.ccpEvents.transcripts$.subscribe((segments) => {
      this.transcripts = segments;
      this.shouldScroll = true;
      this.cdr.detectChanges();
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll && this.scrollContainer) {
      const el = this.scrollContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.shouldScroll = false;
    }
  }
}
