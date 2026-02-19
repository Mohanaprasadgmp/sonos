import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CcpEventsService } from '../services/ccp-events.service';

declare const connect: any;

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class Header implements OnInit {

  constructor(private ccpEvents: CcpEventsService) {}

  ngOnInit(): void {

  }

  signOut(): void {
   
  }
}
