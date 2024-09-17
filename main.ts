/**
 * MCP23017 Device Addr
 */
/**
 * MCP23017 PULL_UP Bank
 */
function init_sw () {
    pins.setPull(DigitalPin.P0, PinPullMode.PullNone)
    pins.setPull(DigitalPin.P5, PinPullMode.PullUp)
    pins.setPull(DigitalPin.P8, PinPullMode.PullUp)
    pins.setPull(DigitalPin.P12, PinPullMode.PullUp)
    pins.setPull(DigitalPin.P13, PinPullMode.PullUp)
    pins.setPull(DigitalPin.P14, PinPullMode.PullUp)
    pins.setPull(DigitalPin.P15, PinPullMode.PullUp)
    pins.setPull(DigitalPin.P16, PinPullMode.PullUp)
}
function send_radio_sw (sgrp2: number, sws: string) {
    sgrp_str = create_radio_sgr(sgrp2)
    scmd = "" + sgrp_str + sws
    radio.sendString(scmd)
    serial.writeLine(scmd)
}
function write_mcp_pull (bank3: number, data: number) {
    pbank = bank3 + 12
    pins.i2cWriteNumber(
    McpDevadr,
    pbank,
    NumberFormat.UInt8LE,
    true
    )
    pins.i2cWriteNumber(
    McpDevadr,
    data,
    NumberFormat.UInt8LE,
    false
    )
}
function send_radio_joy (sgrp22: number, x: string, y: string) {
    sgrp_str2 = create_radio_sgr(sgrp22)
    scmd2 = "" + sgrp_str2 + "j" + x + y
    radio.sendString(scmd2)
    serial.writeLine(scmd2)
}
// MCP23017 Read Bank
function init_all () {
    basic.showIcon(IconNames.Heart)
    serial.redirectToUSB()
    serial.writeLine("step1")
    init_radio(PriGrp)
serial.writeLine("step2")
    init_sw()
    serial.writeLine("step3")
    init_mcp()
    serial.writeLine("step4")
}
function create_radio_sgr (sgrp: number) {
    return sgrp >= 10 ? "" + ("" + sgrp) : "0" + ("" + ("" + sgrp))
}
function init_mcp () {
    McpDevadr = 32
    write_mcp_dir(0, 255)
    write_mcp_dir(1, 255)
    write_mcp_pull(0, 240)
    write_mcp_pull(0, 255)
}
function read_mcp_dig (bank2: number) {
    rbank = bank2 + 18
    pins.i2cWriteNumber(
    McpDevadr,
    rbank,
    NumberFormat.UInt8LE,
    true
    )
    return pins.i2cReadNumber(McpDevadr, NumberFormat.UInt8LE, false)
}
function write_mcp_dir (bank: number, dir2: number) {
    pins.i2cWriteNumber(
    McpDevadr,
    bank,
    NumberFormat.UInt8LE,
    true
    )
    pins.i2cWriteNumber(
    McpDevadr,
    dir2,
    NumberFormat.UInt8LE,
    false
    )
}
function analyze_sw () {
    cmd = "" + cmd + pins.digitalReadPin(DigitalPin.P0) ? "R" : "P"
    cmd = "" + cmd + pins.digitalReadPin(DigitalPin.P5) ? "R" : "P"
    cmd = "" + cmd + pins.digitalReadPin(DigitalPin.P8) ? "R" : "P"
    cmd = "" + cmd + pins.digitalReadPin(DigitalPin.P12) ? "R" : "P"
    cmd = "" + cmd + pins.digitalReadPin(DigitalPin.P13) ? "R" : "P"
    cmd = "" + cmd + pins.digitalReadPin(DigitalPin.P14) ? "R" : "P"
    cmd = "" + cmd + pins.digitalReadPin(DigitalPin.P15) ? "R" : "P"
    cmd = "" + cmd + pins.digitalReadPin(DigitalPin.P16) ? "R" : "P"
    serial.writeValue("p0", pins.digitalReadPin(DigitalPin.P0))
    serial.writeValue("p5", pins.digitalReadPin(DigitalPin.P5))
    serial.writeValue("p8", pins.digitalReadPin(DigitalPin.P8))
    serial.writeValue("p12", pins.digitalReadPin(DigitalPin.P12))
    serial.writeValue("p13", pins.digitalReadPin(DigitalPin.P13))
    serial.writeValue("p14", pins.digitalReadPin(DigitalPin.P14))
    serial.writeValue("p15", pins.digitalReadPin(DigitalPin.P15))
    serial.writeValue("p16", pins.digitalReadPin(DigitalPin.P16))
    return cmd
}
function analyze_joy (data2: number) {
    if (data2 < 200) {
        return "A"
    } else if (data2 > 800) {
        return "C"
    }
    return "B"
}
let sws2 = ""
let y2 = ""
let x2 = ""
let cmd = ""
let rbank = 0
let scmd2 = ""
let sgrp_str2 = 0
let pbank = 0
let scmd = ""
let sgrp_str = 0
let McpDevadr = 0
let sgrp3 = 0
basic.showIcon(IconNames.Diamond)
let SubGrpMask = 15
// 0x0F
let PriGrp = 1
// Radio Group
McpDevadr = 32
init_all()
function init_radio(pgrp: number = 1) {
    radio.setGroup(pgrp)
    
}
basic.forever(function () {
    let sg: number;
sgrp3 = read_mcp_dig(0)
    let masked_value = sgrp3 & SubGrpMask
serial.writeLine("AAA")
    // 送信相手いる？
    if (masked_value == 0) {
        basic.pause(100)
        return
    }
    serial.writeLine("BBB")
    // コマンド生成 - joy
    x2 = analyze_joy(pins.analogReadPin(AnalogPin.P2))
    y2 = analyze_joy(pins.analogReadPin(AnalogPin.P1))
    // コマンド生成 - Sw
    sws2 = analyze_sw()
    for (let i = 0; i <= 3; i++) {
        if (masked_value >> i & 1) {
            serial.writeLine("CCC")
            sg = 1 << i
send_radio_joy(sg, x2, y2)
            send_radio_sw(sg, sws2)
            basic.showNumber(sg)
            basic.pause(10)
        }
    }
    basic.pause(10)
})
