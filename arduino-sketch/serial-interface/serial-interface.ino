/*

  Created  2016
  by Ola Adolfsson & Martin Berglund

  A0 = 54
  A15= 69

*/

String inputString = "";         // a string to hold incoming data
String resultString = "";
boolean stringComplete = false;  // whether the string is complete

String cmd;
int pin;
int value;

// Pin ranges
const int DIGITAL_IN_START = 40;
const int DIGITAL_IN_END = 53;

const int DIGITAL_2_ANALOG_START = 60;
const int DIGITAL_2_ANALOG_END = 67;

const int DIGITAL_OUT_START = 2;
const int DIGITAL_OUT_END = 39;

const int ANALOG_IN_START = 54;
const int ANALOG_IN_END = 57;

void setup() {
  // initialize serial
  Serial.begin(9600);

  cmd.reserve(2);

  // ENABLE PULLUP for digital IN pins 40 - 53
  for (int pinId = DIGITAL_IN_START ; pinId <= DIGITAL_IN_END; pinId++) {
    pinMode(pinId, INPUT_PULLUP);
  }

  // ENABLE PULLUP for analog (to digital) IN pins 60 - 67
  for (int pinId = DIGITAL_2_ANALOG_START ; pinId <= DIGITAL_2_ANALOG_END; pinId++) {
    pinMode(pinId, INPUT);
    digitalWrite(pinId, HIGH);
  }

  // ENABLE PULLUP for digital OUT pins 2 - 39
  for (int pinId = DIGITAL_OUT_START ; pinId <= DIGITAL_OUT_END; pinId++) {
    pinMode(pinId, OUTPUT);
  }

  // ENABLE PULLUP for analog IN pins 54 - 57
  for (int pinId = ANALOG_IN_START ; pinId <= ANALOG_IN_END; pinId++) {
    pinMode(pinId, INPUT);
  }
}

void loop() {

  if (stringComplete) {
    /* Command example AWA100255
       AW = cmd. Length 2 char
       A10 = pin ('A' is for analog, 0 (zero) for digital) Length 3 char
       0255 = chars pin value. Length 4 char
    */

    cmd = inputString.substring(0, 2);
    pin = inputString.substring(2, 5).toInt();
    value = inputString.substring(5, 9).toInt();

    if (cmd == "DW") {
      Serial.println("id dw");
      digitalWrite(pin, value);

    } else if (cmd == "DR") {
      Serial.print("Value: ");
      Serial.println(digitalRead(pin));

    } else if (cmd == "AR") {
      Serial.print("AR Value: ");
      Serial.println(analogRead(pin));

    } else if (cmd == "AW") {
      Serial.print("AW Value: ");
      analogWrite(pin, value);

    }

    // clear the string:
    inputString = "";
    stringComplete = false;
  }

  readPins();
  
  delay(500); 
}

void readPins() {

  // Read digital pins
  for (int pinId = DIGITAL_IN_START ; pinId <= DIGITAL_IN_END; pinId++) {
    resultString = pinId;
    resultString += '|';
    resultString += !digitalRead(pinId);

    Serial.println(resultString);
  }

  // Read analog to digital pins
  for (int pinId = DIGITAL_2_ANALOG_START ; pinId <= DIGITAL_2_ANALOG_END; pinId++) {
    resultString = pinId;
    resultString += '|';
    resultString += !digitalRead(pinId);

    Serial.println(resultString);
  }

  // Read analog pins
  for (int pinId = ANALOG_IN_START ; pinId <= ANALOG_IN_END; pinId++) {
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


