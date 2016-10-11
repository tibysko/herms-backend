/*

  Created  2016
  by Ola Adolfsson & Martin Berglund

  http://www.arduino.cc/en/Tutorial/SerialEvent

*/

String inputString = "";         // a string to hold incoming data
boolean stringComplete = false;  // whether the string is complete

String cmd;
String pin;
int value;

void setup() {
  // initialize serial
  Serial.begin(9600);

  cmd.reserve(2);
  pin.reserve(3);

  // ENABLE PULLUP for digital IN pins 40 - 53
  for (int pinId = 40 ; pinId < 54; pinId++) {
    pinMode(pinId, INPUT_PULLUP);
  }

  // ENABLE PULLUP for analog (to digital) IN pins 60 - 67
  for (int pinId = 60 ; pinId < 68; pinId++) {
    pinMode(pinId, INPUT);
    digitalWrite(pinId, HIGH);
  }

  // ENABLE PULLUP for digital OUT pins 2 - 22
  for (int pinId = 2 ; pinId < 23; pinId++) {
    pinMode(pinId, OUTPUT);
  }

  // ENABLE PULLUP for analog IN pins 54 - 57
  for (int pinId = 54 ; pinId < 57; pinId++) {
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
    pin = inputString.substring(2, 5);
    value = inputString.substring(5, 9).toInt();

    int actualPin = -1;
    if (pin.substring(0, 1) == "A") {
      actualPin = pin.substring(1, 3).toInt() + 54; // Analog Pin = Max digital no + analog pin no + 1 (eg A2 = 53 + 2 + 1)
    } else {
      actualPin = pin.toInt();
    }

    if (cmd == "DW") {
      Serial.println("id dw");
      digitalWrite(actualPin, value);

    } else if (cmd == "DR") {
      Serial.print("Value: ");
      Serial.println(digitalRead(actualPin));

    } else if (cmd == "AR") {
      Serial.print("AR Value: ");
      Serial.println(analogRead(actualPin));

    } else if (cmd == "AW") {
      Serial.print("AW Value: ");
      analogWrite(actualPin, value);

    }

    // clear the string:
    inputString = "";
    stringComplete = false;
  }
}

/*
  SerialEvent occurs whenever a new data comes in the
  hardware serial RX.  This routine is run between each
  time loop() runs, so using delay inside loop can delay
  response.  Multiple bytes of data may be available.
*/
void serialEvent() {
  while (Serial.available()) {
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


