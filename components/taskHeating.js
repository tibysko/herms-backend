"use strict";

class TaskHeating {
    constructor(intervallTime){
        console.info("Starting taskheating with intervall: " + intervallTime);
        this.intervallTime = intervallTime;     
        this.counter = 10;   
    }
    
    start() {
        var parent = this;                
        this.process = setInterval(this.loop, this.intervallTime, parent);        
        console.info("Start TaskHeating");
    }
    
    stop(){
        console.info("stop TaskHeating");
        clearInterval(this.process);
    }
    
    loop(parent){        
        console.info("TaskHeating counter = " + parent.counter);
        parent.counter++;
                
    }        
}

module.exports = TaskHeating;