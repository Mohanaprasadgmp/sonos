import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CcpPanel } from './ccp-panel/ccp-panel';
import { Header } from './header/header';
import { CustomAttributes } from './custom-attributes/custom-attributes';
import { TranscriptPanel } from './transcript-panel/transcript-panel';

@Component({
  selector: 'app-root',
  imports: [CommonModule, CcpPanel, Header, CustomAttributes, TranscriptPanel],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'Angular-Agent-Screen-SWA';
  expandedSegment: string | null = null;
  activeTab: 'attributes' | 'transcript' = 'attributes';

  expandSegment(segment: string) {
    this.expandedSegment = segment;
  }
}
