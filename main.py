"""

TURRET – micro:bit na turretu

Kitronik Simple Servo: servo 1 = P8 otaceni, servo 2 = P15 mireni, servo 3 = P16 odpal

Radio jen uklada prikazy, serva ridi samostatne smycky -> nic se nezasekava

"""
"""

---- promenne ----

"""
# ---- Ladeni na turretu (ovladac vypnout!) ----
# A = hlaven niz o 5, B = hlaven vys o 5, na displeji je uhel

def on_button_pressed_a():
    global cil_uhel
    cil_uhel += -5
    basic.show_number(cil_uhel)
input.on_button_pressed(Button.A, on_button_pressed_a)

# A+B = zkusebni vystrel

def on_button_pressed_ab():
    global vystrel
    vystrel = True
input.on_button_pressed(Button.AB, on_button_pressed_ab)

def on_button_pressed_b():
    global cil_uhel
    cil_uhel += 5
    basic.show_number(cil_uhel)
input.on_button_pressed(Button.B, on_button_pressed_b)

# Radio: jen si zapamatuje, co ovladac chce

def on_received_value(name, value):
    global posledni_signal, cil_otoc, novy_uhel, cil_uhel, vystrel
    posledni_signal = input.running_time()
    if name == "otoc":
        cil_otoc = value
    elif name == "mir":
        novy_uhel = pins.map(Math.constrain(value, -45, 45), -45, 45, MIR_MIN, MIR_MAX)
        # drobne chveni ruky ignorovat
        if abs(novy_uhel - cil_uhel) >= 2:
            cil_uhel = novy_uhel
    elif name == "pal":
        vystrel = True
radio.on_received_value(on_received_value)

zapsany_pulz = 0
pulz = 0
krok = 0
zapsana_rychlost = 0
novy_uhel = 0
cil_otoc = 0
posledni_signal = 0
vystrel = False
cil_uhel = 0
MIR_MAX = 0
MIR_MIN = 0
# ---- nastaveni (doladit) ----
# klid serva otaceni (P8)
STOP = 90
# klid serva odpalu (P16) – kdyz se rampa sama pomalu toci, posun o 1–2
STOP_ODPAL = 90
# nejnizsi uhel mireni
MIR_MIN = 105
# nejvyssi uhel mireni
MIR_MAX = 180
# rychlost mireni: max stupnu za 20 ms (1.5 = 75 st./s) – mensi = plynulejsi
MAX_KROK = 1.3
# 90 = stoji; cim dal od 90, tim rychleji se rampa toci
ODPAL_RYCHLOST = 120
# jak dlouho se toci = presne jedna sipka – doladit
ODPAL_MS = 250
MRTVA_ZONA = 15
cil_uhel = 140
uhel = 140
rychlost = 90
radio.set_group(42)
pins.servo_write_pin(AnalogPin.P8, STOP)
pins.servo_write_pin(AnalogPin.P16, STOP_ODPAL)
pins.servo_write_pin(AnalogPin.P15, uhel)
basic.show_icon(IconNames.HAPPY)
# Odpal (P16): jedna davka otoceni = jedna sipka

def on_forever():
    global vystrel
    if vystrel:
        music.play(music.tone_playable(988, music.beat(BeatFraction.EIGHTH)),
            music.PlaybackMode.IN_BACKGROUND)
        pins.servo_write_pin(AnalogPin.P16, ODPAL_RYCHLOST)
        basic.pause(ODPAL_MS)
        pins.servo_write_pin(AnalogPin.P16, STOP_ODPAL)
        basic.show_icon(IconNames.TARGET)
        basic.show_icon(IconNames.HAPPY)
        vystrel = False
    basic.pause(20)
basic.forever(on_forever)

# Otaceni (P8) + pojistka: kdyz ovladac zmlkne, turret stoji
# Do serva se zapisuje JEN pri zmene – neustale prepisovani rusi ostatni serva

def on_forever2():
    global rychlost, zapsana_rychlost
    if input.running_time() - posledni_signal > 500 or abs(cil_otoc) < MRTVA_ZONA:
        rychlost = STOP
    else:
        rychlost = STOP + Math.round(Math.constrain(cil_otoc, -60, 60) / 2)
    if rychlost != zapsana_rychlost:
        zapsana_rychlost = rychlost
        pins.servo_write_pin(AnalogPin.P8, rychlost)
    basic.pause(20)
basic.forever(on_forever2)

# Mireni (P15): omezena rychlost + zpomaleni u cile, jemne kroky v mikrosekundach

def on_forever3():
    global krok, uhel, pulz, zapsany_pulz
    krok = (cil_uhel - uhel) / 6
    krok = Math.constrain(krok, 0 - MAX_KROK, MAX_KROK)
    uhel = uhel + krok
    pulz = Math.round(500 + uhel * 2000 / 180)
    if abs(pulz - zapsany_pulz) >= 3:
        zapsany_pulz = pulz
        pins.servo_set_pulse(AnalogPin.P15, pulz)
    basic.pause(20)
basic.forever(on_forever3)
