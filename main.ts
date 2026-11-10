// TURRET – micro:bit na turretu
// Kitronik Simple Servo: servo 1 = P8 otaceni, servo 2 = P15 mireni, servo 3 = P16 odpal
// Radio jen uklada prikazy, serva ridi samostatne smycky -> nic se nezasekava

// ---- nastaveni (doladit) ----
let STOP = 90             // klid serva otaceni (P8)
let STOP_ODPAL = 90       // klid serva odpalu (P16) – kdyz se rampa sama pomalu toci, posun o 1–2
let MIR_MIN = 105         // nejnizsi uhel mireni
let MIR_MAX = 180         // nejvyssi uhel mireni
let MAX_KROK = 1.3        // rychlost mireni: max stupnu za 20 ms – mensi = plynulejsi
let ODPAL_RYCHLOST = 120  // 90 = stoji; cim dal od 90, tim rychleji se rampa toci
let ODPAL_MS = 250        // jak dlouho se toci = presne jedna sipka – doladit
let MRTVA_ZONA = 15
let OTOC_MAX = 20         // max rychlost otaceni (odchylka od STOP) – mensi = pomalejsi
let OTOC_ROZJEZD = 1      // o kolik se rychlost smi zmenit za 20 ms – mensi = mekci rozjezd i brzda

// ---- promenne ----
let posledni_signal = 0
let cil_otoc = 0
let cil_uhel = 140
let uhel = 140
let krok = 0
let pulz = 0
let zapsany_pulz = 0
let rychlost = 0
let cil_rychlost = 0
let zapsana_rychlost = 0
let novy_uhel = 0
let vystrel = false

radio.setGroup(42)
pins.servoWritePin(AnalogPin.P8, STOP)
pins.servoWritePin(AnalogPin.P16, STOP_ODPAL)
pins.servoWritePin(AnalogPin.P15, uhel)
basic.showIcon(IconNames.Happy)

// Radio: jen si zapamatuje, co ovladac chce
radio.onReceivedValue(function (name, value) {
    posledni_signal = input.runningTime()
    if (name == "otoc") {
        cil_otoc = value
    } else if (name == "mir") {
        novy_uhel = pins.map(Math.constrain(value, -45, 45), -45, 45, MIR_MIN, MIR_MAX)
        // drobne chveni ruky ignorovat
        if (Math.abs(novy_uhel - cil_uhel) >= 2) {
            cil_uhel = novy_uhel
        }
    } else if (name == "pal") {
        vystrel = true
    }
})

// Otaceni (P8): omezena rychlost + plynuly rozjezd a brzdeni, pojistka kdyz ovladac zmlkne
// Do serva se zapisuje JEN pri zmene – neustale prepisovani rusi ostatni serva
basic.forever(function () {
    if (input.runningTime() - posledni_signal > 500 || Math.abs(cil_otoc) < MRTVA_ZONA) {
        cil_rychlost = 0
    } else {
        cil_rychlost = Math.round(pins.map(Math.constrain(cil_otoc, -60, 60), -60, 60, 0 - OTOC_MAX, OTOC_MAX))
    }
    rychlost = rychlost + Math.constrain(cil_rychlost - rychlost, 0 - OTOC_ROZJEZD, OTOC_ROZJEZD)
    if (STOP + rychlost != zapsana_rychlost) {
        zapsana_rychlost = STOP + rychlost
        pins.servoWritePin(AnalogPin.P8, zapsana_rychlost)
    }
    basic.pause(20)
})

// Mireni (P15): omezena rychlost + zpomaleni u cile, jemne kroky v mikrosekundach
basic.forever(function () {
    krok = (cil_uhel - uhel) / 6
    krok = Math.constrain(krok, 0 - MAX_KROK, MAX_KROK)
    uhel = uhel + krok
    pulz = Math.round(500 + uhel * 2000 / 180)
    if (Math.abs(pulz - zapsany_pulz) >= 3) {
        zapsany_pulz = pulz
        pins.servoSetPulse(AnalogPin.P15, pulz)
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

// ---- Ladeni na turretu (ovladac vypnout!) ----
// A = hlaven niz o 5, B = hlaven vys o 5, na displeji je uhel
input.onButtonPressed(Button.A, function () {
    cil_uhel += -5
    basic.showNumber(cil_uhel)
})
input.onButtonPressed(Button.B, function () {
    cil_uhel += 5
    basic.showNumber(cil_uhel)
})
// A+B = zkusebni vystrel
input.onButtonPressed(Button.AB, function () {
    vystrel = true
})