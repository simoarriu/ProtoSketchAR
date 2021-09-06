function editFunction()
      {
        // se la scena corrente contiene il cursore sul terreno, abilito la scena in cui mostro un cursore 
        // che si muove assieme alla camera da cui viene emanato un raycast
        if (document.body.classList.contains("placing-cursor")) {
          
          document.body.classList.remove("placing-cursor");
          document.body.classList.add("edit-model");
          
          // disabilito l'hit test
          cursor_place.setAttribute("ar-hit-test", "doHitTest:false");
          cursor_place.setAttribute("visible", "false");
          
          // creo il cursore centrato alla camera a forma di ring, setto anche il raycast
          cursor = document.createElement("a-entity");
          cursor.setAttribute("cursor","fuse: true; fuseTimeout: 500");
          cursor.setAttribute("position","0 0 -0.1");
          cursor.setAttribute("scale","0.1 0.1 0.1");
          cursor.setAttribute("raycaster","showLine: true");
          cursor.setAttribute("geometry","primitive: ring; radiusInner: 0.02; radiusOuter: 0.03");
          cursor.setAttribute("material","color: teal; shader: flat");
          
          // setto il cursore come figlio della camera per muoversi assieme ad esso
          camera.appendChild(cursor);
          
          // identifico il div contenente i bottoni per scalare, ruotare, spostare e rimuovere un'entità
          var div_b = document.getElementById("div-sca-rot-del");
          
          // se questo div ha 2 figli, questi sono sicuramente i bottoni done e reset, dunque li rimuovo per
          // poter inserire i bottoni scale, rotate, move e delete
          if(div_b.children.length == 2)
            {
              done_op_button.parentNode.removeChild(done_op_button);
              reset_button.parentNode.removeChild(reset_button);

              div_b.appendChild(scale_button);
              div_b.appendChild(rot_button);
              div_b.appendChild(move_button);
              div_b.appendChild(delete_button);
            }

          return;
        }     
      }

// quando clicco su reset, il comportamento cambia in base al bottone scelto, ma generalmente il funzionamento
// consiste nel reimpostare la scalatura/rotazione/posizione iniziale
function resetFunction()
{
  // identifico l'entità con cui il raycast ha intersecato
  var entity_target = document.getElementById(id_ent);

  // Risetto i valori in base al bottone premuto
  if(b_name == "Scale")
    entity_target.object3D.scale.set(intial_scale.x,intial_scale.y,intial_scale.z);
  if(b_name == "Rotate")
    entity_target.object3D.rotation.set(intial_rotate.x,intial_rotate.y,intial_rotate.z);
  if(b_name == "Move")
  {
    // Per lo spostamento è necessario prima disabilitare l'hit test e impostare la posizione iniziale del cursore
    // e del modello
    cursor_place.setAttribute("ar-hit-test", "doHitTest:false");
    cursor_place.object3D.position.set(intial_pos_cursor.x,intial_pos_cursor.y,intial_pos_cursor.z);
    entity_target.removeAttribute("move_model");
    entity_target.object3D.position.set(intial_pos.x,intial_pos.y,intial_pos.z);

    // Dopo ciò, setto un timeout per riattivare l'hit test e lo spostamento del modello
    setTimeout(function() {

        cursor_place.setAttribute("ar-hit-test", "doHitTest:true");
        entity_target.setAttribute("move_model","");

    }, 0.1 * 10000);
  }
}


function backOpButton(){

  // Se il body contiene la classe edit-model, la rimuovo e inserisco placing-cursor, ovvero la classe
  // iniziale per riposizionare un nuovo modello
  if (document.body.classList.contains("edit-model")) {

    document.body.classList.remove("edit-model");
    document.body.classList.add("placing-cursor");
    cursor_place.setAttribute("ar-hit-test", "doHitTest:true");
    cursor_place.setAttribute("visible", "true");     

    // non uso più il raycaster, dunque rimuovo il cursore
    cursor.parentNode.removeChild(cursor);

  }
}


function scaleFunction(e)
{
  // faccio presente all'utente che il ridimensionamento viene gestito tramite un pinch a due dita

  var div_p = document.getElementById("div-operations");
  div_p.insertBefore(help, div_p.children[0]);
  help.innerText = "Pinch to scale the model";

  // prendo il nome del bottone premuto (Scale)
  b_name = e.target.innerHTML;

  // Nascondo il bottone per tornare indietro
  back_op_button.style.visibility = "hidden";

  // rimuovo il raycast dal cursore e lo nascondo
  cursor.removeAttribute("raycaster");
  cursor.setAttribute("visible",false);

  // Rimuovo i bottoni attuali con le operazioni per inserire i bottoni reset e done
  var div_b = this.parentNode;
  this.parentNode.removeChild(this);
  rot_button.parentNode.removeChild(rot_button);
  move_button.parentNode.removeChild(move_button);
  delete_button.parentNode.removeChild(delete_button);

  div_b.appendChild(reset_button);
  div_b.appendChild(done_op_button);
  
  // setto il booleano a true per il raycast
  intersecting = true;

  // abilito il pinch per hammer
  hammertime.get('pinch').set({ enable: true });

  // idenfico entità intersecata con il raycast
  var entity_target = document.getElementById(id_ent);

  // Salvo la posizione corrente dell'entità per un possibile Reset
  intial_scale.set(entity_target.object3D.scale.x,entity_target.object3D.scale.y, entity_target.object3D.scale.z);

  // Assegno il componente scaling per scalare l'entità
  entity_target.setAttribute("scaling","");

}


function rotFunction(e)
{
  // prendo il nome del bottone premuto (Rotate)
  b_name = e.target.innerHTML;

  // nascondo il bottone Back
  back_op_button.style.visibility = "hidden";

  // Rimuovo il raycast dal cursore e lo nascondo
  cursor.removeAttribute("raycaster");
  cursor.setAttribute("visible",false);

  // Rimuovo i bottoni attuali con le operazioni per inserire i bottoni reset e done
  var div_b = this.parentNode;
  this.parentNode.removeChild(this);
  scale_button.parentNode.removeChild(scale_button);
  move_button.parentNode.removeChild(move_button);
  delete_button.parentNode.removeChild(delete_button);

   // setto il booleano a true per il raycast
  intersecting = true;

  div_b.appendChild(reset_button);
  div_b.appendChild(done_op_button);

  // identifico l'entità con cui il raycast ha intersecato        
  var entity_target = document.getElementById(id_ent);

  // inserisco i gizmo nell'entità per il feedback durante la rotazione
  entity_target.appendChild(gizmo);

  // salvo la rotazione iniziale
  intial_rotate.set(entity_target.object3D.rotation.x,entity_target.object3D.rotation.y, entity_target.object3D.rotation.z);

  // abilito il pan e attacco il componente rotating
  hammertime.get('pan').set({ enable: true });
  entity_target.setAttribute("rotating","");
  
}

function moveFunction(e)
{
  // Creo un suggerimento per l'utente così da dirgli che può muovere verticalmente il modello per modificare l'asse Y
  var div_p = document.getElementById("div-operations");
  div_p.insertBefore(help, div_p.children[0]);
  help.innerText = "Pan to move the model vertically"
  
  // prendo il nome del bottone premuto (Move)
  b_name = e.target.innerHTML;

  // nascondo il bottone Back
  back_op_button.style.visibility = "hidden";

  // Rimuovo il raycast dal cursore e lo nascondo
  cursor.removeAttribute("raycaster");
  cursor.setAttribute("visible",false);

  // Rimuovo i bottoni attuali con le operazioni per inserire i bottoni reset e done
  var div_b = this.parentNode;
  this.parentNode.removeChild(this);
  scale_button.parentNode.removeChild(scale_button);
  rot_button.parentNode.removeChild(rot_button);
  delete_button.parentNode.removeChild(delete_button);

  // setto il booleano a true per il raycast
  intersecting = true;

  div_b.appendChild(reset_button);
  div_b.appendChild(done_op_button);

  // abilito l'hit test e il cursore a terra per spostare il modello assieme ad esso
  cursor_place.setAttribute("ar-hit-test", "doHitTest:true");
  cursor_place.setAttribute("visible", "true");    

  // identifico l'entità con cui il raycast ha intersecato   
  var entity_target = document.getElementById(id_ent);

  // salvo la posizione iniziale di cursore e entità
  intial_pos_cursor.set(cursor_place.object3D.position.x,cursor_place.object3D.position.y, cursor_place.object3D.position.z);
  intial_pos.set(entity_target.object3D.position.x,entity_target.object3D.position.y, entity_target.object3D.position.z);

  // attacco il componente move_model per spostare il modello assieme al cursore
  entity_target.setAttribute("move_model","");
  
  // Attacco il componente rotating che abilita il pan per modificare la posizione Y, non la rotazione
  hammertime.get('pan').set({ enable: true });
  entity_target.setAttribute("rotating","");

}

function deleteFunction()
{
    // setto il booleano a false per nascondere i bottoni delle operazioni
    intersecting = false;
    
    // quando mostro il div per rimuovere il modello, disabilito il cursore
    cursor.removeAttribute("raycaster");
    cursor.setAttribute("visible",false);
    
    // prendo il div padre per poter inserire il div per rimuovere il modello
    var div_parent = this.parentNode.parentNode;

    // nascondo il bottone back
    div_parent.children[0].children[0].style.visibility = "hidden";
    
    // inserisco il div della rimozione del modello
    div_parent.insertBefore(div_confirm, div_parent.children[1]);
  
}

function yesDeleteFunction()
{
    // setto nuovamente il cursore per il raycast
    cursor.setAttribute("raycaster","");
    cursor.setAttribute("visible",true);
  
   // rimuovo l'entità dalla scena
   var entity_target = document.getElementById(id_ent);

   if(entity_target != null)
     entity_target.parentNode.removeChild(entity_target);
   
   // mostro nuovamente il bottone back
   var div_parent = this.parentNode.parentNode.parentNode;
   div_parent.children[0].children[0].style.visibility = "visible";

   // rimuovo il div per eliminare il modello
   div_parent.removeChild(div_confirm);

}

function noDeleteFunction()
{
  // setto nuovamente il cursore per il raycast
  cursor.setAttribute("raycaster","");
  cursor.setAttribute("visible",true);
  
  // mostro nuovamente il bottone back
  var div_parent = this.parentNode.parentNode.parentNode;
  div_parent.children[0].style.visibility = "visible";
  
  // rimuovo il div per eliminare il modello
  div_parent.removeChild(div_confirm);

}

function doneOpButton()
{
  // Rendo nuovamente visibile il bottone Back        
  back_op_button.style.visibility = "visible";

  // Rendo visibile il cursore per il raycast
  cursor.setAttribute("visible",true);
  cursor.setAttribute("raycaster","showLine: true");

  // rimuovo i bottoni done e reset per reinserire quelli delle operazioni precedenti
  var div_b = this.parentNode;
  this.parentNode.removeChild(this);
  reset_button.parentNode.removeChild(reset_button);

  div_b.appendChild(scale_button);
  div_b.appendChild(rot_button);
  div_b.appendChild(move_button);
  div_b.appendChild(delete_button);

  // disabilito il booleano per il raycast
  intersecting = false;

  // in base al Done premuto, imposto diversi valori
  // Se done è stato premuto dopo uno scale, rimuovo il componente scaling e disabilito il pinch
  if(b_name == "Scale")
  {
    var div_p = document.getElementById("div-operations");
    help.parentNode.removeChild(help);
    
    var entity_target = document.getElementById(id_ent);          
    entity_target.removeAttribute("scaling");
    hammertime.get('pinch').set({ enable: false });
  }

  // Se done è stato premuto dopo un rotate, rimuovo il componente rotating e disabilito il pan e rimuovo i gizmo
  if(b_name == "Rotate")
  {
    var entity_target = document.getElementById(id_ent);
    entity_target.removeAttribute("rotating");
    hammertime.get('pan').set({ enable: false });
    entity_target.removeChild(entity_target.children[entity_target.children.length-1]);

  }

  // Se done è stato premuto dopo un move, disabilito l'hit test e il componente move_model
  if(b_name == "Move")
  {
      var div_p = document.getElementById("div-operations");
      help.parentNode.removeChild(help);
    
      cursor_place.setAttribute("ar-hit-test", "doHitTest:false");
      cursor_place.setAttribute("visible", "false");    

      var entity_target = document.getElementById(id_ent);
      entity_target.removeAttribute("move_model");
      entity_target.removeAttribute("rotating");
      hammertime.get('pan').set({ enable: false });
      

  } 
}

// funzione per capire il s.o del dispositivo, per poter capire quale codice eseguire per 
// il salvataggio della scena
function getOS() {
    var userAgent = window.navigator.userAgent,
        platform = window.navigator.platform,
        macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
        windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
        iosPlatforms = ['iPhone', 'iPad', 'iPod'],
        os = null;

    if (macosPlatforms.indexOf(platform) !== -1) {
      os = 'Mac OS';
    } else if (iosPlatforms.indexOf(platform) !== -1) {
      os = 'iOS';
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
      os = 'Windows';
    } else if (/Android/.test(userAgent)) {
      os = 'Android';
    } else if (!os && /Linux/.test(platform)) {
      os = 'Linux';
    }
    
    console.log(os);
    return os;
  }