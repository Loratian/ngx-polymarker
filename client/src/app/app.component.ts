import { Component, OnDestroy } from '@angular/core';
import { NgxPolymarkerService } from 'projects/ngx-polymarker/dist/ngx-polymarker';
import { CustomField, NamePosition, Polygon } from 'projects/ngx-polymarker/dist/ngx-polymarker/lib/Interfaces/polygon.interface';
import { Subscription } from 'rxjs';
import { Node } from 'projects/ngx-polymarker/dist/ngx-polymarker/lib/Interfaces/node.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  private newPolygonSubscription: Subscription; 
  latestPolygon: Polygon | undefined;
  polygons: Polygon[] = []; 
  title = 'client';

  constructor (private polymarkerService: NgxPolymarkerService) {
    this.polymarkerService.setFontFamily('Montserrat')
    this.newPolygonSubscription = this.polymarkerService.getNewPolygonObservable().subscribe(polygon => {
      const customFields: CustomField[] = [
        {label: "Kingdom Name", value: "Navaron"},
        {label: "Ruling House", value: "House of Navar"}
      ]

      polygon.customFields = customFields;

      this.polygons.push(polygon);
    })
  }

  ngOnDestroy() {
    this.newPolygonSubscription.unsubscribe();
  }
}