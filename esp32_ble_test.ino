#include <BluetoothSerial.h>  // ✅ Bluetooth Classic 라이브러리 추가
#include <driver/ledc.h>  // ✅ PWM 제어를 위한 라이브러리 추가

#define MOTOR_PIN_A 25  // ✅ L9110S A-IA 핀 (PWM)
#define MOTOR_PIN_B 26  // ✅ L9110S A-IB 핀 (방향 제어)
#define LEDC_FREQ 400  // ✅ PWM 주파수 // 조절요소
#define LEDC_RESOLUTION 8  // ✅ PWM 분해능 (8비트 = 0~255)

BluetoothSerial SerialBT;  // ✅ Bluetooth Classic Serial 객체 생성

bool motorState = false;
unsigned long lastUpdateTime = 0;

// // 🔥 ✅ 추가: 지연 시간 측정을 위한 변수
// unsigned long receivedTime = 0;  // 🔥 데이터를 수신한 시점
// unsigned long motorActivationTime = 0;  // 🔥 진동 모터가 활성화된 시점

void setup() {
    Serial.begin(115200);
    SerialBT.begin("ESP32_SPP");  // ✅ Bluetooth Classic Serial 시작

    // ✅ 최신 ESP32 3.0 LEDC API 적용 (PWM 설정)
    ledcAttach(MOTOR_PIN_A, LEDC_FREQ, LEDC_RESOLUTION);
    
    pinMode(MOTOR_PIN_B, OUTPUT);
    digitalWrite(MOTOR_PIN_B, LOW);  // 기본 방향 설정

    Serial.println("✅ ESP32 Bluetooth Classic 모드 시작됨!");
}

void loop() {
    if (SerialBT.available()) {  // ✅ Bluetooth Serial 데이터를 받으면 실행
        // receivedTime = millis();  // 🔥 ✅ 추가: 데이터 수신 시점 기록

        int intensity = SerialBT.read();  // ✅ 수신된 데이터 읽기 (0~255 값)
        
        if (intensity > 0) {
            digitalWrite(MOTOR_PIN_B, LOW);  // ✅ 방향 설정
            ledcWrite(MOTOR_PIN_A, intensity);  // ✅ PWM 신호 출력
            Serial.printf("💥 PWM 신호 전송됨: 진동 강도 = %d (0~255)\n", intensity);

            // motorActivationTime = millis();  // 🔥 ✅ 추가: 모터가 반응한 시점 기록
            // Serial.printf("📡 데이터 수신: %lu ms | 🏎️ 모터 반영: %lu ms | ⏳ 지연 시간: %lu ms\n",
            //               receivedTime, motorActivationTime, motorActivationTime - receivedTime);

            motorState = true;
        } else {
            stopMotor();  // ✅ PWM OFF
        }
        
        lastUpdateTime = millis();
    }

    // ✅ 5000ms 동안 Bluetooth 신호를 받지 않으면 자동으로 진동 정지
    if (motorState && millis() - lastUpdateTime > 5000) {
        Serial.println("🛑 일정 시간 신호 없음 → 진동 자동 OFF");
        stopMotor();
    }
}

// ✅ 모터 정지 함수
void stopMotor() {
    ledcWrite(MOTOR_PIN_A, 0);
    Serial.println("🛑 PWM 신호 OFF (진동 정지)");
    motorState = false;
}