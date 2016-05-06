"use strict";

class TaskVort {
    constructor(intervallTime){
        console.info("Starting TaskVort with intervall: " + intervallTime);
        this.intervallTime = intervallTime;     
        this.counter = 0;   
    }
    
    start() {
        var parent = this;                
        this.process = setInterval(this.loop, this.intervallTime, parent);        
        console.info("Start TaskVort: " + this.process);
    }
    
    stop(){
        console.info("stop TaskVort: " + this.process);
        clearInterval(this.process);
    }
    
    loop(parent){        
        console.info("TaskVort: counter = " + parent.counter);
        parent.counter++;
                
    }        
}

module.exports = TaskVort;