/**
 * TURRET – micro:bit na turretu
 * 
 * Kitronik Simple Servo: servo 1 = P8 otaceni, servo 2 = P15 mireni, servo 3 = P16 odpal
 * 
 * Radio jen uklada prikazy, serva ridi samostatne smycky -> nic se nezasekava
 */
/**
 * ---- promenne ----
 */
// ---- Ladeni na turretu (ovladac vypnout!) ----
// A = hlaven niz o 5, B = hlaven vys o 5, na displeji je uhel
input.onButtonPressed(Button.A, function () {
    cil_uhel += -5
    basic.showNumber(cil_uhel)
})
// A+B = zkusebni vystrel
input.onButtonPressed(Button.AB, function () {
    vystrel = true
})
input.onButtonPressed(Button.B, function () {
    cil_uhel += 5
    basic.showNumber(cil_uhel)
})
// Radio: jen si zapamatuje, co ovladac chce
radio.onReceivedValue(function (name, value) {
    posledni_signal = input.runningTime()
    if (name == "otoc") {
        cil_otoc = value
    } else if (name == "mir") {
        cil_uhel = pins.map(
        Math.constrain(value, -45, 45),
        -45,
        45,
        MIR_MIN,
        MIR_MAX
        )
    } else if (name == "pal") {
        vystrel = true
    }
})
let zapsany_uhel = 0
let cil_otoc = 0
let posledni_signal = 0
let vystrel = false
let cil_uhel = 0
let MIR_MAX = 0
let MIR_MIN = 0
// ---- nastaveni (doladit) ----
// klid serva otaceni (P8)
let STOP = 90
// klid serva odpalu (P16) – kdyz se rampa sama pomalu toci, posun o 1–2
let STOP_ODPAL = 90
// nejnizsi uhel mireni – zjistit tlacitkem A
MIR_MIN = 90
// nejvyssi uhel mireni – zjistit tlacitkem B
MIR_MAX = 150
// 90 = stoji; cim dal od 90, tim rychleji se rampa toci
let ODPAL_RYCHLOST = 120
// jak dlouho se toci = presne jedna sipka – doladit
let ODPAL_MS = 250
let MRTVA_ZONA = 15
cil_uhel = 120
let uhel = 120
radio.setGroup(42)
pins.servoWritePin(AnalogPin.P8, STOP)
pins.servoWritePin(AnalogPin.P16, STOP_ODPAL)
pins.servoWritePin(AnalogPin.P15, uhel)
basic.showIcon(IconNames.Happy)
// Mireni (P15): plynule dojizdi k cili, zapisuje jen pri zmene
basic.forever(function () {
    uhel = uhel + (cil_uhel - uhel) / 5
    if (Math.abs(Math.round(uhel) - zapsany_uhel) >= 1) {
        zapsany_uhel = Math.round(uhel)
        pins.servoWritePin(AnalogPin.P15, zapsany_uhel)
    }
    basic.pause(20)
})
// Odpal (P16): jedna davka otoceni = jedna sipka
basic.forever(function () {
    if (vystrel) {
        music.play(music.tonePlayable(988, music.beat(BeatFraction.Eighth)), music.PlaybackMode.InBackground)
        pins.servoWritePin(AnalogPin.P16, ODPAL_RYCHLOST)
        basic.pause(ODPAL_MS)
        pins.servoWritePin(AnalogPin.P16, STOP_ODPAL)
        basic.showIcon(IconNames.Target)
        basic.showIcon(IconNames.Happy)
        vystrel = false
    }
    basic.pause(20)
})
// Otaceni (P8) + pojistka: kdyz ovladac zmlkne, turret stoji
basic.forever(function () {
    if (input.runningTime() - posledni_signal > 500 || Math.abs(cil_otoc) < MRTVA_ZONA) {
        pins.servoWritePin(AnalogPin.P8, STOP)
    } else {
        pins.servoWritePin(AnalogPin.P8, STOP + Math.constrain(cil_otoc, -60, 60) / 2)
    }
    basic.pause(20)
})
