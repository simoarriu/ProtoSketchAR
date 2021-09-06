function undoFunction() {
  
  // codice da eseguire per gestire l'undo classico, ovvero applicato sui tratti disegnati nella canvas
  if(undo_button.innerHTML == "Undo")
    {        
        let canvas = document.getElementById('source-canvas');
        let drawingContext = canvas.getContext( '2d' );
      
        // se clicco su undo, allora poi dovrò abilitare anche il bottone redo
        if(redo_button.style.visibility == "hidden")
          redo_button.style.visibility = "visible";

        drawingContext.clearRect(0,0,canvas.width, canvas.height);
        // pulisco la canvas
        drawingContext.globalAlpha = 0.2;
        drawingContext.fillStyle = "#dbceed";
        drawingContext.fillRect(0, 0, canvas.width, canvas.height);
        
        // se questa condizione è vera, non ho ancora eseguito alcun tipo di rotazione, dunque i
        // disegni sono presenti nella struttura dati vector_models, dunque lavoro su quella
         if(objects.length == 0)
         {            
              console.log("Nessuna rotazione eseguita");
              // prendo l'ultimo disegno presente in vector models e lo inserisco nella lista
              var undo_redo_tmp = vector_models.pop();   
              undo_redo_list.push(undo_redo_tmp); 
              
              // quando clicco molte volte undo e rimuovo tutti gli elementi, disabilito il bottone
              // undo quando non ho più elementi in vector_models
              if(vector_models.length === 0)
                this.style.visibility = "hidden";   

              // Per ogni elemento in vector_models, richiamo draw che disegna le coordinate
              for (var k=0; k<vector_models.length;k++)
              {
                // Prendo la k-esima Line
                var l = vector_models[k];
                
                // setto la dimensione del tratto per la linea
                drawingContext.lineWidth = l.getSize;

                for (var j=1; j < l.getPoints.length;j++)
                  {

                    drawUndoRedo( drawingContext, l.getPoints, l.getColor);
                  }
              }
         }
         else
         {
           
           // in questo caso invece ho eseguito una rotazione e dunque non lavoriamo su vector models ma su
           // objects, in quanto viene anche considerato l'asse z
           
           // può capitare che ci siano degli elementi che sono presenti in vector models e non in objects, in questo caso
           // richiamo rotate_function con b = false così da non abilitare la rotazione
           if(vector_models.length != 0)
             {
               b = false;
               rotate_function();
             }

           // prendo l'ultimo elemento presente in objects e lo inserisco in undo_redo_list           
           var undo_redo_tmp = objects.pop();
           undo_redo_list.push(undo_redo_tmp); 
           
           // come nel caso precedente, disabilito il bottone undo se non ho più elementi in objects
           if(objects.length === 0)
             this.style.visibility = "hidden";   
           
            drawingContext.clearRect(0,0,canvas.width, canvas.height);
            // pulisco la canvas
            drawingContext.globalAlpha = 0.2;
            drawingContext.fillStyle = "#dbceed";
            drawingContext.fillRect(0, 0, canvas.width, canvas.height);
           
            // disegno i punti
            for (var k=0; k<objects.length;k++)
            {

              // Prendo il k-esimo modello ruotato
              var model = objects[k];
              
              // setto la dimensione del tratto per il modello
              drawingContext.lineWidth = model.getSize;

              for (var j=1; j < model.getVertices.length;j++)
              {

                drawUndoRedo( drawingContext, model.getVertices, model.getColor);
              }

            }
           
           // svuoto vector models, in quanto ho già copiato tutti gli oggetti in objects quando
           // ho richiamato rotate_function
           vector_models = [];

         }
        
           console.log("Dimensione undo_redo_list: " + undo_redo_list.length);     
      }
      else
      {
        // codice da eseguire per gestire l'undo dei modelli presenti nella realtà
        if(this.innerHTML == "Undo Model")
          {
            
            // rendo visibile il bottone redo quando viene cliccato quello undo
            if(redo_button.style.visibility == "hidden")
              redo_button.style.visibility = "visible";
          

            // estraggo l'ultima entità inserita nella lista
            var entity_tmp = undo_redo_models.pop();            
            
            // nascondo l'entità
            entity_tmp.object3D.visible = false;
            
            // quando non ho più entità nella lista principale, disabilito il bottone undo in quanto
            // non posso più estrarre entità
            if(undo_redo_models.length === 0)
              undo_button.style.visibility = "hidden";  
            
            //inserisco l'entità a sua volta nella lista dei modelli temporanei
            undo_redo_models_tmp.push(entity_tmp);
            
            
            // cancello la canvas, non posso recuperare i tratti con il fade
            let canvas = document.getElementById('source-canvas');
            let drawingContext = canvas.getContext( '2d' );


            drawingContext.clearRect(0,0,canvas.width, canvas.height);
            // pulisco la canvas
            drawingContext.globalAlpha = 0.2;
            drawingContext.fillStyle = "#dbceed";
            drawingContext.fillRect(0, 0, canvas.width, canvas.height);
            
            
          }
      }        
  }


function redoFunction() {

        
        // gestione bottone redo per i tratti disegnati nella canvas
        if(redo_button.innerHTML == "Redo")
          {
              // se clicco su redo e il bottone undo è invisibile, allora lo abilito
              if(undo_button.style.visibility == "hidden")
                undo_button.style.visibility = "visible";    
          
              // prendo l'ultimo elemento inserito su undo_redo_list
              var undo_redo_tmp = undo_redo_list.pop();

              // quando non ho più elementi su cui fare il redo, allora disabilito il bottone
              if(undo_redo_list.length === 0)
                this.style.visibility = "hidden";    

              // pulisco la canvas
              drawingContext.clearRect(0,0,canvas.width, canvas.height);
              drawingContext.globalAlpha = 0.2;
              drawingContext.fillStyle = "#dbceed";
              drawingContext.fillRect(0, 0, canvas.width, canvas.height);

              // se non ho oggetti su objects e se non ho elementi "Model" (che hanno come attributo vertices)
              // in undo redo_temp, allora sto lavorande sempre solo su vector_models e non ho eseguito rotazioni
              if(objects.length == 0 && !("vertices" in undo_redo_tmp))
               {

                  // predno il tmp e lo inserisco in vector_models
                  vector_models.push(undo_redo_tmp);

                  // disegno i punti dei modelli
                  for (var k=0; k<vector_models.length;k++)
                  {
                    // k-esima Line
                    var l = vector_models[k];

                    drawingContext.lineWidth = l.getSize;

                    for (var j=1; j < l.getPoints.length;j++)
                    {

                      drawUndoRedo( drawingContext, l.getPoints, l.getColor);
                    }

                  }

               }
              else
                {
                  // se ho eseguito la rotazione, allora undo_redo_tmp deriva da objects e dunque
                  // lo inserisco in objects
                  objects.push(undo_redo_tmp);

                  // disegno il modello            
                  for (var k=0; k<objects.length;k++)
                  {
                    // K-esimo modello
                    var model = objects[k];

                    drawingContext.lineWidth = model.getSize;

                    for (var j=1; j < model.getVertices.length;j++)
                    {

                      drawUndoRedo( drawingContext, model.getVertices, model.getColor);
                    }
                  }

                }
          }
          else
            {
              // gestione redo per i modelli posizionati nella realtà
              if(redo_button.innerHTML == "Redo Model")
              {
                  // se il bottone undo è disattivato, lo rendo visibile
                  if(undo_button.style.visibility == "hidden")
                    undo_button.style.visibility = "visible";    

                  // ho eseguito il redo, dunque prendo l'ultima entità presente nella lista di modelli temporanei
                  var entity_tmp = undo_redo_models_tmp.pop();
                
                  // se non ho entità, disabilito il bottone redo
                  if(undo_redo_models_tmp.length === 0)
                    redo_button.style.visibility = "hidden";    
                
                  // rendo nuovamente visibile l'entità
                  entity_tmp.object3D.visible = true;
                  
                  // reinserisco l'entità nella lista dei modelli
                  undo_redo_models.push(entity_tmp);   
                
                
                  // cancello la canvas, non posso recuperare i tratti con il fade
                  let canvas = document.getElementById('source-canvas');
                  let drawingContext = canvas.getContext( '2d' );


                  drawingContext.clearRect(0,0,canvas.width, canvas.height);
                  // pulisco la canvas
                  drawingContext.globalAlpha = 0.2;
                  drawingContext.fillStyle = "#dbceed";
                  drawingContext.fillRect(0, 0, canvas.width, canvas.height);
                
                   
              }
            }
      }


// funzione che disegna il punto (x,y) nella canvas
function drawUndoRedo( drawContext, points, hexcolor) {

  drawContext.globalAlpha = 1;

  // setto il colore scelto del picker (o nero di default)
  drawContext.strokeStyle = hexcolor;

  drawContext.beginPath();
  drawContext.moveTo(points[0].x, points[0].y);
  for (var i = 1; i < points.length; i++)
  {    
    drawContext.lineTo(points[i].x, points[i].y);
    
  }
  drawContext.stroke();

 				

};