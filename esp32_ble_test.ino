#include <driver/ledc.h>  // ✅ PWM 제어를 위한 라이브러리 추가

#define MOTOR_PIN_1_PWM 12  // 1st 진동모터
#define MOTOR_PIN_1_DIR 13 
#define MOTOR_PIN_2_PWM 25  // 2nd 진동모터
#define MOTOR_PIN_2_DIR 26 
#define MOTOR_PIN_3_PWM 16   // 3rd 진동모터
#define MOTOR_PIN_3_DIR 17  
#define MOTOR_PIN_4_PWM 18  // 4th 진동모터
#define MOTOR_PIN_4_DIR 19

#define LEDC_FREQ 350  // ✅ PWM 주파수
#define LEDC_RESOLUTION 8  // ✅ PWM 분해능 (8비트 = 0~255)

bool motorState = false;
unsigned long lastUpdateTime = 0;

void setup() {
    Serial.begin(230400);  // ✅ USB Serial 통신 시작 (속도 230400bps로 향상)

    // ✅ 진동모터 PWM 설정
    ledcAttach(MOTOR_PIN_1_PWM, LEDC_FREQ, LEDC_RESOLUTION);
    ledcAttach(MOTOR_PIN_2_PWM, LEDC_FREQ, LEDC_RESOLUTION);
    ledcAttach(MOTOR_PIN_3_PWM, LEDC_FREQ, LEDC_RESOLUTION);
    ledcAttach(MOTOR_PIN_4_PWM, LEDC_FREQ, LEDC_RESOLUTION);

    // ✅ 모든 진동모터의 방향 제어 핀을 OUTPUT으로 설정
    pinMode(MOTOR_PIN_1_DIR, OUTPUT);
    pinMode(MOTOR_PIN_2_DIR, OUTPUT);
    pinMode(MOTOR_PIN_3_DIR, OUTPUT);
    pinMode(MOTOR_PIN_4_DIR, OUTPUT);

    // ✅ 기본 방향 설정
    digitalWrite(MOTOR_PIN_1_DIR, LOW);  
    digitalWrite(MOTOR_PIN_2_DIR, LOW);  
    digitalWrite(MOTOR_PIN_3_DIR, LOW);  
    digitalWrite(MOTOR_PIN_4_DIR, LOW);  

    Serial.println("✅ ESP32 Web Serial API 모드 시작됨!");
}

void loop() {
    if (Serial.available()) {  // ✅ USB Serial 데이터 수신
        int intensity = Serial.read();  // ✅ 수신된 데이터 읽기 (0~255 값)

        if (intensity > 0) {
            // ✅ 모든 진동모터 방향 설정
            digitalWrite(MOTOR_PIN_1_DIR, LOW);
            digitalWrite(MOTOR_PIN_2_DIR, LOW);
            digitalWrite(MOTOR_PIN_3_DIR, LOW);
            digitalWrite(MOTOR_PIN_4_DIR, LOW);

            // ✅ 진동모터 PWM 신호 출력
            ledcWrite(MOTOR_PIN_1_PWM, intensity);
            ledcWrite(MOTOR_PIN_2_PWM, intensity);
            ledcWrite(MOTOR_PIN_3_PWM, intensity);
            ledcWrite(MOTOR_PIN_4_PWM, intensity);

            Serial.printf("💥 PWM 신호 전송됨: 진동 강도 = %d (0~255)\n", intensity);

            motorState = true;
        } else {
            stopMotors();  // ✅ PWM OFF
        }

        lastUpdateTime = millis();
    }

    // ✅ 5000ms 동안 데이터가 없으면 자동으로 진동 정지
    if (motorState && millis() - lastUpdateTime > 5000) {
        Serial.println("🛑 일정 시간 신호 없음 → 진동 자동 OFF");
        stopMotors();
    }
}

// ✅ 네 개의 모터를 동시에 정지하는 함수
void stopMotors() {
    // ✅ 진동모터 정지
    ledcWrite(MOTOR_PIN_1_PWM, 0);
    ledcWrite(MOTOR_PIN_2_PWM, 0);
    ledcWrite(MOTOR_PIN_3_PWM, 0);
    ledcWrite(MOTOR_PIN_4_PWM, 0);

    // ✅ 방향 제어 핀 LOW
    digitalWrite(MOTOR_PIN_1_DIR, LOW);
    digitalWrite(MOTOR_PIN_2_DIR, LOW);
    digitalWrite(MOTOR_PIN_3_DIR, LOW);
    digitalWrite(MOTOR_PIN_4_DIR, LOW);

    Serial.println("🛑 PWM 신호 OFF (진동 정지)");
    motorState = false;
}
