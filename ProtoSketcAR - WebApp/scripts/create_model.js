function createModel(e) {
  
        if (document.body.classList.contains("sketching")) {
          setTimeout(function() {
            
            // questa parte viene eseguita solamente se Done viene premuto dalla modalità classica, 
            // in quanto viene gestito anche la rotazione direttamente nella canvas, cosa che nella 
            // modalità pinned non è presente
            if(button_name == "Classic Mode")
            {
                // liste usate per posizionare correttamente le linee sul mondo reale
                // la prima contiene i "tubi" creati, mentre la seconda contiene la posizione della mesh per posizionare il
                // bounding box
                var list_tubes = [];
                var list_pos_mesh = [];
              
                // incremento il contatore per assegnare un id incrementale
                standard_model++;
                var id_s = "id_s_"+standard_model;

                // controllo che prima di creare il modello, ci siano effettivamente dei punti che sono stati
                // disegnati sulla canvas
                if(vector_models.length == 0 && objects.length == 0)
                  console.log("Nessun tratto disegnato!");
                else
                {
                    // creo l'entità padre che conterrà il disegno della canvas
                    var entity_parent = document.createElement("a-entity");
                    
                    // setto momentaneamente l'entità invisibile
                    entity_parent.object3D.visible = false;

                    // ottengo la posizione del cursore e la imposto per l'entità appena creata, di cui setto anche la rotazione
                    var pos = cursor_place.getAttribute('position');

                    entity_parent.setAttribute("position", {x:(pos.x),y:(pos.y+0.1),z:(pos.z)});
                    entity_parent.object3D.rotation.set(
                      THREE.Math.degToRad(180),
                      THREE.Math.degToRad(cursor_place.getAttribute('rotation').y),
                      THREE.Math.degToRad(0)
                    );

                    // definisco l'id e setto il componente così da mostrare il modello solamente quando Ar è attivo
                    entity_parent.setAttribute("show-in-ar-mode","");
                    entity_parent.setAttribute("id",id_s);
                    
                    entity_parent.setAttribute("scale",{x:1.5,y:1.5,z:1.5});
                    
                  
                    // creo un box trasparente al quale applico il componente bar per gestire il raycaster
                    var box = document.createElement("a-box");
                    box.setAttribute("opacity","0");
                    box.setAttribute("bar","");
                    box.setAttribute("depth","0.01");
                    box.setAttribute("scale",{x:0.1,y:0.1,z:0.1});
                    
                    // il box sarà il figlio dell'entità
                    entity_parent.appendChild(box);  

                    // aggiungo l'entità padre alla scena
                    scene.appendChild(entity_parent);

                    if(objects.length == 0)
                    {
                      // Se entro qua, vuol dire che non ho applicato alcuna rotazione a ciò che ho disegnato sulla canvas, dunque
                      // ho semplicemente un elemento 2D
                      console.log("Nessuna rotazione eseguita");
                      console.log("Vector Models prima della scalatura");
                      console.log(vector_models);

                      // per ogni tratto, creo la geometria e applico il material
                      for (let i = 0; i < vector_models.length; i++)
                      {
                          // queste due liste conterranno rispettivamente tutte le x e le y di ogni tratto
                          var list_x = [];
                          var list_y = [];
                          
                          // Prendo la linea
                          var l = vector_models[i];
                          
                          // variabile che conterrà la stringa di punti componenti l'entità a-tube
                          // ogni punto è definito come x y z, x y z etc..
                          var str = "";

                          // per ogni punto del tratto, popolo le liste di points per creare la mesh e list_x e list_y
                          for(let p = 0; p < l.getPoints.length; p ++)
                          {
                              str = str.concat(l.getPoint(p).x + " " + l.getPoint(p).y +" " + 0 +", ");
                              list_x.push(l.getPoint(p).x);
                              list_y.push(l.getPoint(p).y);
                          }
                          
                          // rimuovo gli ultimi 2 caratteri della stringa
                          str = str.slice(0, -2);
                        
                          // creo il tubo, settando il percorso, il raggio (width) e il material
                          var tube = document.createElement("a-tube");
                          tube.setAttribute("path",str);
                          tube.setAttribute("radius",(l.getSize/2));
                          tube.setAttribute("material","color:"+l.getColor);
                          //tube.setAttribute("bar","");
                          
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
                        
                          // ridimensiono il tubo
                          tube.object3D.scale.set(0.0004,0.0004,0.0004);
                          
                          // inserisco il tubo corrente nella lista dei tubi
                          list_tubes.push(tube);
                          
                          // inserisco la posizione della mesh in base al centro della canvas per riposizionare il bounding box
                          list_pos_mesh.push(new THREE.Vector2((c_x - x_tot),(c_y - y_tot)));
                          
                          // aggiungo il tubo all'entità padre
                          entity_parent.appendChild(tube);
                      }                    
                    }
                    else
                    {

                        // in questo caso, applico un altro procedimento nel caso in cui venga eseguita una rotazione
                        console.log("Rotazione eseguita");

                        if(rotate_button.innerHTML == "Rotate: OFF")
                        {
                          console.log("Prima abilita la rotazione!");
                          b = true;
                          rotate_function();
                        }
                      

                        // objects contiene i tratti disegnati e ruotati
                        for(let i = 0; i < objects.length; i++)
                        {
                            // queste due liste conterranno rispettivamente tutte le x e le y di ogni tratto
                            var list_x = [];
                            var list_y = [];
                            
                            // Prendo l'oggetto ModelRotate
                            var model = objects[i];
                           
                            // stringa contenente i punti
                            var str = "";

                            for ( let p = 0; p < model.getVertices.length; p ++ )
                            {
                                str = str.concat(model.getVertex(p).getX + " " + model.getVertex(p).getY +" " + model.getVertex(p).getZ +", ");
                                list_x.push(model.getVertex(p).getX);
                                list_y.push(model.getVertex(p).getY);
                            }
                          
                            // rimuovo ultimi 2 caratteri
                            str = str.slice(0, -2);
                            
                            var tube = document.createElement("a-tube");
                            tube.setAttribute("path",str);
                            tube.setAttribute("radius",(model.getSize/2));
                            tube.setAttribute("material","color:"+model.getColor);

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
                          
                            tube.object3D.scale.set(0.0004,0.0004,0.0004);
                            
                            list_tubes.push(tube);
                            list_pos_mesh.push(new THREE.Vector2((c_x - x_tot),(c_y - y_tot)));  
                 
                            entity_parent.appendChild(tube);

                      }
                    }
                  
                        // scansiono la lista di tubi, prendo le mesh di ogni tubo, calcolo BB e riposiziono la mesh   
                        for(let k = 0; k < list_tubes.length; k ++)
                         { 
                           setTimeout(function() {

                             var mesh_tub = list_tubes[k].object3D.children[0];
                             mesh_tub.geometry.computeBoundingSphere();                             
                             var bb_center_x = mesh_tub.geometry.boundingSphere.center.x;
                             var bb_center_y = mesh_tub.geometry.boundingSphere.center.y;
                             var x_f = list_pos_mesh[k].x;
                             var y_f = list_pos_mesh[k].y;
                             // a differenza di drawing, qua come z metto 0, altrimenti i tratti aggiunti vengono posizionati male
                             mesh_tub.position.set((-bb_center_x - x_f),(-bb_center_y - y_f),0);
                             
                             // setto il padre visibile
                             var parent = list_tubes[k].parentNode;
                             if(parent.object3D.visible == false)
                               parent.object3D.visible = true;
                            
                 

                             }, 0.1 * 1000);
                         } 

                         
                
              }
            }
            else
            {
              
              // quando finisco di disegnare e clicco Done nella modalità Pinned, prendo l'entità contenenti tutti gli sketch
              // e rimuovo le entità con visibilità false, che quindi sono nella lista di modelli temporanei e dunque da rimuovere
              let parent = document.getElementById(id);
              
              if(parent != null)
              {
                
              for(let j=0; j <parent.children.length; j++ )
              {
                // se il figlio è invisibile, allora lo rimuovo
                if(!parent.children[j].object3D.visible)
                  {
                     parent.removeChild(parent.children[j]);
                     j = j-1;
                  }

              }
              
              // se il padre non ha figli, rimuovo il padre
              if(parent.children.length==0)
                parent.parentNode.removeChild(parent);

              }
              
 
            }
            
          

            // svuoto tutte le strutture dati utilizzate finora, per disegnare un nuovo modello
            line = new Line([]);
            vector_models = [];
            objects = [];
            
            undo_redo_list = [];
            len_models = 0;
            
            rotate_button.innerHTML = "Rotate: OFF";
                     
            // una volta terminato, torno alla schermata precedente
            document.body.classList.remove("sketching");
            document.body.classList.add("placing-cursor");
            cursor_place.setAttribute("visible", "true");
            cursor_place.setAttribute("ar-hit-test", "doHitTest:true");
            
            // se il rettangolo trasparente è presente nella scena, sono nella modalità Pinned, dunque
            // rimuovo il rettangolo
            var rect_draw = document.getElementById('rect_draw');
            if(rect_draw != null)
              rect_draw.parentNode.removeChild(rect_draw);
            
            // ogni volta che clicco su done, svuoto le liste dei modelli della modalità pinned, per evitare che entità precedenti
            // contenute nelle liste possano essere reinserite nella scena
            undo_redo_models = [];
            undo_redo_models_tmp = [];
            
          }, 0.1 * 1000);
        }
      }