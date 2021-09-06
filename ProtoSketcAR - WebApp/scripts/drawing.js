function touchStart( e ) {
        
        // se paintMode è true, allora posso iniziare la fase di disegno
        if(paintMode)
        {
          alpha = 0;
          // prendo il rettangolo della canvas
          domRect = this.getBoundingClientRect();
          
          // imposto lo spessore del tratto         
          drawingContext.lineWidth = width_stroke;
          
             // setto paint a true
					 paint = true;
          
          // prendo il punto iniziale dalla canvas
           var x = event.touches[0].pageX - canvas.offsetLeft;
           var y = event.touches[0].pageY - canvas.offsetTop; 
          
            // controllo che sia all'interno della canvas          
            if(x > 0 && x < domRect.width && y > 0 && y < domRect.height && !exit_canvas)
            {
                  // aggiungo il primo punto all'oggetto Line e lo setto come primo punto
                  line.addPoint(x, y); 
                  drawStart.add(line.getPoint(0).x, line.getPoint(0).y);
                  
                  //drawingContext.beginPath();
                  //drawingContext.moveTo(x,y);

            }
            
         
            
                
      

        }

			}

function touchMove( e ) {      
        
        // se paintMode è true, allora posso continuare la fase di disegno
        if(paintMode)
          {
            // come prima, prendo le coordinate per lo stesso motivo     
            var x = e.touches[0].pageX - canvas.offsetLeft;
            var y = e.touches[0].pageY - canvas.offsetTop; 

            
            // se le coordinate del punto rilevato sulla canvas sono all'interno della canvas stessa allora entro, altrimenti
            // vuol dire che il tratto è fuori dalla canvas e dunque interrompo lo sketching
            if(x > 0 && x < domRect.width && y > 0 && y < domRect.height && !exit_canvas)
            {
              
                  // controllo se il punto corrente è già prensete nella lista, in quel caso non viene inserito
                  var flag = false;

                 for (let i = 0; i < line.getPoints.length && !flag; i ++ )
                 {
                   if(line.getPoint(i).x == x && line.getPoint(i).y == y)
                     flag = true;

                 }
                  

                  if(flag == false)
                      line.addPoint(x, y); 


                // se paint è settato a true, allora richiamo la funzione per disegnare effettivamente il punto corrente 
                // sulla canvas con il rispettivo colore
                  if(paint)                    
                    draw( drawingContext, x, y , hex);

            }
            else
              exit_canvas = true;
          }
				}


function touchEnd() {
        
        if(paintMode)
          {
  
            // se quando termino la gesture exit canvas è true, vuol dire che sono uscito dalla canvas, dunque la setto a false per riprendere a disegnare
            if(exit_canvas)
                exit_canvas = false;
   
            
            if(line.getPoints.length !=0)
            {
              

              // setto il colore del tratto
              line.setColor(hex);
            
              // setto la dimensione del tratto appena disegnato
              line.setSize(drawingContext.lineWidth);            
            
              // inserisco l'oggeto linea in vector_models e ne creo una nuova, in quanto l'utente potrebbe continuare a disegnare
              vector_models.push(line);
              
              console.log(line);
              
              line = new Line([]);
              
              // aggiorno la dimensione dei modelli disegnati per eventualmente disattivare il bottone redo
              len_models = vector_models.length;
              
              // ho finito di disegnare, quindi setto paint a false
              paint = false;
              
              // se la scritta nel bottone redo è RedoModel, allora devo passare alla modalità con undo/redo classica per i tratti disegnati sulla
              // canvas, dunque cambio le label
              if(redo_button.innerHTML == "Redo Model")
              {
                  undo_button.innerHTML = "Undo";
                  redo_button.innerHTML = "Redo";
                
                  // se ho più o uguali elementi nelle due liste usate per i modelli nella modalità pinned rispetto a i modelli creati attualmente+1, allora disabilito il bottone redo
                  // e svuoto la lista temporanea di modelli
                  if((undo_redo_models.length+undo_redo_models_tmp.length)>=undo_redo_models.length+1)
                  {             
                       
                       redo_button.style.visibility = "hidden";                         
                       undo_redo_models_tmp = [];
                  }


              }
              
              // se il bottone ha label undo
              if(undo_button.innerHTML == "Undo")
              {
                  // quando termino di disegnare, abilito il bottone undo per poter tornare indietro
                  undo_button.style.visibility = "visible";    
              }
            

              // controlli per capire se gli elementi contenuti in vector models, objects e undoredo
              // sono maggiori della lunghezza iniziale, così da bloccare il tasto redo quando 
              // provo a fare redo di elementi che in teoria dovrebbero essere eliminati
              // questi controlli sono eseguiti solo se sto gestendo i tratti sulla canvas, dunque quando 
              // le etichette undo e redo sono attivate
              if(redo_button.innerHTML == "Redo")
              {
                
                    if((vector_models.length+undo_redo_list.length)>len_models)
                    {
                       redo_button.style.visibility = "hidden";
                       undo_redo_list = [];
                    }
                
  
                    if((objects.length+vector_models.length+undo_redo_list.length)>len_models)
                    {
                      redo_button.style.visibility = "hidden";
                      undo_redo_list = [];
                    }
              }
              
              // Se sono in modalità Pinned, appena l'utente termina di disegnare il tratto, viene richiamo il metodo per creare la mesh
              if(button_name == "Pinned Mode")
                drawPinned();

            }           
          }
				};


function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}


      
// funzione che disegna il punto (x,y) nella canvas
function draw( drawContext, x, y , hexcolor) {

      // in base alla modalità, cambia la trasparenza del tratto: se è pinned, allora applichiamo un effetto Fade sul tratto
      // se è classic mode, il tratto non ha trasparenza
      if(button_name == "Pinned Mode")
      {    
          if(alpha < 0.2)
          {
            alpha = alpha+0.004;

          }
          
        
         drawContext.globalAlpha = alpha;
        
        /*
         if(drawContext.lineWidth < 12)
           drawContext.lineCap = 'butt';
         else
           drawContext.lineCap = 'round';
          */

      }

      else
        {
          drawContext.globalAlpha = 1;
          drawContext.lineCap = 'round';

        }


      // setto il colore scelto del picker (o nero di default)
      drawContext.strokeStyle = hexcolor;  

      //drawContext.strokeStyle = "rgba("+hexToRgb(hexcolor).r+","+hexToRgb(hexcolor).g+","+hexToRgb(hexcolor).b+","+alpha+")";
      
      // creo il percorso dal punto iniziale verso il punto corrente (x,y). Quest'ultimo punto sarà poi il nuovo drawStart
  
      drawContext.beginPath();
      drawContext.moveTo(drawStart.x,drawStart.y);
      drawContext.lineTo(x,y);
      drawContext.stroke();	
      drawStart.set(x,y);
  
    };



// funzione che conterrà il codice per disegnare gli sketches
function StartDrawing(e) {

  if (document.body.classList.contains("selectmode")) {

    // prendo il nome del bottone premuto che conterrà la modalità scelta, classica o pinned  
    button_name = e.target.innerHTML;
    
     // quando inizio a disegnare, la canvas è sempre visibile
    hud_button.innerHTML = "Canvas: ON";
    canvas.style.visibility = "visible";

    // Passo da selectmode a sketching per iniziare a disegnare
    document.body.classList.remove("selectmode");
    document.body.classList.add("sketching");    
    
    //ogni volta che inizio una nuova sessione di sketching, resetto l'id
    id = "";

    // Gestisco la modalità Pinned
    if(button_name == "Pinned Mode")
    {
      // se sono in modalità pinned, sposto la canvas alla sinistra dello schermo, dunque gli eventi del tocco dell'utente 
      // vengono rilevati nel div che viene mostrato a schermo.
      //let div_canvas = document.getElementById("div_canvas");
      
      //div_canvas.addEventListener('touchstart', touchStart);

      //div_canvas.addEventListener('touchmove', touchMove);

      //div_canvas.addEventListener('touchend', touchEnd);
      
      // sposto la canvas oltre lo schermo dell'utente
      //canvas.style.position = "relative";
      //canvas.style.right = "800px";
      
      
      // ogni volta che entro nella modalità Pinned, azzero questa variabile per creare l'entità padre iniziale
      c_pinned = 0;
      
       // se il bottone per abilitare/disabilitare la canvas è nascosto, allora lo rendo visibile, in quanto
      // è utilizzabile solamente nella modalità pinned
      if(hud_button.style.visibility == "hidden")
        hud_button.style.visibility = "visible";

      // aggiungo il componente seguente alla camera per poterne tracciare le coordinate nel mondo reale              
      camera.setAttribute("camera-listener","");

      // nella modalità Pinned, viene disabilitato il bottone della rotazione, questo perchè non viene ruotata
      /// la canvas per creare modelli 3D ma è l'utente che dovrà spostarsi nel mondo reale ed utilizzare
      // il rettangolo trasparente. Di conseguenza, rimuovo il bottone Rotate e aggiungo quello Draw, che permette
      // di posizionare nel mondo reale lo sketch sul rettangolo. Aggiungo inoltre gli slider che permettono
      // all'utente di modificare manualmente asse z e x del rettangolo, mentre l'asse y si muove assieme
      // all'utente
      if(rotate_button.parentNode != null)
      {

        rotate_button.parentNode.removeChild(rotate_button); 
        //done_button.parentNode.insertBefore(draw_button_pinned, done_button.parentNode.children[1]);
        done_button.parentNode.insertBefore(hud_button, done_button.parentNode.children[1]);

        div_container_sketch.insertBefore(div_slider, div_container_sketch.children[2]);

        div_slider.appendChild(hZ);
        div_slider.appendChild(hX);

        hZ.appendChild(slider_rotation_z);
        hX.appendChild(slider_rotation_x);

      }

      // nella modalità Pinned, il cursore è sempre visibile nel mondo reale
      cursor_place.setAttribute("visible", "true");

      setTimeout(function() {

        // creo l'entità Plane che sarà il rettangolo trasparente su cui verrà riprodotto
        // ciò che viene disegnato sulla canvas, per poterlo poi posizionare nel mondo reale
        var entity_plane = document.createElement("a-plane");

        // imposto id e dimensoni, che saranno pari (anche se scalate) alle dimensioni della canvas
        // setto anche la scalatura
        entity_plane.setAttribute("id","rect_draw");
        var cW = (canvas.width/500);
        var cH = (canvas.height/500);
        entity_plane.setAttribute("width", cW);
        entity_plane.setAttribute("height",cH);
        entity_plane.setAttribute("scale",{x:0.2,y:0.2,z:0.2});

        // prendo la posizione del cursore e la uso per posizionare il rettangolo nel mondo reale
        // definisco il colore bianco
        var pos = cursor_place.getAttribute('position');
        entity_plane.setAttribute("position",{x:(pos.x-0.5),y:worldPos.y,z:pos.z});

        // imposto colore bianco e l'opacità al material del plane per renderlo trasparente
        entity_plane.setAttribute("color","white");
        entity_plane.setAttribute("opacity","0.9");

        // aggiungo 3 componenti al rettangolo:
        //1. Componente che permette di usare la canvas come material del rettangolo, così da riprodurre
        // ciò che disegno sulla canvas sul rettangolo
        //2. Aggiorna la posizione e rotazione del rettangolo in base al movimento e rotazione del dispositivo
        //3. Mostra l'entità solamente quando la modalità AR è attiva
        entity_plane.setAttribute("draw","");
        entity_plane.setAttribute("move_rect","");
        entity_plane.setAttribute("show-in-ar-mode","");

        // aggiungo il rettangolo alla scena
        scene.appendChild(entity_plane);

      }, 0.1 * 2000);
    }
    else
    {
        // se sono nella modalità classica, la canvas è nella sua posizione corrente e dunque rimuovo gli eventi sul div
        //let div_canvas = document.getElementById("div_canvas");
      
        //div_canvas.removeEventListener('touchstart', touchStart);

        //div_canvas.removeEventListener('touchmove', touchMove);

        //div_canvas.removeEventListener('touchend', touchEnd);
       
        // riposiziono la canvas nella sua posizione corretta
        //canvas.style.position = "";
        //canvas.style.right = "";
      
        // nella modalità classica, non è necessario che la canvas venga nascosta o meno,
        // in quanto lo sfondo non è importante in questa modalità
        hud_button.style.visibility = "hidden";

        //Se invece sono nella modalità classica, inserisco il bottone Rotate, rimuovo quello Draw e gli slider
        done_button.parentNode.insertBefore(rotate_button, done_button.parentNode.children[1]);

        // rimuovo il bottone hud canvas
        var elem = document.getElementById('hud-button');
        if(elem != null)
          elem.parentNode.removeChild(elem);

        // rimuovo i due slider
        var s1 = document.getElementById('hz');
        var s2 = document.getElementById('hx');

        if(s1 != null && s2 != null)
          {
            div_container_sketch.removeChild(s1.parentNode);
            s1.parentNode.removeChild(s1);
            s2.parentNode.removeChild(s2);
          }
    }

    drawingContext.fillStyle = '#FFFFFF';          
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    drawingContext.lineWidth = 5;
    paintMode = true;

    // inizialmente, i bottoni sono disattivati, sia quelli per undo/redo dei tratti che per i modelli
    if(undo_button.innerHTML == "Undo" || undo_button.innerHTML == "Undo Model")
      undo_button.style.visibility = "hidden";

    if(redo_button.innerHTML == "Redo" || redo_button.innerHTML == "Redo Model")
      redo_button.style.visibility = "hidden";

    // inizializzo tutte le variabili che utilizzo

    line = new Line([]);
    objects = [];
    vector_models = [];

    undo_redo_list = [];
    len_models = 0;
    c = 0;

    hex = "#000000";

    // svuoto i modelli della pinned mode temporanei
    undo_redo_models_tmp = [];

    theLineWidth.value = 5;

  
    drawingContext.clearRect(0, 0, canvas.width, canvas.height);

    // Turn transparency on
    drawingContext.globalAlpha = 0.2;
    drawingContext.fillStyle = "#dbceed";
    drawingContext.fillRect(0, 0, canvas.width, canvas.height);

    width_stroke = 5;

    return;

  }
}

 function drawPinned()
  {
    
    // svuoto le liste per posizionare i tubi
    var list_tubes = [];
    var list_pos_mesh = [];  
    
    // disegno solamente se ci sono dei tratti sulla canvas
    if(vector_models.length > 0)
    {
        // incremento il contatore ogni volta che il bottone Draw viene premuto    
        c_pinned++;

        // identifico il rettangolo trasparente 
        var rect_draw = document.getElementById('rect_draw');
        var pos = cursor_place.getAttribute('position');

         // se è la prima volta che viene premuto draw, creo l'entità padre che conterrà tutti gli altri
         // sketch che l'utente disegna
         if(c_pinned == 1)
         {
             // incremento il contatore per settare degli id incrementali
             id_parent_pinned ++;
             id = "id_" + id_parent_pinned;

             // creo un entità padre che conterrà tutti i tratti disegnati sul rettangolo
             var entity_parent_pinned = document.createElement("a-entity");

             // aggiungo il componente show-in-ar-mode così da mostrare il modello solamente quando Ar è attivo
             // setto anche l'id all'entità
             entity_parent_pinned.setAttribute("show-in-ar-mode","");
             entity_parent_pinned.setAttribute("id",id);

             // imposto la posizione dell'entità padre
             entity_parent_pinned.object3D.position.set(rect_draw.getAttribute('position').x , rect_draw.getAttribute('position').y, rect_draw.getAttribute('position').z);

             // aggiungo l'entità padre alla scena
             scene.appendChild(entity_parent_pinned);
         };

          // prendo l'entità padre
          var entity_pinned = document.getElementById(id);

          // creo l'entità padre che conterrà il disegno della canvas
          var entity_parent = document.createElement("a-entity");
          entity_parent.object3D.visible = false;

          // setto la posizione dell'entità in base al centro del rettangolo, ma siccome questa entità sarà figlia
          // di un'altra entità a cui è stato un posizionamento, sottraggo la posizione del rettangolo con l'entità padre
          entity_parent.object3D.position.set((rect_draw.getAttribute('position').x - entity_pinned.object3D.position.x), (rect_draw.getAttribute('position').y-entity_pinned.object3D.position.y), (rect_draw.getAttribute('position').z-entity_pinned.object3D.position.z));
          
          // questi vettori conterranno le coordinate quali posizione, quaternione e scalatura
          var pos_r = new THREE.Vector3();
          var quat = new THREE.Quaternion();
          var scat = new THREE.Vector3();

          // popolo i vettori precedenti in base alla matrice del mondo reale del rettangolo
          rect_draw.object3D.matrixWorld.decompose( pos_r, quat, scat );

          // il tratto disegnato sul rettangolo deve seguire la rotazione del rettangolo, dunque copio il quaterione
          entity_parent.object3D.quaternion.copy(quat);   

          // aggiungo l'entità appena creata come figlia dell'entità padre precedente 
          entity_pinned.appendChild(entity_parent);

          // creo un box trasparente al quale applico il componente bar per eseguire il raycaster sull'entità
          
          var box = document.createElement("a-box");                 
          box.setAttribute("opacity","0");
          box.setAttribute("bar","");
          box.setAttribute("depth","0.01");
          box.setAttribute("width",rect_draw.getAttribute("width"));
          box.setAttribute("height",rect_draw.getAttribute("height"));
          box.object3D.scale.set(0.1,0.1,0.1);

          // aggiungo il box come figlio dell'entità
          entity_parent.appendChild(box);
          
          // per ogni tratto, popolo i vettori, creo la geometria e applico il material
          for (let i = 0; i < vector_models.length; i++)
          {
              // queste due liste conterranno rispettivamente tutte le x e le y di ogni tratto
              var list_x = [];
              var list_y = [];
              
              // Prendo la i-esima Line
              var l = vector_models[i];
              
              // stringa che contiene i punti di ogni linea per creare il tubo
              var str = "";

              // per ogni punto del tratto, aggiungo la coppia [x,y] a test e aggiungo la tripla (x,y,0) al vettore points per la creazione del modello
              for(let p = 0; p < l.getPoints.length; p ++)
              {
                str = str.concat(l.getPoint(p).x + " " + l.getPoint(p).y +" " + 0 +", ");
                list_x.push(l.getPoint(p).x);
                list_y.push(l.getPoint(p).y);
              }
               
              // rimuovo gli ultimi due caratteri
              str = str.slice(0, -2);           

              // Per ogni lista di punti x e y, identifico coordinata più piccola e più grande
              var x_min = Math.min.apply(Math, list_x);
              var x_max = Math.max.apply(Math, list_x);
              var y_min = Math.min.apply(Math, list_y);
              var y_max = Math.max.apply(Math, list_y);

              // Calcolo il punto medio della x e della y
              var x_tot = (x_min + x_max)/2;
              var y_tot = (y_min + y_max)/2;

              // Calcolo le coordinate del centro della canvas
              var c_x = canvas.width/2; 
              var c_y = canvas.height/2;
              
              // calcolo i valori per spostare la posizione della mesh in base al BB
              var final_x = (c_x - x_tot);
              var final_y = (c_y - y_tot);
            
              list_pos_mesh.push(new THREE.Vector2(final_x,final_y));
              
              // creo il tubo, settando i punti, il raggio e il material
              var t = document.createElement("a-tube");
              t.setAttribute("path",str);
              t.setAttribute("radius",(l.getSize/2));
              t.setAttribute("material","color:"+l.getColor);
              //t.setAttribute("bar","");
              
              // imposto rotazione e scalatura del tubo
              t.object3D.scale.set(0.0004,0.0004,0.0004);
              t.object3D.rotation.set(THREE.Math.degToRad(180),t.object3D.rotation.y,t.object3D.rotation.z);
            
              // insierisco il tubo nella lista di tubi
              list_tubes.push(t);
             
              // aggiungo il tubo all'entità padre
              entity_parent.appendChild(t);            
        
          }
      
       
        // scansiono la lista di tubi, prendo le mesh di ogni tubo, calcolo BB e riposiziono la mesh   
         for(let k = 0; k < list_tubes.length; k ++)
         { 
           setTimeout(function() { 
            
             var mesh_tub = list_tubes[k].getObject3D("mesh");
             
               //console.log("Calcolo BB!");
               mesh_tub.geometry.computeBoundingSphere();
               var bb_center_x = mesh_tub.geometry.boundingSphere.center.x;
               var bb_center_y = mesh_tub.geometry.boundingSphere.center.y;
               var bb_center_z = mesh_tub.geometry.boundingSphere.center.z;
               var x_f = list_pos_mesh[k].x;
               var y_f = list_pos_mesh[k].y;
               mesh_tub.position.set((-bb_center_x - x_f),((-bb_center_y - y_f)),-bb_center_z);

               var parent = list_tubes[k].parentNode;

               if(parent.object3D.visible == false)
                 parent.object3D.visible = true;

             }, 0.1 * 1000);
         }
         
      
          // ogni volta che aggiungo un disegno al mondo reale, lo aggiungo alla lista di undo_redo_models
          undo_redo_models.push(entity_parent);

          // quando aggiungo un modello, abilito i bottoni per eseguire l'undo redo di questi modelli presenti nel mondo reale
          if(undo_redo_models.length > 0)
          {
            console.log("Add entity");
            undo_button.innerHTML = "Undo Model";
            redo_button.innerHTML = "Redo Model";

            if(undo_button.style.visibility == "hidden")
              undo_button.style.visibility = "visible";

            redo_button.style.visibility = "hidden";

          }

          // richiamo la funzione del pulsante Cancel per svuotare le strutture usate (ma non pulisco la canvas)
          cancelButton();
          
          

    }
    else
      {
        console.log("Nessun tratto da disegnare!");
      }
  }


