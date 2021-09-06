// In questo script vengono definite le classi e i rispettivi metodi implementati

// Questa classe permette di definire un oggetto Vertex3D, composto dalle 3 coordinate x,y,z. Sono dichiarati i metodi
// di set e get per ogni coordinata, e in più è definito il metodo per ruotare il vertice in base alla matrice dei
// coefficienti e il movimento dell'utente sullo schermo
class Vertex3D {
  
  constructor(x, y, z)
  {
      this.x = parseFloat(x);
      this.y = parseFloat(y);
      this.z = parseFloat(z);
  }
  
  get getX()
  {
    return this.x;
  }
  
  get getY()
  {
    return this.y;
  }
  
  get getZ()
  {
    return this.z;
  }
  
  setX(x)
  {
    this.x = x;
  }
  
  setY(y)
  {
    this.y = y;
  }
  
  setZ(z)
  {
    this.z = z;
  }
  
  
  rotateVertex(center, theta, phi)
  {
        // Rotation matrix coefficients
       var ct = Math.cos(theta);
       var st = Math.sin(theta);
       var cp = Math.cos(phi);
       var sp = Math.sin(phi);

        // Rotation
       var x = this.getX - center.getX;
       var y = this.getY - center.getY;
       var z = this.getZ - center.getZ;


       this.setX(ct * x - st * cp * y + st * sp * z + center.getX);          
       this.setY(st * x + ct * cp * y - ct * sp * z + center.getY);
       this.setZ(sp * y + cp * z + center.getZ);

  }
  
}
 
// Questa classe permette di definire un modello/linea che viene ruotato, dunque nel costruttore definiamo un vettore 
// contenente i punti del tratto (points_rotation), il centro della canvas, l'asse z per la profondità del tratto su una
// canvas 2D, il colore e dimensione del tratto. Il modello è composto anche da una lista di Vertex3D e di linee composte da un array
// per collegare il vertice in posizione i con quello in posizione i+1. Sono poi definiti tutti i metodi get e set
class ModelRotate
{
  constructor(points_rotation,center, z_axis, color,size) {
    this.points_rotation = points_rotation;
    this.center = center;
    this.z_axis = z_axis;
    this.color = color;
    this.size = size;
    
    var tmp = [];

    for(var i = 0; i < points_rotation.length; i++)
    {
      tmp.push(new Vertex3D(points_rotation[i].x, points_rotation[i].y,z_axis));
    }

    // assegno tmp al modello
    this.vertices = tmp;

    // faccio la stessa cosa per creare delle linee, composte da coppie consecutive di punti
    var tmp_line = [];

    for(var i=0; i < this.vertices.length-1; i++)
    {
      tmp_line.push(new Array(this.vertices[i],this.vertices[i+1]));
    }

    // Generate the lines
    this.lines = tmp_line;   
    
  }
  
  get getSize()
  {
    return this.size;
  }
  
  setSize(size)
  {
    this.size = size;
  }
  
  get getColor()
  {
    return this.color;
  }
  
  setColor(hex)
  {
    this.color = hex;
  }
  
  get getLines(){
    return this.lines;
  }
  
  getLine(i)
  {
    return this.lines[i];
  }
  
  get getVertices(){
    return this.vertices;
  }
  
  getVertex(i)
  {
    return this.vertices[i];
  }
  
}       

// Classe per creare oggetti Line, ovvero i tratti che sono disegnati sulla canvas, composti semplicemente da un vettore di punti
// che sono le coordinate dei punti rilevati sulla canvas, il colore scelto e la dimensione del tratto
class Line
{
  constructor(points, color, size)
  {
    this.points = points;
    this.color = color;
    this.size = size
  }
  
  get getSize()
  {
    return this.size;
  }
  
  setSize(size)
  {
    this.size = size;
  }
  
  get getPoints()
  {
    return this.points;
  }
  
  get getColor()
  {
    return this.color;
  }
  
  setColor(hex)
  {
    this.color = hex;
  }
  
  addPoint(x,y)
  {
    this.points.push(new THREE.Vector2(x, y))
  }
  
  getPoint(i)
  {
    return this.points[i];
  }

}