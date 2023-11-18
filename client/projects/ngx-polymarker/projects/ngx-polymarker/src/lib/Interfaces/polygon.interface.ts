import { Node } from "./node.interface";

export interface Polygon {
    id: number;
    nodes: Node[]
    name: string; 
    position: NamePosition;
    description: string; 
}

export interface NamePosition {
    x: number; 
    y: number; 
    rotation: number; 
}