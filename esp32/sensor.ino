#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// ---------------- POSTAVKE MREŽE I MQTT-a ----------------
const char* ssid        = "matan";
const char* password    = "ajfon15123";
const char* mqtt_server = "172.20.10.9";
const int   mqtt_port   = 1883;
const char* mqtt_topic  = "smartparking/parking_demo/spot_update";
const char* mqtt_user   = "smartparking";
const char* mqtt_pass   = "parking123";

// ---------------- IDENTIFIKACIJA ----------------
const char* parking_id = "parking_demo";
const char* spot_id    = "A1";
const char* source     = "sensor";

WiFiClient   espClient;
PubSubClient client(espClient);

// ---------------- PIN DEFINICIJE ----------------
const int trigPin  = 2;
const int echoPin  = 3;
const int ledGreen = 5;

// ---------------- LOGIKA PARKINGA ----------------
const int DISTANCE_THRESHOLD = 50;

long duration;
int  distance;
bool isOccupied   = false;
bool lastOccupied = false;
bool firstReading = true;

// -----------------------------------------------
const char* mqttStateToString(int state) {
  switch (state) {
    case -4: return "MQTT_CONNECTION_TIMEOUT";
    case -3: return "MQTT_CONNECTION_LOST";
    case -2: return "MQTT_CONNECT_FAILED";
    case -1: return "MQTT_DISCONNECTED";
    case  0: return "MQTT_CONNECTED";
    case  1: return "MQTT_CONNECT_BAD_PROTOCOL";
    case  2: return "MQTT_CONNECT_BAD_CLIENT_ID";
    case  3: return "MQTT_CONNECT_UNAVAILABLE";
    case  4: return "MQTT_CONNECT_BAD_CREDENTIALS";
    case  5: return "MQTT_CONNECT_UNAUTHORIZED";
    default: return "NEPOZNATA_GREŠKA";
  }
}

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Spajanje na WiFi: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi spojen!");
  Serial.print("IP adresa ESP32: ");
  Serial.println(WiFi.localIP());
  Serial.print("Signal jakost (RSSI): ");
  Serial.print(WiFi.RSSI());
  Serial.println(" dBm");
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Pokušaj spajanja na MQTT broker (");
    Serial.print(mqtt_server);
    Serial.print(":");
    Serial.print(mqtt_port);
    Serial.println(")...");

    String clientId = "ESP32_ParkingSenzor_";
    clientId += String(random(0xffff), HEX);
    Serial.print("Client ID: ");
    Serial.println(clientId);

    if (client.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
      Serial.println("Spojeno na broker!");
    } else {
      int state = client.state();
      Serial.print("Greška: ");
      Serial.print(mqttStateToString(state));
      Serial.print(" (rc=");
      Serial.print(state);
      Serial.println(") — pokušavam ponovo za 5 sekundi...");
      delay(5000);
    }
  }
}

String getTimestamp() {
  unsigned long ms = millis();
  unsigned long s  = ms / 1000;
  unsigned long m  = s / 60;
  unsigned long h  = m / 60;
  char buf[30];
  sprintf(buf, "uptime_%02lu:%02lu:%02lu", h, m % 60, s % 60);
  return String(buf);
}

// -----------------------------------------------
void setup() {
  Serial.begin(115200);

  pinMode(trigPin,  OUTPUT);
  pinMode(echoPin,  INPUT);
  pinMode(ledGreen, OUTPUT);

  digitalWrite(ledGreen, LOW);

  setup_wifi();

  client.setServer(mqtt_server, mqtt_port);
  client.setKeepAlive(60);      // keep-alive interval u sekundama
  client.setSocketTimeout(10);  // TCP timeout u sekundama
}

// -----------------------------------------------
void loop() {
  if (!client.connected()) {
    Serial.print("MQTT veza izgubljena — state: ");
    Serial.println(mqttStateToString(client.state()));
    reconnect();
  }
  client.loop();

  // --- 1. MJERENJE ---
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  duration = pulseIn(echoPin, HIGH);
  distance = duration * 0.034 / 2;

  // --- 2. ODREĐIVANJE STANJA ---
  isOccupied = (distance > 0 && distance < DISTANCE_THRESHOLD);

  // --- 3. LED ---
  if (!isOccupied) {
    if (digitalRead(ledGreen) == LOW) {
      digitalWrite(ledGreen, HIGH);
      Serial.println("LED UPALJENA — mjesto slobodno");
    }
  } else {
    if (digitalRead(ledGreen) == HIGH) {
      digitalWrite(ledGreen, LOW);
      Serial.println("LED UGAŠENA — mjesto zauzeto");
    }
  }

  // --- 4. MQTT: šalji samo pri promjeni ---
  if (firstReading || isOccupied != lastOccupied) {

    StaticJsonDocument<256> doc;
    doc["parkingId"] = parking_id;
    doc["spotId"]    = spot_id;
    doc["occupied"]  = isOccupied;
    doc["online"]    = true;
    doc["source"]    = source;
    doc["timestamp"] = getTimestamp();

    char jsonBuffer[300];
    serializeJson(doc, jsonBuffer);

    Serial.print("Šaljem MQTT poruku [");
    Serial.print(isOccupied ? "ZAUZETO" : "SLOBODNO");
    Serial.print("]: ");
    Serial.println(jsonBuffer);

    bool ok = client.publish(mqtt_topic, jsonBuffer);
    if (!ok) {
      Serial.println("UPOZORENJE: publish() nije uspio!");
    }

    lastOccupied = isOccupied;
    firstReading = false;
  } else {
    Serial.print("Bez promjene (");
    Serial.print(isOccupied ? "zauzeto" : "slobodno");
    Serial.print("), distance=");
    Serial.print(distance);
    Serial.println("cm — ne šaljem");
  }

  delay(3000);
}