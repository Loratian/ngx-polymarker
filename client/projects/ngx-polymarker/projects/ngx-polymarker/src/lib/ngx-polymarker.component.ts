import { Component, Input } from '@angular/core';
import { Node } from './Interfaces/node.interface';
import { Polygon } from './Interfaces/polygon.interface';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { NgxPolymarkerService } from './ngx-polymarker.service';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import polylabel from 'polylabel';



@Component({
  selector: 'ngx-polymarker',
  templateUrl: 'ngx-polymarker.component.html',
  styleUrls: ['ngx-polymarker.component.css'],
  standalone: true,
  imports: [
    NgClass,
    NgFor,
    NgIf,
    FormsModule,
    ReactiveFormsModule
  ],
})

export class NgxPolymarkerComponent {
  @Input() polygonsIMP?: any[];
  @Input() imagePath?: string;

  activePolygon?: Polygon;
  editingPolygon: boolean = false;
  editedValue: string = '';
  fontFamily: string = '';

  polygonNodes: Node[] = [];
  tempPoints: string = '';
  creatingPolygon: boolean = false;
  mouseposition: { x: number, y: number } = { x: 0, y: 0 }
  tempPointActive: boolean = false;

  hoveredPolygon: number | null = null;
  snappingDistance: number = 10;
  cursorHoverPosition: number = 1;
  circleRadius: number = 2;

  showMenu: boolean = false

  constructor(private configService: NgxPolymarkerService, private fb: FormBuilder) {
    this.fontFamily = this.configService.getFontFamily();
    document.documentElement.style.setProperty('--selected-FontFamily', `'${this.fontFamily}', sans-serif`)
  }

  click() {
    if (this.creatingPolygon) {
      this.createPoint()
    }
  }

  doubleClick() {
    if (!this.creatingPolygon) {
      this.creatingPolygon = !this.creatingPolygon
      this.showMenu = false;
    }
    else if (this.creatingPolygon) {
      this.finalisePolygon();
    }
  }

  rightClick(event: MouseEvent) {
    event.preventDefault();
    if (this.creatingPolygon) {
      this.cancelPoint(event);
    }
    else {
      this.showMenu = false;
    }
  }

  createPoint() {
    this.polygonNodes.push(
      { x: this.mouseposition.x, y: this.mouseposition.y },
    )
    this.updatePolygon(this.mouseposition.x, this.mouseposition.y)
  }

  followMovement(event: MouseEvent) {
    if (this.creatingPolygon) {
      this.mouseposition.x = event.offsetX;
      this.mouseposition.y = event.offsetY;

      const snappedPoint = this.snapToPolygon(this.mouseposition.x, this.mouseposition.y);
      this.mouseposition.x = snappedPoint.x;
      this.mouseposition.y = snappedPoint.y;

      let allPoints = this.tempPoints.split(' ')

      if (allPoints.length >= 1) {

        if (this.tempPointActive) {
          allPoints.pop();
          allPoints.pop();
          this.tempPointActive = false;
        }

        this.tempPoints = allPoints.join(' ') + ' ';
        this.updatePolygon(this.mouseposition.x, this.mouseposition.y);
        this.tempPointActive = true;
      }

    }
  }

  updatePolygon(x: number, y: number) {
    const point = x + ',' + y + ' '
    this.tempPoints = this.tempPoints + point
  }

  finalisePolygon() {
    let allPoints = this.tempPoints.split(' ').filter(point => point !== '')
    allPoints.pop();
    allPoints.pop();
    this.polygonNodes.pop()
    this.tempPoints = allPoints.join(' ') + ' ';

    const polygonPoints: Node[] = allPoints.map(point => {
      const [xStr, yStr] = point.split(',');
      const x = parseFloat(xStr);
      const y = parseFloat(yStr);
      return { x, y };
    })

    const tempPoint: Node = {
      x: 1,
      y: 2
    }
    const pointstoadd: Node[] = [];
    pointstoadd.push(tempPoint)
    const vertices = this.getVertices(this.tempPoints);
    const middlePoint = this.getPolygonCenter(vertices)
    if (this.polygonsIMP) {
      const newPolygon: Polygon = {
        id: this.polygonsIMP.length + 1,
        nodes: polygonPoints,
        name: 'New Shape',
        position: {
          x: middlePoint.x,
          y: middlePoint.y,
          rotation: 190
        },
        description: 'Voer hier een description in',
        customFields: []
      }
      this.configService.createPolygon(newPolygon);
      this.creatingPolygon = false;
      this.tempPoints = '';
      this.polygonNodes = [];

      this.tempPointActive = false;
    }


  }

  cancelPoint(event: MouseEvent) {
    let allPoints = this.tempPoints.split(' ');
    allPoints.pop()
    allPoints.pop()
    this.polygonNodes.pop()

    allPoints = allPoints.filter((point) => point !== '')

    this.tempPoints = allPoints.join(' ') + ' ';

    if (allPoints.length < 1) {
      this.creatingPolygon = false;
      this.tempPointActive = false;
      this.tempPoints = '';
    }
    this.followMovement(event)
  }

  updateArea() {
    throw new Error('Method not implemented.');
  }

  pointInPolygon(x: number, y: number, vertices: Array<{ x: number, y: number }>): boolean {
    let inside = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const xi = vertices[i].x;
      const yi = vertices[i].y;
      const xj = vertices[j].x;
      const yj = vertices[j].y;

      const intersect = ((xi > y) !== (yj > y)) &&
        (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);

      if (intersect) {
        inside = !inside;
      }
    }
    return inside
  }

  polygonHovered(id: number) {
    this.hoveredPolygon = id;
  }

  polygonLeft(id: number) {
    setTimeout(() => {
      if (this.hoveredPolygon === id) {
        this.hoveredPolygon = null;
      }
    }, 100);

  }

  snapToPolygon(x: number, y: number): { x: number, y: number } {
    let minDistance = this.snappingDistance;
    let snapX = x;
    let snapY = y;

    this.cursorHoverPosition = 1;
    this.circleRadius = 2;
    if (this.polygonsIMP) {
      for (const polygon of this.polygonsIMP) {
        const vertices = this.getVertices(this.getNodeString(polygon.nodes));

        for (let i = 0; i < vertices.length - 1; i++) {
          const p1 = vertices[i];
          const p2 = vertices[i + 1];

          // Calculate the direction vector of the line segment
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;

          // Calculate the vector from p1 to the cursor
          const cx = x - p1.x;
          const cy = y - p1.y;

          // Calculate the dot product of the two vectors
          const dotProduct = (cx * dx + cy * dy) / (dx * dx + dy * dy);

          // Check if the point is on the line segment
          if (dotProduct >= 0 && dotProduct <= 1) {
            // Calculate the coordinates of the point on the line
            const onLineX = p1.x + dotProduct * dx;
            const onLineY = p1.y + dotProduct * dy;

            // Calculate the distance from the cursor to the point on the line
            const dist = this.distance(x, y, onLineX, onLineY);

            // If the distance is within the snap threshold and smaller than the minimum distance,
            // update the snap coordinates to the nearest point on the line segment
            if (dist <= this.snappingDistance && dist < minDistance) {
              minDistance = dist;
              snapX = onLineX;
              snapY = onLineY;
              this.cursorHoverPosition = 2;
              this.circleRadius = 3;
            }
          }
        }

        const currentMinDistance = this.snappingDistance;
        minDistance = 30;
        for (const corner of vertices) {
          // Calculate the distance from the cursor to the corner
          const dist = Math.sqrt((corner.x - x) ** 2 + (corner.y - y) ** 2)
          // If the distance is within the snap threshold and smaller than the minimum distance,
          // update the snap coordinates to the nearest corner
          if (dist <= this.snappingDistance && dist < minDistance) {
            minDistance = dist;
            snapX = corner.x;
            snapY = corner.y;
            this.cursorHoverPosition = 3;
            this.circleRadius = 3;
          }
        }

        minDistance = currentMinDistance;
      }
    }

    return { x: snapX, y: snapY };
  }

  distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  distanceToLine(x: number, y: number, x1: number, y1: number, x2: number, y2: number): number {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    const param = dot / len_sq;

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  getVertices(points: string): { x: number, y: number }[] {
    const coordinates = points.split(' ').filter(point => point !== '');
    coordinates.push(coordinates[0]);
    return coordinates.map(coord => {
      const [x, y] = coord.split(',').map(Number);
      return { x, y }
    })
  }

  getPolygonCenter(vertices: { x: number, y: number }[]): { x: number, y: number } {
    if (vertices.length === 0) {
      return { x: 0, y: 0 };
    }

    // Calculate the sum of x and y coordinates
    const sumX = vertices.reduce((acc, vertex) => acc + vertex.x, 0);
    const sumY = vertices.reduce((acc, vertex) => acc + vertex.y, 0);

    // Calculate the average x and y coordinates
    const centerX = sumX / vertices.length;
    const centerY = sumY / vertices.length;

    const middlePoint = { x: centerX, y: centerY }

    const isInside = this.checkIfInPolygon(middlePoint, vertices);

    if (!isInside) {
      this.repositionTextInPolygon(middlePoint, vertices)
    }

    return middlePoint;
  }

  checkIfInPolygon(point: { x: number; y: number }, vertices: { x: number; y: number }[]): boolean {
    let isInside = false;

    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const xi = vertices[i].x;
      const yi = vertices[i].y;
      const xj = vertices[j].x;
      const yj = vertices[j].y;

      const intersect = ((yi > point.y) !== (yj > point.y)) &&
        (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);

      if (intersect) {
        isInside = !isInside;
      }
    }

    return isInside;
  }

  repositionTextInPolygon(point: { x: number; y: number }, vertices: { x: number; y: number }[]): { x: number, y: number } {
    console.log(point)
    return { x: 2, y: 2 }
  }

  selectPolygon(polygon: Polygon) {
    if (!this.creatingPolygon) {
      this.activePolygon = polygon;
      this.showMenu = true;
    }
  }

  toggleEditingPolygon() {
    if (this.editingPolygon) {
      this.editingPolygon = !this.editingPolygon;
      this.saveChanges()
    }
    else {
      this.editingPolygon = !this.editingPolygon;
    }
  }

  saveChanges() {
    if (this.activePolygon && this.polygonsIMP) {
      const index = this.polygonsIMP?.findIndex(polygon => polygon.id == this.activePolygon?.id);
      this.polygonsIMP.splice(index, 1);
      this.configService.createPolygon(this.activePolygon);
      this.activePolygon = undefined;
    }
  }

  getNodeString(nodes: Node[]): string {
    if (nodes.length > 1) {
      let nodeString: string = '';
      nodes.forEach(splitNode => {
        const node: string = splitNode.x.toString() + ',' + splitNode.y.toString() + ' ';
        nodeString = nodeString + node
      });
      return nodeString;
    }
    else {
      return ''
    }
  }
}


