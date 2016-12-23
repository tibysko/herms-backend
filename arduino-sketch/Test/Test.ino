/*

  Created  2016
  by Ola Adolfsson & Martin Berglund

  PinIDs for analog pins
  A0 = 54
  A15= 69

*/

// Setup variables

typedef struct
{
  String type   = "";  //DI (Digital IN), ADI (Analog to digital IN), DO (Digital OUT), PWM, AI (Analog IN),
  int value     = 0;
  int closedId  = 0;
  int openedId  = 0;
}  board_type;

board_type board[69]; //Board setup

long millisWriteTemp    = 0;          //Records last update
long intervalWrite      = 100;        //Interval for write serial

String inputString      = "";         // a string to hold incoming data
String resultString     = "";
boolean stringComplete  = false;      // whether the string is complete

String cmd;
int pin;
int value;

// Contants
const int DI_START = 40;
const int DI_END = 53;

const int ADI_START = 60;
const int ADI_END = 67;

const int DO_START = 2;
const int DO_END = 39;

const int AI_START = 54;
const int AI_END = 59;

//Setup program
void setup() {

  // initialize serial
  Serial.begin(115200);

  cmd.reserve(2);

  // Set mode fordigital IN and enable pullup resistor - pins 40 - 53
  for (int pinId = DI_START ; pinId <= DI_END; pinId++) {
    pinMode(pinId, INPUT_PULLUP);
    board[pinId].type = "DI";
  }

  // Set mode for analog (to digital) IN and enable pullup resistor - pins 60 - 67
  for (int pinId = ADI_START ; pinId <= ADI_END; pinId++) {
    pinMode(pinId, INPUT);
    digitalWrite(pinId, HIGH);
    board[pinId].type = "ADI";
  }

  // Set mode for digital OUT pins 2 - 39
  for (int pinId = DO_START ; pinId <= DO_END; pinId++) {
    pinMode(pinId, OUTPUT);
    board[pinId].type = "DO";
  }

  // Set mode PWM
  board[10].type = "PWM";
  board[11].type = "PWM";


  // Set mode for analog IN pins 54 - 59
  for (int pinId = AI_START ; pinId <= AI_END; pinId++) {
    pinMode(pinId, INPUT);
    board[pinId].type = "AI";
  }
}

//Main loop
void loop() {
  unsigned long currentMillis = millis();

  if (abs(currentMillis - millisWriteTemp) > intervalWrite) {
    millisWriteTemp = currentMillis;
    writeToSerial(); //Write all indata (DI, ADI, AI) to serial port

  }

  if (stringComplete) {
    writeToBoard(); //Handle new data on serial port
  }


}


void writeToBoard() {
  //  Command example AWA100255
  //  AW = cmd. Length 2 char
  //  A10 = pin ('A' is for analog, 0 (zero) for digital) Length 3 char
  //  0255 = chars pin value. Length 4 char

  cmd   = inputString.substring(0, 2);
  pin   = inputString.substring(2, 5).toInt();
  value = inputString.substring(5, 9).toInt();

  for (int pinId = 1 ; pinId <= 69; pinId++) {


    if (pin == pinId && board[pinId].type == "DO") {
      digitalWrite(pin, value);

    } else if (pin == pinId && board[pinId].type == "PWM") {
      analogWrite(pin, value);

    }
  }
  // clear the string:
  inputString = "";
  stringComplete = false;
}


void writeToSerial() {

  // Read digital pins and print to serial port
  for (int pinId = DI_START ; pinId <= DI_END; pinId++) {
    resultString = pinId;
    resultString += '|';
    resultString += !digitalRead(pinId);

    Serial.println(resultString);
  }

  // Read analog to digital pins and print to serial port
  for (int pinId = ADI_START ; pinId <= ADI_END; pinId++) {
    resultString = pinId;
    resultString += '|';
    resultString += !digitalRead(pinId);

    Serial.println(resultString);
  }

  // Read analog pins and print to serial port
  for (int pinId = AI_START ; pinId <= AI_END; pinId++) {
    resultString = pinId;
    resultString += '|';
    resultString += analogRead(pinId);

    Serial.println(resultString);


  }
}

/*
  SerialEvent occurs whenever a new data comes in the
  hardware serial RX.  This routine is run between each
  time loop() runs, so using delay inside loop can delay
  response.  Multiple bytes of data may be available.
*/
void serialEvent() {
  while (Serial.available() && !stringComplete) {
    // get the new byte:
    char inChar = (char)Serial.read();
    // add it to the inputString:
    inputString += inChar;
    // if the incoming character is a newline, set a flag
    // so the main loop can do something about it:
    if (inChar == '\n') {
      stringComplete = true;
    }
  }
}


