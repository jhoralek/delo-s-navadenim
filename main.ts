/**
 * TURRET – micro:bit, ktery sedi na turretu
 * 
 * Kitronik Simple Servo: servo 1 = P8, servo 2 = P15, servo 3 = P16
 * 
 * Servo 1 (P8)  = otaceni (spojite servo 360°)
 * 
 * Servo 2 (P15) = mireni nahoru/dolu (servo 180°)
 */
// Kalibrace STOP: tlacitka primo na turretu, cislo se ukaze na displeji
input.onButtonPressed(Button.A, function () {
    STOP += -1
    pins.servoWritePin(AnalogPin.P8, STOP)
    basic.showNumber(STOP)
})
input.onButtonPressed(Button.B, function () {
    STOP += 1
    pins.servoWritePin(AnalogPin.P8, STOP)
    basic.showNumber(STOP)
})
radio.onReceivedValue(function (name, value) {
    posledni_signal = input.runningTime()
    if (name == "otoc") {
        if (Math.abs(value) < MRTVA_ZONA) {
            rychlost = STOP
        } else {
            rychlost = STOP + Math.constrain(value, -60, 60) / 2
        }
        pins.servoWritePin(AnalogPin.P8, rychlost)
    } else if (name == "mir") {
        // rozsah 90-150 jako originalni turret (hlaven nenarazi do drzaku)
        uhel = pins.map(
        Math.constrain(value, -45, 45),
        -45,
        45,
        90,
        150
        )
        pins.servoWritePin(AnalogPin.P15, uhel)
    } else if (name == "pal" && !(strileni)) {
        strileni = true
        basic.showIcon(IconNames.Target)
        music.playTone(988, music.beat(BeatFraction.Eighth))
        pins.servoWritePin(AnalogPin.P16, ODPAL_RYCHLOST)
        basic.pause(ODPAL_MS)
        pins.servoWritePin(AnalogPin.P16, STOP)
        strileni = false
        basic.showIcon(IconNames.Happy)
    }
})
let strileni = false
let posledni_signal = 0
let uhel = 0
let rychlost = 0
let MRTVA_ZONA = 0
let ODPAL_RYCHLOST = 0
let ODPAL_MS = 0
let STOP = 0
// klidova hodnota spojiteho serva – doladit tlacitky A/B
STOP = 90
// jak dlouho se toci odpalovaci servo – doladit
ODPAL_MS = 400
ODPAL_RYCHLOST = 180
// maly naklon ovladace = turret stoji
MRTVA_ZONA = 15
rychlost = 90
uhel = 110
radio.setGroup(42)
pins.servoWritePin(AnalogPin.P8, STOP)
// klid jako v originalu
pins.servoWritePin(AnalogPin.P15, 110)
pins.servoWritePin(AnalogPin.P16, STOP)
basic.showIcon(IconNames.Happy)
// Pojistka: kdyz ovladac zmlkne, turret se prestane tocit
basic.forever(function () {
    if (input.runningTime() - posledni_signal > 500) {
        pins.servoWritePin(AnalogPin.P8, STOP)
    }
    basic.pause(100)
})
