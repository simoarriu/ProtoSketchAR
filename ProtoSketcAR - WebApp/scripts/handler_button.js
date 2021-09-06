function backButton() {
  if (document.body.classList.contains("sketching")) {
    setTimeout(function() {

      rotate_button.innerHTML = "Rotate: OFF";
      document.body.classList.remove("sketching");
      document.body.classList.add("placing-cursor");

      var pos_camera = camera.getAttribute('position');
      cursor_place.setAttribute("position",pos_camera);
      cursor_place.setAttribute("visible", "true");
      cursor_place.setAttribute("ar-hit-test", "doHitTest:true");      

      // Modalità Pinned, quando esco rimuovo il piano traslucido e rimuovo l'entità corrente
      var rect_draw = document.getElementById('rect_draw');
      if(rect_draw != null)
      {
        rect_draw.parentNode.removeChild(rect_draw);
        let parent = document.getElementById(id);
        if(parent != null)
          parent.parentNode.removeChild(parent);

      }
        
      // svuoto le liste quando torno indietro
     undo_redo_models = [];
     undo_redo_models_tmp = [];

    }, 0.1 * 1000);
  }
}

function modelButton() { 

  if (document.body.classList.contains("placing-cursor")) {
    document.body.classList.remove("placing-cursor");
    document.body.classList.add("selection");
    cursor_place.setAttribute("ar-hit-test", "doHitTest:false");
    cursor_place.setAttribute("visible", "false");
    return;
  }     
}

function backModelButton() {
  if (document.body.classList.contains("selection")) {
    setTimeout(function() {
      document.body.classList.remove("selection");
      document.body.classList.add("placing-cursor");
      cursor_place.setAttribute("ar-hit-test", "doHitTest:true");
      cursor_place.setAttribute("visible", "true");
    }, 0.1 * 1000);
  }
}

function cancelButton() {
    
  line = new Line([]);
  objects = [];
  vector_models = [];
  undo_redo_list = [];
  len_models = 0;
  c=0;
  undo_redo_models_tmp = [];
  

  
  // Prendo il caller (chi ha richiamato la funzione) e se questo valore è null, vuol dire che è stato richiamato dalla premuta del pulsante
  // altrimenti è stato richiamato dalla funzione drawPinned, e dunque non c'è bisogno di cancellare la canvas
  if(cancelButton.caller == null)
  {
    drawingContext.clearRect(0, 0, canvas.width, canvas.height);
    drawingContext.globalAlpha = 0.2;
    drawingContext.fillStyle = "#dbceed";
    drawingContext.fillRect(0, 0, canvas.width, canvas.height);
    
    
  }

  

  // nascondo i bottoni undo/redo quando cancello il tratto dalla canvas
  if(undo_button.innerHTML == "Undo" )
    undo_button.style.visibility = "hidden";


  if(redo_button.innerHTML == "Redo" )
    redo_button.style.visibility = "hidden";

  // se ho elementi nella lista quando cancello i tratti nella canvas, abilito undo redo di quei modelli
  if(undo_redo_models.length > 0)
    {
      undo_button.innerHTML = "Undo Model";
      redo_button.innerHTML = "Redo Model";
      undo_button.style.visibility = "visible";
    }

}

// funzione per posizionare il modello selezionato
function placeModel(event)
{
  // prendo il div padre del bottone selezionato
  parentDiv = event.target.parentNode;

  // ottengo una stringa contenente l'id del modello da creare e l'id da assegnare all'entità
  var id_model = "#"+parentDiv.children[0].innerText.toLowerCase();
  var id = "id_"+parentDiv.children[0].innerText.toLowerCase();

  if (document.body.classList.contains("selection")) {
    setTimeout(function() {
      
      // creo un'entità 
      var entity = document.createElement("a-entity");
      scene.appendChild(entity);

      // imposto l'id per il modello gltf, l'id per l'entità e il componente bar per il raycast sull'entità
      entity.setAttribute("gltf-model", id_model);
      entity.setAttribute("id",id);
      entity.setAttribute("bar", "");     
      
      // imposto la posizione del modello in base al cursore
      entity.setAttribute("position", {x:cursor_place.getAttribute("position").x,y:cursor_place.getAttribute("position").y,z:cursor_place.getAttribute("position").z});

      // imposto lo scale in base al modello, alcuni sono troppo grandi e vanno ridimensionati
      if(id_model == "#vase")
        entity.setAttribute("scale", "0.01 0.01 0.01");
      else        
         if(id_model == "#chair")
            entity.setAttribute("scale", "0.2 0.2 0.2");
         else
            entity.setAttribute("scale", "1 1 1");
        

      // la rotazione del modello dipende dalla camera, in questo modo, l'entità sarà sempre rivolta verso posizione della camera quando viene creato
     entity.object3D.rotation.set(
      THREE.Math.degToRad(0),
      THREE.Math.degToRad(camera.getAttribute("rotation").y),
      THREE.Math.degToRad(0)
      );
      
      // l'entità sarà visibile solamente quando Ar è attivo
      entity.setAttribute("show-in-ar-mode","");

      // una volta terminato, torno alla schermata precedente
      document.body.classList.remove("selection");
      document.body.classList.add("placing-cursor");
      cursor_place.setAttribute("ar-hit-test", "doHitTest:true");
      cursor_place.setAttribute("visible", "true");
    }, 0.1 * 1000);
  }          
}

// funzione per nascondere l'h3 del testo che avvisa l'utente di aver inserito un valore errato
function dissove(h3_element)
{
    setTimeout(function() {

      h3_element.style.visibility = "hidden";

           }, 3000);
}


// gestisco il comportamento del bottone Done per importare un nuovo modello      
function doneUrlFunction()
{
  // Prendo la stringa della textare del nome del modello
  var name = document.getElementById("textarea_name").value.toLowerCase();

  // prendo gli elementi con classe warning, ovvero due h3 per avvisare l'utente che ha inserito valori errati
  var warning_elements = document.getElementsByClassName("warning");
  var warning_name = warning_elements[0];
  var warning_url = warning_elements[1];

  // controllo se il nome è una stringa vuota o null
  if(name != "" && name != null)
  {
      // name sarà anche l'id del modello da importare, dunque bisogna evitare che ci siano due id uguali
      // flag diventa true se viene identificato un id già esisstente
      let flag = false;

      // scorro i bottoni "Place" dentro import models
       for (var i = 0; i < elements.length; i++)
       {
         // prendo il testo di ogni h3 già presente
         var n = elements[i].parentNode.children[0].innerText.toLowerCase();
         // Se trovo un id uguale, setto flag a true
         // trim su n per rimuovere caratteri in più
         if(n.trim() == name.toLowerCase())
           flag = true;

        } 

      // se non ho trovato duplicati, continuo
      if(!flag)
      {
            // ora prendo l'url del modello GLTF inserito nella textarea, che verrà inserito dentro result
            var result = document.getElementById("textarea_url").value;

            // non devono essere lasciati campi vuoti
            if(result != "" && result != null)
            {
              // se inserisco un link, questo deve sia avere HTTPS (altrimenti A-Frame non ritiene valido l'URL) e sia includere
              // l'estensione ".gltf"
              if(result.includes("https") && result.includes(".gltf"))
              {
                  // se result contiene queste due stringhe, controllo però che il link sia effettivamente valido e 
                  // funzionante, altrimenti sarebbe considerato valido anche un link come "https://.gltf"
                  $.ajax({
                      type: 'HEAD',
                      url: result,
                  success: function()
                  {
                          // Link valido
                          var name = document.getElementById("textarea_name").value;

                          // prendo il div contenente gli altri div dei modelli 3D già presenti, per poter aggiungere quest'ultimo
                          var div_models = document.getElementById("sel_model");

                          // creo div, h3 e bottone per il modello da importare
                          var div = document.createElement("div");
                          var h3 = document.createElement("h3");
                          var button = document.createElement("button");

                          // assegno classi e funzioni apposite per posizionare il modello
                          div.setAttribute("class","div-models");
                          h3.innerText = name;
                          button.setAttribute("class","models");
                          button.innerText = "Place";
                          button.addEventListener('click', placeModel);

                          div.appendChild(h3);
                          div.appendChild(button);
                          div_models.appendChild(div);

                          // una volta fatto ciò, devo aggiungere agli asset già esistenti un altro per il modello appena importato
                          var assets = document.getElementById("assets");
                          var asset_item = document.createElement("a-asset-item");
                          var name = h3.innerText.toLowerCase();
                          asset_item.setAttribute("id",name);
                          asset_item.setAttribute("src",result);

                          assets.appendChild(asset_item); 

                          // torno alla schermata precedente
                          document.body.classList.remove("url_mode");
                          document.body.classList.add("selection");

                  },
                  error: function()
                  {
                          // Link non valido
                          // Mostro errore all'utente
                          warning_url.style.visibility = "visible";
                          warning_url.innerText = "Invalid URL";
                          dissove(warning_url);
                  }
                  });

              }
              else
              {
                // Mostro errore all'utente
                warning_url.style.visibility = "visible";
                warning_url.innerText = "HTTPS and .GLFT required";
                dissove(warning_url);
              }
            }
            else
            {
              // Mostro errore all'utente
              warning_url.style.visibility = "visible";
              warning_url.innerText = "Textarea empty";
              dissove(warning_url);
            }         
      }
      else
      {
        // Mostro errore all'utente
        warning_name.style.visibility = "visible";
        warning_name.innerText = "Name already exists";
        dissove(warning_name);
      }
  }
  else
  {
    // Mostro errore all'utente
    warning_name.style.visibility = "visible";
    warning_name.innerText = "Textarea empty";
    dissove(warning_name);
  }


}

// funzione per importare un modello GLTF tramite URL
function urlModelButton()
{
  
  if(document.body.classList.contains("selection"))
  {
      document.body.classList.remove("selection");
      document.body.classList.add("url_mode");
      
      document.getElementById("textarea_name").value = ""; 
      document.getElementById("textarea_url").value = "";

  }
}


function exitButton() {
  scene.xrSession.end();
  console.log("EXIT");
}

function selectionMode(){

   if (document.body.classList.contains("placing-cursor")) {
      setTimeout(function() {  

    document.body.classList.remove("placing-cursor");
    document.body.classList.add("selectmode");
    cursor_place.setAttribute("ar-hit-test", "doHitTest:false");
    cursor_place.setAttribute("visible", "false");        }, 0.1 * 1000);

   }    

}


// funzione per nascondere/visualizzare la canvas nella modalità Pinned
function hudHandler()
{

   if(this.innerHTML == "Canvas: ON")
     {
       this.innerHTML = "Canvas: OFF";
       canvas.style.visibility = "hidden";

     }
  else
    {
      this.innerHTML = "Canvas: ON";
      canvas.style.visibility = "visible";
    }
}

function backUrlFunction()
{
    if(document.body.classList.contains("url_mode"))
    {
        // Torno alla schermata di selezione modelli
        document.body.classList.remove("url_mode");
        document.body.classList.add("selection");
    }
}