import { Component, OnDestroy } from '@angular/core';
import { NgxPolymarkerService } from 'projects/ngx-polymarker/dist/ngx-polymarker';
import { NamePosition, Polygon } from 'projects/ngx-polymarker/dist/ngx-polymarker/lib/Interfaces/polygon.interface';
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
  polygons: ClientPolygon[] = []; 
  title = 'client';

  constructor (private polymarkerService: NgxPolymarkerService) {
    this.polymarkerService.setFontFamily('Montserrat')
    this.newPolygonSubscription = this.polymarkerService.getNewPolygonObservable().subscribe(polygon => {
      const newPolygon: ClientPolygon = {
        id: polygon.id,
        nodes: polygon.nodes,
        name: polygon.name,
        namePosition: polygon.position,
        description: polygon.description,
        customFields: [
          { label: "Capitol", value: "Navaron"},
          { label: "Ruler(s)", value: "House Navar"}
        ]
      }
      this.polygons.push(newPolygon);
      console.log(this.polygons)
    })
  }

  ngOnDestroy() {
    this.newPolygonSubscription.unsubscribe();
  }
}

export interface ClientPolygon {
  id: number,
  nodes: Node[]
  name: string; 
  namePosition: NamePosition;
  description: string;  
  customFields: CustomField[];
}

export interface CustomField {
  label: string,
  value: string
}