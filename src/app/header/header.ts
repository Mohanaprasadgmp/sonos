import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class Header {
  agentStatus = 'Available';

  signOut() {
    console.log('User signed out');
  }
}
