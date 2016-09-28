var async = require('async/series');

class PreheatingProcess{

    constructor(){
        this.processes = [];
    }

    add(setPoint, setPointDuration){
        this.processes.push({
            'setPoint' : setPoint,
            'setPointDuration': setPointDuration     
        });
        
    }

    getProcesses(){
        return this.processes;
    }

    start(){

    }

    stop(){

    }
}

exports = PreheatingProcess;