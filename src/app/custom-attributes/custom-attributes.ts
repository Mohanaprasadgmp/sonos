import { Component, ChangeDetectorRef } from '@angular/core';
import { CcpEventsService } from '../services/ccp-events.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'custom-attributes',
  imports: [CommonModule],
  templateUrl: './custom-attributes.html',
  styleUrl: './custom-attributes.scss',
})
export class CustomAttributes {
  attributes: { [key: string]: any } = {};
  hasData = false;
  isExpanded = true;

  toggleAttributes() {
    this.isExpanded = !this.isExpanded;
  }

  constructor(public eventService: CcpEventsService, private cdr: ChangeDetectorRef) {
    this.eventService.passCustomAttributes$.subscribe((attributes) => {
      if (attributes && Object.keys(attributes).length > 0) {
        console.log('Received custom attributes:', attributes);
        this.attributes = this.filterBuilderQuotationAndCallSummary(attributes);
        console.log('Attributes are : ', this.attributes);
        this.hasData = true;
      } else {
        console.log('No attributes received or empty');
        this.attributes = {};
        this.hasData = false;
      }
      this.cdr.detectChanges();
    });
  }

  filterBuilderQuotationAndCallSummary(data: any): any {
    console.log('filterBuilderQuotationAndCallSummary ', {
      CustomerLanguage: data.CustomerLanguage,
    });
    return {
      CustomerLanguage: data.CustomerLanguage,
    };
  }
}
