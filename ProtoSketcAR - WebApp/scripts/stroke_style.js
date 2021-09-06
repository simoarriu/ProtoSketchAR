      function strokeButton() {
        
        // mostro la schermata per scegliere il colore tramite picker
        if (document.body.classList.contains("sketching")) {
            
            document.body.classList.remove("sketching");
            document.body.classList.add("strokecolor");
            strokeContext.lineWidth = width_stroke;
            if(count_color == 0)
              strokeContext.strokeStyle = "#ffffff";
            count_color++;
            drawStroke();
          
        }      
                
      }

      // conferma colore
      function donePicker() {
        
               if (document.body.classList.contains("strokecolor")) {
                 
                 document.body.classList.remove("strokecolor");
                 document.body.classList.add("sketching");
                 
                 // prendo l'hex corrente del color picker
                 hex = colorWheel.color.hexString;
                 drawingContext.lineWidth = width_stroke;
                 
               }
        
      }

      // make a handler function
      function colorChangeCallback(color) {
        strokeContext.strokeStyle = color.hexString;
        drawStroke();
        
      }

      // slider per modificare la dimensione del tratto
      function lineWidthInput() {
        
          var mySize = theLineWidth.value;
            // change the line width
          width_stroke = mySize;        
          strokeContext.lineWidth = mySize;          
          
          drawStroke();
      }
      
      // ridisegno la canavs di esempio
      function drawStroke(){        
          
          strokeContext.clearRect(0,0,stroke_canvas.width,stroke_canvas.height);
          
          strokeContext.globalAlpha = 0.2;
          strokeContext.fillStyle = "#dbceed";
          strokeContext.fillRect(0, 0, canvas.width, canvas.height);
        
          strokeContext.globalAlpha = 1;
    
          strokeContext.beginPath();
          strokeContext.moveTo(20,75);
          strokeContext.lineTo(270,75);
          strokeContext.stroke();

      }
