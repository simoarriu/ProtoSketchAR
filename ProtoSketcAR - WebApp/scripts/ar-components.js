AFRAME.registerComponent("show-in-ar-mode", {
	// Set this object visible while in AR mode.
	init: function () {
		this.el.sceneEl.addEventListener("enter-vr", () => {
			if (this.el.sceneEl.is("ar-mode")) {
				this.el.setAttribute("visible", true);
			}
		});
		this.el.sceneEl.addEventListener("exit-vr", () => {
			this.el.setAttribute("visible", false);
		});
	},
});

class HitTest {
	constructor(renderer, options) {

		this.renderer = renderer;
		this.xrHitTestSource = null;

		renderer.xr.addEventListener("sessionend", () => this.xrHitTestSource = null);
		renderer.xr.addEventListener("sessionstart", () => this.sessionStart(options));
		
		if (this.renderer.xr.isPresenting) {
			this.sessionStart(options)
		}
	}

	async sessionStart(options) {
		this.session = this.renderer.xr.getSession();
		
		if (options.space) {
			this.space = options.space;
			this.xrHitTestSource = await this.session.requestHitTestSource(options);
		} else if ( options.profile ) {
			this.transient = true;
			this.xrHitTestSource = await this.session.requestHitTestSourceForTransientInput(options);
		}
	}

	doHit(frame) {
		if (!this.renderer.xr.isPresenting) return;
		const refSpace = this.renderer.xr.getReferenceSpace();
		const xrViewerPose = frame.getViewerPose(refSpace);

		if (this.xrHitTestSource && xrViewerPose) {

			if (this.transient) {
				const hitTestResults = frame.getHitTestResultsForTransientInput(this.xrHitTestSource);
				if (hitTestResults.length > 0) {
					const results = hitTestResults[0].results;
					if (results.length > 0) {
						const pose = results[0].getPose(refSpace);
						return {
							inputSpace: hitTestResults[0].inputSource.targetRaySpace,
							pose
						};
					} else {
						return false
					}
				} else {
					return false;
				}
			} else {
				const hitTestResults = frame.getHitTestResults(this.xrHitTestSource);
				if (hitTestResults.length > 0) {
					const pose = hitTestResults[0].getPose(refSpace);
					return {
						pose,
						inputSpace: this.space
					};
				} else {
					return false;
				}
			}
		}
	}
}




const hitTestCache = new Map();
AFRAME.registerComponent("ar-hit-test", {
	schema: {
		target: { type: "selector" },
		doHitTest: { default: true }
	},

	init: function () {
		this.hitTest = null;
		this.hasFoundAPose = false;

		this.el.sceneEl.renderer.xr.addEventListener("sessionend", () => {
			this.hitTest = null;
			this.hasFoundAPose = false;
		});

		this.el.sceneEl.renderer.xr.addEventListener("sessionstart", async () => {
			const renderer = this.el.sceneEl.renderer;
			const session = this.session = renderer.xr.getSession();
			this.hasFoundAPose = false;

			// Default to selecting through the face
			const viewerSpace = await session.requestReferenceSpace('viewer');
			const viewerHitTest = new HitTest(renderer, {
				space: viewerSpace
			});
			this.hitTest = viewerHitTest;

			// These are transient inputs so need to be handled seperately
			const profileToSupport = "generic-touchscreen";
			const transientHitTest = new HitTest(renderer, {
				profile: profileToSupport,
			});

			session.addEventListener('touchstart', ({ inputSource }) => {
        
				if (!this.data.doHitTest) return;
				if (inputSource.profiles[0] === profileToSupport) {
					this.hitTest = transientHitTest;
				} else {
					this.hitTest = hitTestCache.get(inputSource) || new HitTest(renderer, {
						space: inputSource.targetRaySpace
					});
					hitTestCache.set(inputSource, this.hitTest);
				}
				this.el.setAttribute('visible', true);
			});

      
			session.addEventListener('touchend', ({ inputSource }) => {
        
        console.log("Select end");
        
				this.needsSelectEventForInputSource = inputSource;

				if (!this.data.doHitTest) return;

				if (this.hasFoundAPose) {

					this.el.setAttribute('visible', false);

					this.hitTest = null;

					// For transient input sources fall back to viewer hit testing
					// after a short while after the transient input source is no longer available.
					// To give a consistent interaction experience
					if (inputSource.profiles[0] === profileToSupport) {
						setTimeout(() => {
							this.hitTest = viewerHitTest;
						}, 300);
					}
	
					if (this.data.target) {
						const target = this.data.target;				
						target.setAttribute("position", this.el.getAttribute("position"));
						target.object3D.quaternion.copy(this.el.object3D.quaternion);
						target.setAttribute("visible", true);
					}

				}
			});
      
		});
	},
	tick: function () {
		const frame = this.el.sceneEl.frame;

		if (!frame) return;

		if (this.needsSelectEventForInputSource) {
			const inputSource = this.needsSelectEventForInputSource;
			this.needsSelectEventForInputSource = false;

			const space = inputSource.targetRaySpace;
			try {
				const pose = frame.getPose(space, this.el.sceneEl.renderer.xr.getReferenceSpace());
				this.el.emit('select', { inputSource, pose });
			} catch (e) {
				console.log(e);
			}
		}

		if (this.hitTest && this.data.doHitTest) {
			const result = this.hitTest.doHit(frame);
			if (result) {

				const { pose, inputSpace } = result;

				this.hasFoundAPose = true;
				try {
					this.currentControllerPose = frame.getPose(inputSpace, this.el.sceneEl.renderer.xr.getReferenceSpace());
				} catch (e) {
					console.log(e);
				}

				this.el.setAttribute('visible', true);
				this.el.setAttribute("position", pose.transform.position);
				this.el.object3D.quaternion.copy(pose.transform.orientation);
			}
		}
	},
});



AFRAME.registerPrimitive('a-hit-test', {
    defaultComponents: {
        'ar-hit-test': {}
    },
    mappings: {
        target: 'ar-hit-test.target',
    }
});


AFRAME.registerComponent('camera-listener', {
  tick: function () {
     
   // aggiorno ad ogni frame la matrice della camera
    this.el.object3D.updateMatrixWorld();
    
    // aggiorno worldPos
    worldPos.setFromMatrixPosition(this.el.object3D.matrixWorld);
    
    // definisco vettori che conterranno le informazioni quali posizione e scalatura della camera
    var po = new THREE.Vector3();
    var sca = new THREE.Vector3();
    
    // inserisco i rispettivi valori per la posizione, quaternione e scalatura
    this.el.object3D.matrixWorld.decompose( po, quaternion, sca );

    
  }
});

// componente per riprodurre il tratto sulla canvas sul piano traslucido
AFRAME.registerComponent("draw", {
        init: function() {

          this.texture = null;
          
          let canvas = document.getElementById("source-canvas"); 
        
                   
          this.isDrawing = false;
          
          //creo una nuova canvas, che sarà trasparente,. Questa canvas viene applicata come texture al
          // piano traslucido quando l'utente termina di disegnare
          var newCanvas = document.createElement('canvas');
          var context = newCanvas.getContext('2d');
          
          newCanvas.width = canvas.width;
          newCanvas.height = canvas.height;

          //apply the old canvas to the new one
          context.drawImage(canvas, 0, 0);
          
          // Quando l'utente disegna, prendo i tratti dalla canvas per eseguire il feedback
          canvas.addEventListener("touchstart", e => {
            this.isDrawing = true;
            
            let mesh = this.el.getObject3D("mesh");      
            this.texture = new THREE.CanvasTexture(canvas);
            let textureToBeRemoved = mesh.material.map;
            mesh.material.map = this.texture;
            if (textureToBeRemoved) textureToBeRemoved.dispose();
          });
          
          // quando termino, il piano diventa nuovamente vuoto
            canvas.addEventListener("touchend", e => {
            this.isDrawing = false;
            let mesh = this.el.getObject3D("mesh");      
            this.texture = new THREE.CanvasTexture(newCanvas);
            let textureToBeRemoved = mesh.material.map;
            mesh.material.map = this.texture;
            if (textureToBeRemoved) textureToBeRemoved.dispose();
          });
          
          
          // assegno il material della mesh
          this.el.addEventListener("loaded", e => {
            let mesh = this.el.getObject3D("mesh");      
            this.texture = new THREE.CanvasTexture(canvas);
            let textureToBeRemoved = mesh.material.map;
            mesh.material.map = this.texture;
            if (textureToBeRemoved) textureToBeRemoved.dispose();
          });
        },
        // aggiorno la texture
        tick: function() {
          if(this.texture)
            this.texture.needsUpdate = true;

        }
      });



// componente utilizzato per muovere il rettangolo traslucido assieme al dispositivo
AFRAME.registerComponent('move_rect', {
  init: function () {
    // Set up the tick throttling.
    this.tick = AFRAME.utils.throttleTick(this.tick, 10, this);
  },
  
  tick: function() {

    // definisco velocità e raggio del movimento del rettangolo
    var speed = 10;
    var radius = 0.1;    
    
    // modifica la posizione del rettangolo in base ai valori dello slider della x e della z
    this.el.setAttribute('position',{
          x: radius*Math.cos((tick_x)*speed) + cursor_place.getAttribute("position").x,
          y: worldPos.y,
          z: radius*Math.sin((tick_z)*speed) + cursor_place.getAttribute("position").z
        });
           
  
    // rivolgo il rettangolo sempre davanti alla camera
    this.el.object3D.lookAt(worldPos);

      
    // aggiorno la rotazione del rettangolo in base a quella del dispositivo
    this.el.object3D.quaternion.copy(quaternion);    
    
  }
});

  
  // gestisco il valore dello slider per modificare l'asse x e z
  function lineRotation() {
        
          tick_z = LineRotation.value;

      }

  function lineRotationX() {
        
          tick_x = LineRotationX.value;
          
      }

// Componente applicato all'entità su cui eseguire il ridimensionamento tramite gesture rilevata da Hammer
AFRAME.registerComponent("scaling",{
    init:function() {

       // rilevo il pinch sullo schermo come evento (due dita)
       hammertime.on("pinch", (ev) => {
          
        // questo controllo serve per eseguire il pinch solamente sull'entità sulla quale viene
        // eseguito il raycast, per evitare che il pinch venga applicato anche su altri modelli nella scena
        if(this.el.id == id_ent)
        {
             // imposto il vettore scale in base al pinch eseguito su schermo
             let scale = {x:(ev.scale), y:(ev.scale), z:(ev.scale)};

             // imposto il ridimensionamento all'entità
             this.el.object3D.scale.set(scale.x,scale.y,scale.z);

        }
      });
  }
});


// Componente applicato all'entità su cui eseguire la rotazione tramite gesture rilevata da Hammer
// Oltre alla rotazione, questo componente sfrutta il Pan per spostare il modello nell'asse Y durante l'operazione Move
AFRAME.registerComponent("rotating",{
    init:function() {
      
        // rilevo il pinch sullo schermo come evento (un dito)
        hammertime.on('pan', (ev) => {
          
          // questo controllo serve per eseguire il pinch solamente sull'entità sulla quale viene
          // eseguito il raycast, per evitare che il pinch venga applicato anche su altri modelli nella scena
          if(this.el.id == id_ent)
          {
                // Se sono nella modalità Rotate, lavoro sull'attributo rotation
                if(b_name == "Rotate")
                {
                     // prendo la rotazione dell'entità corrente
                    let rotation = this.el.getAttribute("rotation");

                    // cambio i valori di rotazione in base alla direzione del pan
                    switch(ev.direction) {
                      case 2:
                        rotation.y = rotation.y + 4
                        break;
                      case 4:
                        rotation.y = rotation.y - 4
                        break;
                      case 8:
                        rotation.x = rotation.x + 4
                        break;
                      case 16:
                        rotation.x = rotation.x - 4
                        break;
                      default:
                        break;
                    }

                    // reimposto la rotazione aggiornata
                    this.el.setAttribute("rotation", rotation);
                }
                else
                {
                  // Se sono nella modalità Move, lavoro sull'attributo position
                  if(b_name == "Move")
                  {
                      // Prendo l'attributo position
                      let position = this.el.getAttribute("position");
   
                      // cambio i valori di posizione in base alla direzione del pan (8 pan verso su, 16 pan verso giu)
                      switch(ev.direction) {
                        case 8:
                          position.y = position.y + 0.005
                          break;
                        case 16:
                          position.y = position.y - 0.005
                          break;
                        default:
                          break;
                      }

                      // reimposto la posizione aggiornata
                      this.el.setAttribute("position", position);
                  }

                }
            
             
          }
        });
  }
});



// Questo componente viene applicato alle entità sulle quali eseguire il raycast. In particolare, siccome non è
// stato possibile applicare bar direttamente all'entità padre, è stato inserito un box trasparente dentro ogni
// disegno a mano che permette di rilevare il raycast. Questo non è stato fatto invece per i modelli 3D
AFRAME.registerComponent("bar", {
  init: function() {
    
    // Gestisco intersezione con l'entità
    this.el.addEventListener('raycaster-intersected', (evt) => {
      
      // setto il booleano a true
      intersecting = true;
      
      // identifico l'entità intersecata. evt.target è il box citato sopra, dunque per ottenere l'entità padre
      // salgo attraverso i parentNode
      var entity = evt.target.parentNode.parentNode;
      
      // preno l'id dell'entità
      id_ent = entity.getAttribute("id");
      
      // se questo è null, allora prendo l'id di un modello 3D, in quanto sto prendendo in considerazione
      // solamente evt.target, dunque direttamente l'entità sulla quale eseguo il raycast
      if(id_ent == null)
        id_ent = evt.target.getAttribute("id");
      
      // se questo è ancora null, allora vuol dire che non ho intersecato nè con un box di un disegno 
      // tramite Pinned, nè con un modello 3D, e dunque con un disegno tramite Standard Mode
      if(id_ent == null)
        id_ent = evt.target.parentNode.getAttribute("id");

    })

    // Gestisco il caso quando il raycast non interseca più l'entità
    this.el.addEventListener("raycaster-intersected-cleared", (e) => {
          // setto il booleano a false
          intersecting = false;
    })      

    },
  
  // ad ogni frame, controllo se intersecting è true/false per mostrare o meno il div con i bottoni
  // per eseguire le operazioni standard
  tick: function()
    {

      var div = document.getElementById("div-sca-rot-del");

      if(intersecting)
        div.style.visibility = "visible";

      if(!intersecting)
        div.style.visibility = "hidden";

    }
})

// componente applicato ad un modello per muoverlo assieme al cursore
AFRAME.registerComponent('move_model', {
  tick: function() {
    
    // idenfico il cursore a terra
    var cursor = document.querySelector("[ar-hit-test]");
    
    // Finchè la y del modello è pari o maggiore della y del cursore, allora aggiorno la posizione
    // quando invece il modello scende sotto il cursore, allora si ferma
    if(this.el.getAttribute("position").y+0.02 >= cursor.getAttribute("position").y)
    {
      this.el.setAttribute('position',{
        x: cursor.getAttribute("position").x,
        y: this.el.getAttribute("position").y,
        z: cursor.getAttribute("position").z
      });
    }
  }
});