// OVLADAC turretu – druhy micro:bit v ruce
// Naklon do stran = otaceni, dopredu/dozadu = mireni, A+B = vystrel

let stranou = 0
let dopredu = 0

radio.setGroup(42)
basic.showIcon(IconNames.Target)

input.onButtonPressed(Button.AB, function () {
    radio.sendValue("pal", 1)
    basic.showIcon(IconNames.Surprised)
    basic.pause(300)
    basic.showIcon(IconNames.Target)
})

basic.forever(function () {
    stranou = input.rotation(Rotation.Roll)
    dopredu = input.rotation(Rotation.Pitch)
    radio.sendValue("otoc", stranou)
    radio.sendValue("mir", dopredu)
    basic.pause(50)
})
