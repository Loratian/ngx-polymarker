import { Injectable } from '@angular/core';
import { Polygon } from './Interfaces/polygon.interface';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NgxPolymarkerService {
  private newPolygonSubject: Subject<Polygon> = new Subject<Polygon>(); 
  private selectedFontFamily: string = 'Arial' // default font-family

  constructor() { }

  // Font Methods
  setFontFamily(fontFamily: string) {
    this.selectedFontFamily = fontFamily;
  }

  getFontFamily(): string {
    return this.selectedFontFamily;
  }

  createPolygon(polygon: Polygon): void {
    this.newPolygonSubject.next(polygon); // Emit the newly created polygon
  }

  // Polygons
  getNewPolygonObservable(): Subject<Polygon> {
    return this.newPolygonSubject;
  }
 
}
