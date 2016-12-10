# brewery-backend
Brewery backend

## Installation
1. Open Git bash, nagivate to desired folder
2. Clone repo, run: `git clone https://github.com/tibysko/herms-backend.git`
3. `cd herms-backend`
4. Install dependencies, run: `npm install`

## Start backend
1. Start backend, run: `npm start`

## Start backend with mocked Arduino
Start backend, run: `npm run start-mock`

## List ports
Run `npm run list-ports` will list which port the Arduino is connected to.  

Note you might have to change com-port in `src/board/board.js`.

If complaining about "Nodemon.. " run: `npm install -g nomdemon`


## Misc

### Code style 
Code style is based on https://github.com/felixge/node-style-guide#no-nested-closures
Run `npm run jslint` to lint your code