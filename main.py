
basic.show_icon(IconNames.DIAMOND)
sws2 = ""
y2 = ""
x2 = ""
sgrp3 = 0
SubGrpMask = 15
# 0x0F
PriGrp = 1
# Radio Group
McpDevadr = 0x20
# MCP23017 Device Addr
pbank = 0
# MCP23017 PULL_UP Bank
rbank = 0
# MCP23017 Read Bank


def init_all():
    basic.show_icon(IconNames.HEART)
    serial.redirect_to_usb()
    serial.write_line("step1")
    init_radio(PriGrp)
    serial.write_line("step2")
    init_sw()
    serial.write_line("step3")
    init_mcp()
    serial.write_line("step4")

init_all()

def init_radio(pgrp: number = 1):
    radio.set_group(pgrp)
    pass
def init_sw():
    pins.set_pull(DigitalPin.P0, PinPullMode.PULL_NONE)
    pins.set_pull(DigitalPin.P5, PinPullMode.PULL_UP)
    pins.set_pull(DigitalPin.P8, PinPullMode.PULL_UP)
    pins.set_pull(DigitalPin.P12, PinPullMode.PULL_UP)
    pins.set_pull(DigitalPin.P13, PinPullMode.PULL_UP)
    pins.set_pull(DigitalPin.P14, PinPullMode.PULL_UP)
    pins.set_pull(DigitalPin.P15, PinPullMode.PULL_UP)
    pins.set_pull(DigitalPin.P16, PinPullMode.PULL_UP)
def init_mcp():
    global McpDevadr
    McpDevadr = 32
    write_mcp_dir(0, 0xFF)
    write_mcp_dir(1, 0xFF)
    write_mcp_pull(0, 240)
    write_mcp_pull(0, 255)
def write_mcp_dir(bank: number, dir2: number):
    pins.i2c_write_number(McpDevadr, bank, NumberFormat.UINT8_LE, True)
    pins.i2c_write_number(McpDevadr, dir2, NumberFormat.UINT8_LE, False)
def write_mcp_pull(bank3: number, data: number):
    global pbank
    pbank = bank3 + 12
    pins.i2c_write_number(McpDevadr, pbank, NumberFormat.UINT8_LE, True)
    pins.i2c_write_number(McpDevadr, data, NumberFormat.UINT8_LE, False)
def read_mcp_dig(bank2: number):
    global rbank
    rbank = bank2 + 18
    pins.i2c_write_number(McpDevadr, rbank, NumberFormat.UINT8_LE, True)
    return pins.i2c_read_number(McpDevadr, NumberFormat.UINT8_LE, False)
def create_radio_sgr(sgrp: number):
    return "" + str(sgrp) if sgrp >= 10 else "0" + ("" + str(sgrp))
def send_radio_sw(sgrp2: number, sws: str):
    sgrp_str = create_radio_sgr(sgrp2)
    scmd = sgrp_str + sws
    radio.send_string(scmd)
    serial.write_line(scmd)
def send_radio_joy(sgrp22: number, x: str, y: str):
    sgrp_str = create_radio_sgr(sgrp22)
    scmd = sgrp_str + 'j' + x + y
    radio.send_string(scmd)
    serial.write_line(scmd)
def analyze_sw():
    cmd = ""
    cmd += "R" if pins.digital_read_pin(DigitalPin.P0) else "P"
    cmd += "R" if pins.digital_read_pin(DigitalPin.P5) else "P"
    cmd += "R" if pins.digital_read_pin(DigitalPin.P8) else "P"
    cmd += "R" if pins.digital_read_pin(DigitalPin.P12) else "P"
    cmd += "R" if pins.digital_read_pin(DigitalPin.P13) else "P"
    cmd += "R" if pins.digital_read_pin(DigitalPin.P14) else "P"
    cmd += "R" if pins.digital_read_pin(DigitalPin.P15) else "P"
    cmd += "R" if pins.digital_read_pin(DigitalPin.P16) else "P"
    serial.write_value("p0", pins.digital_read_pin(DigitalPin.P0))
    serial.write_value("p5", pins.digital_read_pin(DigitalPin.P5))
    serial.write_value("p8", pins.digital_read_pin(DigitalPin.P8))
    serial.write_value("p12", pins.digital_read_pin(DigitalPin.P12))
    serial.write_value("p13", pins.digital_read_pin(DigitalPin.P13))
    serial.write_value("p14", pins.digital_read_pin(DigitalPin.P14))
    serial.write_value("p15", pins.digital_read_pin(DigitalPin.P15))
    serial.write_value("p16", pins.digital_read_pin(DigitalPin.P16))
    return cmd
def analyze_joy(data2: number):
    if data2 < 200:
        return "A"
    elif data2 > 800:
        return "C"
    return "B"

def on_forever():
    global sgrp3, x2, y2, sws2
    sgrp3 = read_mcp_dig(0)
    masked_value = sgrp3 & SubGrpMask
    serial.write_line("AAA")
    # 送信相手いる？
    if masked_value == 0:
        basic.pause(100)
        return
    serial.write_line("BBB")
    # コマンド生成 - joy
    x2 = analyze_joy(pins.analog_read_pin(AnalogPin.P2))
    y2 = analyze_joy(pins.analog_read_pin(AnalogPin.P1))
    # コマンド生成 - Sw
    sws2 = analyze_sw()
    for i in range(4):
        if masked_value >> i & 1:
            serial.write_line("CCC")
            sg = 1 << i
            send_radio_joy(sg, x2, y2)
            send_radio_sw(sg, sws2)
            basic.show_number(sg)
            basic.pause(10)
    basic.pause(10)
basic.forever(on_forever)
