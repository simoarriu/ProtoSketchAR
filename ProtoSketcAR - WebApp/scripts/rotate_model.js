function rotate_function() {
        
          // Prendo il centro della canvas, i tre punti che definiscono i gizmo
          function renderAxis(center, point_X, point_Y, point_Z,drawingContext){
            
              drawingContext.lineWidth = 5;
              
              // Disegno di rosso l'asse X e definisco un rettangolo alla fine della linea
              drawingContext.strokeStyle = "red";
            
              drawingContext.beginPath();
              drawingContext.moveTo(center.getX, center.getY);
              drawingContext.lineTo(point_X.getX, point_X.getY);
              drawingContext.fillStyle = 'red';
              drawingContext.fillRect(point_X.getX-10,point_X.getY-10,20,20); 
              drawingContext.stroke();
              
              // Verde per l'asse Y
              drawingContext.strokeStyle = "green";

              drawingContext.beginPath();
              drawingContext.moveTo(center.getX, center.getY);
              drawingContext.lineTo(point_Y.getX, point_Y.getY);
              drawingContext.fillStyle = 'green';
              drawingContext.fillRect(point_Y.getX-10,point_Y.getY-10,20,20); 
              drawingContext.stroke();

              // Blu per l'asse Z
              drawingContext.strokeStyle = "blue";
              
              drawingContext.beginPath();
              drawingContext.moveTo(center.getX, center.getY);
              drawingContext.lineTo(point_Z.getX, point_Z.getY);
              drawingContext.fillStyle = 'blue';
              drawingContext.fillRect(point_Z.getX-10,point_Z.getY-10,20,20); 
              drawingContext.stroke();    
            
              drawingContext.lineWidth = width_stroke;
            
          }
        
        
            // funzione definita per effettuare il render del modello nella canvas
            function render(objects, ctx, dx, dy, flag) {
                            
              // Clear the previous frame
              ctx.clearRect(0, 0, 2*dx, 2*dy);
              ctx.globalAlpha = 0.2;
              ctx.fillStyle = "#dbceed";
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.lineCap = 'round';
              
              // risetto il tratto a opacità massima
              ctx.globalAlpha = 1;

              // Per ogni oggetto
              for (var i = 0, n_obj = objects.length; i < n_obj; i++) {
                flag = false;
                
                // imposto il rispettivo colore del modello e la dimensione del tratto
                ctx.strokeStyle = objects[i].getColor;
                ctx.lineWidth = objects[i].getSize;
                
                // Per ogni linea dell'i-esimo modello
                for (var j = 0, n_lines = objects[i].getLines.length; j < n_lines; j++) {
                  
                  // Linea corrente
                  var line = objects[i].getLine(j);

                  // Prendo il primo vertice
                  var V = new Vertex3D(line[0].getX,line[0].getY,line[0].getZ)
                  ctx.beginPath();
                  ctx.moveTo(V.getX, V.getY);
                  
                  // Disegna i restanti vertici
                  for (var k = 1, n_vertices = line.length; k < n_vertices; k++) {
                    V = new Vertex3D(line[k].getX,line[k].getY,line[k].getZ)
                    ctx.lineTo(V.getX, V.getY);
                  }

                  // Close the path (serve?) and draw
                  //ctx.closePath();
                  ctx.stroke();

                }
              }
            }
        
        
        // in questo caso devo disabilitare la possibilità di disegnare sulla canvas, altrimenti l'evento per ruotare l'oggetto si
        // aggiunge a quello per disegnare
        paintMode = false;    
        
        // modifico il testo nel bottone per far capire se la rotazione è abilitata o disabilitata
        if(rotate_button.innerHTML == "Rotate: OFF")
        {
          
          

        (function() {
          
          c++;
          
          // se b è true, vuol dire che sto eseguendo una rotazione classica, dunque abilito
          // il tasto Rotate: ON e disabilito dunque i bottoni undo/redo
            
          if(b)
          {
              //console.log("Non entro da undo");
              rotate_button.innerHTML = "Rotate: ON"; 
              
              if(undo_button.innerHTML == "Undo")
              {
                undo_button.style.visibility = "hidden";
              }
              
              if(redo_button.innerHTML == "Redo")
                redo_button.style.visibility = "hidden";
            
             
          }
          else
          {
            // altrimenti sto entrando da undo per aggiungere l'ultimo tratto agli oggetti per poter fare subito redo
            // e dunque entro sulla funzione della rotazione ma posso ancora disegnare e non posso ruotare
            console.log("Entro da undo");
            paintMode = true;
          }        
     
             // setto nuovamente b a true
           b = true;
            

          // Quando clicco sul bottone rotate, vengono eseguite le istruzioni a partire da qua
          // prendo il centro della canvas
          var dx = canvas.width / 2;
          var dy = canvas.height / 2;
          
          // Imposto un punto che identifica il centro della canvas, che sarà il punto di riferimento per la rotazione del modello
          var center = new Vertex3D(dx, dy, 0);  
          
          // flag per il test del pixel verde
          let flag = false;
          
          // inizialmente l'asse z è nullo, in quanto ho solamente il disegno 2D appena creato sulla canvas
          var z_axis = 0;
          
          // La prima volta che clicco su rotate, definisco i vertici per i gizmo
          if(c==1)
          {
                point_X= new Vertex3D(dx+170, dy, 0);
                point_Y= new Vertex3D(dx, dy-170, 0);
                point_Z= new Vertex3D(dx, dy, 170);
          }
     
          
          // Per ogni linea disegnata contenuta all'interno di vector_models
          for(var i=0; i<vector_models.length;i++)
          {
                // prendo l'i-esima linea
                var l = vector_models[i];
            
                
                // se sto analizzando modelli successivi, allora questi dovranno avere un asse delle z diverso, altrimenti non 
                // è possibile disegnare in prospettiva. L'idea è quella di prendere l'asse z del punto più vicino nel modello
               // già presente (controlla bene se funziona anche disegnando due modelli e poi disegnare in prospettiva)
                if(objects.length >= 1)
                {
                    
                    // ne identifico le coordinare
                    var x_first_point = l.getPoint(0).x;
                    var y_first_point = l.getPoint(0).y;
                    
                    // booleano usato per trovare il punto più vicino al primo punto del nuovo modello preso in considerazione
                    let found_vertex = false;
                    
                    // per ogni oggetto presente e per ogni linea che lo compone
                    for (var p = 0, n_obj = objects.length; p < n_obj; p++) {
                      for (var j = 0, n_lines = objects[p].getLines.length; j < n_lines; j++) {
                        
                        // identifico la linea corrente
                        var line = objects[p].getLine(j);
                        
                        // controllo se, presi i due vertici della linea corrente, questi siano vicini alla x e alla y del primo punto del nuovo modello
                        for(k=0; k < line.length && !found_vertex; k++)
                        {
                            var V = new Vertex3D(line[k].getX,line[k].getY,line[k].getZ);                       
    
                            // identifico un range di +/- 2 per le coordinate
                            if((V.getX-5) <= x_first_point && (V.getX+5) >= x_first_point && (V.getY-5) <= y_first_point && (V.getY+5) >= y_first_point)
                            {
                 
                                // salvo il nuovo valore di z
                                console.log("Vertex found");
                                
                                z_axis = V.getZ;
                                console.log("X: " + V.getX + " Y: " + V.getY + " Z: "+ V.getZ);
                                found_vertex = true;
                    
                            }
                        }    
                      }}
                    
                    // se non c'è nessun punto vicino, allora z_Axis sarà 0
                    // creo il nuovo modello con l'asse z appena identificato
                    var model = new ModelRotate(l.getPoints,center,z_axis,l.getColor,l.getSize);
                }
                // se sto analizzando il primo modello, allora questo viene creato con asse z pari a 0
                else
                    var model = new ModelRotate(l.getPoints,center,z_axis,l.getColor,l.getSize);
              
              // inserisco il modello nella lista degli oggetti
              objects.push(model);
                
              // Eseguo il render degli oggetti
              render(objects, drawingContext, dx, dy, flag);      
            
            // Eseguo il render dei gizmos
            if(!paintMode)              
              renderAxis(center, point_X, point_Y, point_Z, drawingContext);      
                  
        
          }
          // Events
          var mousedown = false;
          var mx = 0;
          var my = 0;
          
          // definisco gli eventi per la rotazione dell'oggetto nella canvas
          canvas.addEventListener('touchstart', initMove);
          canvas.addEventListener('touchmove', move);
          canvas.addEventListener('touchend', stopMove);

          // Funzione per la fase di inizializzazione del movimento
          function initMove(evt) {
            
            // procedo solamente se paintmode è settato a false, dunque non posso disegnare
            // identifico le coordinate del tocco
            if(!paintMode)
            {
              mousedown = true;
              mx = evt.touches[0].pageX - canvas.offsetLeft;
              my = evt.touches[0].pageY - canvas.offsetTop;
            }
     
          }
          
          // Funzione che gestisce lo spostamento nella canvas
          function move(evt) {
            
            if(!paintMode){
              if (mousedown) {
                
                // identifico le coordinate del tocco
                x = evt.touches[0].pageX - canvas.offsetLeft;
                y = evt.touches[0].pageY - canvas.offsetTop;
                
                // calcolo theha e phi per la rotazione
                var theta = (x - mx) * Math.PI / 360;
                var phi = (y - my) * Math.PI / 180; 

                // ruoto ogni vertice di ogni oggetto nella canvas
                for(var j = 0; j < objects.length; j++)
                  for (var i = 0; i < objects[j].getVertices.length; ++i)
                    objects[j].getVertex(i).rotateVertex(center, theta, phi);
                    

                // Assieme all'oggetto disegnato nella canvas, ruoto anche i punti dei gizmo                
                point_X.rotateVertex(center, theta, phi);
                point_Y.rotateVertex(center, theta, phi);
                point_Z.rotateVertex(center, theta, phi);


                mx = evt.touches[0].pageX - canvas.offsetLeft;
                my = evt.touches[0].pageY - canvas.offsetTop;
                
                // effettuo il render
                render(objects, drawingContext, dx, dy,flag);
                // render dei gizmo
                renderAxis(center, point_X, point_Y, point_Z, drawingContext);
              }
            }
          }
          
          // termino la rotaizone
          function stopMove() {
              if(!paintMode){
                mousedown = false;
              }    
           
          }

        })();
        }          
        else
        {
          // nel caso in cui il testo sia impostato su ON, allora disattivo la rotazione
          rotate_button.innerHTML = "Rotate: OFF";   
          
          // se ho oggetti nella canvas, allora permetto di eseguire l'undo una volta disattivata la rotazione
          if(objects.length > 0)
            {
              if(undo_button.innerHTML == "Undo")
                undo_button.style.visibility = "visible";
            }
            
            
          // prendo il centro della canvas
          var dx = canvas.width / 2;
          var dy = canvas.height / 2;
          
          // quando disattivo la rotazione della canvas, voglio che i gizmo spariscano, dunque
          // cancello la canvas e disegno solamente gli oggetti
          drawingContext.clearRect(0, 0, 2*dx, 2*dy);
          drawingContext.globalAlpha = 0.2;
          drawingContext.fillStyle = "#dbceed";
          drawingContext.fillRect(0, 0, canvas.width, canvas.height);
          
          console.log("Size rotate off: " + drawingContext.lineWidth);
          
          render(objects, drawingContext, dx, dy, false);
          
          // abilito nuovamente la possibilità di disegnare
          paintMode = true;
          // svuoto vector_models per i nuovi disegni dell'utente
          vector_models = [];
          // svuoto la lista undo/redo
          undo_redo_list = [];
          
        }      
      };