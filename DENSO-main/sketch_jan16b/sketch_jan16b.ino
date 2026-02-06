#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver();

#define SERVO_FREQ 50 
int pulseMin = 480; 
int pulseMax = 2550; 

const int CH_BASE     = 0;
const int CH_SHOULDER = 1;
const int CH_ELBOW    = 2;
const int CH_GRIPPER  = 3;

// --- PHẦN HIỆU CHỈNH ---
const int OFFSET_SERVO = 45; 
const int OFFSET_ELBOW = 4; 
// Nếu chỉ Base bị lệch, ta dùng hệ số này. 90/94 = 0.957
float scaleBase = 0.957; 
float scaleShoulder = 0.68;

void setup() {
  Serial.begin(9600);
  Serial.setTimeout(10); 

  pwm.begin();
  pwm.setOscillatorFrequency(27000000);
  pwm.setPWMFreq(SERVO_FREQ);

  // Khởi tạo vị trí (Góc truyền vào là góc logic 0-180)
  moveServo(CH_BASE,     53, scaleBase); // 0-90 là từ phải sang trái. 53 là xoay cánh tay ở giữa
  moveServo(CH_SHOULDER, 90, scaleShoulder); // 0-90 là từ ngang lên thẳng đứng
  moveServo(CH_ELBOW,    0 + OFFSET_ELBOW, scaleShoulder);  // 0-90 từ vuông góc vai tới duỗi thẳng
  moveServo(CH_GRIPPER, 10, 1.0); // 10 mở - 55 kẹp

  Serial.println("Robot Ready - Scale & Offset Fixed");
}

// Thêm tham số scale vào hàm để chỉnh từng con
void moveServo(int channel, float angle, float scale) {
  // 1. Nhân tỉ lệ trước để bù sai số cơ khí
  float calibratedAngle = angle * scale;
  
  // 2. Cộng offset để đưa vào dải tuyến tính (45-135)
  float finalAngle = constrain(calibratedAngle + OFFSET_SERVO, 0, 180); 
  
  // 3. Tính Microseconds
  int pulse_us = map(finalAngle, 0, 180, pulseMin, pulseMax);
  
  // 4. Chuyển sang Counts cho PCA9685
  int counts = map(pulse_us, 0, 20000, 0, 4095);
  
  pwm.setPWM(channel, 0, counts);
}

void loop() {
  if (Serial.available() > 0) {
    String data = Serial.readStringUntil('\n');
    
    int bIdx = data.indexOf("B:");
    int sIdx = data.indexOf(",S:");
    int eIdx = data.indexOf(",E:");
    int gIdx = data.indexOf(",G:");

    if (bIdx != -1 && sIdx != -1 && eIdx != -1 && gIdx != -1) {
      float b = data.substring(bIdx + 2, sIdx).toFloat();
      float s = data.substring(sIdx + 3, eIdx).toFloat();
      float e = data.substring(eIdx + 3, gIdx).toFloat();
      int g = data.substring(gIdx + 3).toInt();

      // Áp dụng moveServo với scale riêng cho từng trục
      moveServo(CH_BASE,     b, scaleBase);
      moveServo(CH_SHOULDER, s, scaleShoulder);
      moveServo(CH_ELBOW,    e + OFFSET_ELBOW, scaleShoulder);
      moveServo(CH_GRIPPER,  (float)g, 1.0);
      
      Serial.print("ACK_CALIBRATED:"); Serial.println(data);
    }
  }
}