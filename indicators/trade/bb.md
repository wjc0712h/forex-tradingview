```
//@version=6
indicator(shorttitle="BB", title="trade Bollinger Bands", overlay=true, timeframe="", timeframe_gaps=true)

// # BB1
length = input.int(20, minval=1,  group="BB2 Settings")
maType = input.string("SMA", "Basis MA Type", options = ["SMA", "EMA", "SMMA (RMA)", "WMA", "VWMA"], group="BB2 Settings")
src = input(close, title="Source", group="BB2 Settings")
mult = input.float(2.0, minval=0.001, maxval=50, title="StdDev", group="BB2 Settings")
ma(source, length, _type) =>
    switch _type
        "SMA" => ta.sma(source, length)
        "EMA" => ta.ema(source, length)
        "SMMA (RMA)" => ta.rma(source, length)
        "WMA" => ta.wma(source, length)
        "VWMA" => ta.vwma(source, length)

basis = ma(src, length, maType)
dev = mult * ta.stdev(src, length)
upper = basis + dev
lower = basis - dev
offset = input.int(0, "Offset", minval = -500, maxval = 500, display = display.data_window, group="BB2 Settings")

plot(basis, "Basis", color=color.new(color.blue, 66), offset = offset, linewidth = 2)
p1 = plot(upper, "Upper", color.new(color.blue, 66), offset = offset)
p2 = plot(lower, "Lower", color.new(color.blue, 66), offset = offset)
// # BB2
length_4 = input.int(4, minval=1,  group="BB Settings")
maType_4 = input.string("SMA", "Basis MA Type", options = ["SMA", "EMA", "SMMA (RMA)", "WMA", "VWMA"], group="BB Settings")
src_4 = input(open, title="Source", group="BB Settings")
mult_4 = input.float(4.0, minval=0.001, maxval=50, title="StdDev", group="BB Settings")
ma_4(source, length, _type) =>
    switch _type
        "SMA" => ta.sma(source, length)
        "EMA" => ta.ema(source, length)
        "SMMA (RMA)" => ta.rma(source, length)
        "WMA" => ta.wma(source, length)
        "VWMA" => ta.vwma(source, length)

basis_4 = ma_4(src_4, length_4, maType_4)
dev_4 = mult_4 * ta.stdev(src_4, length_4)
upper_4 = basis_4 + dev_4
lower_4 = basis_4 - dev_4
offset_4 = input.int(0, "Offset", minval = -500, maxval = 500, display = display.data_window, group="BB Settings")

plot(basis_4, "Basis", color=color.new(color.purple, 77), offset = offset_4)
p1_4 = plot(upper_4, "Upper", color.new(color.purple, 77), offset = offset_4)
p2_4 = plot(lower_4, "Lower", color.new(color.purple, 77), offset = offset_4)

//SQUEEZE
bb_width = (upper - lower) / basis
sqz_len = input.int(200, "BB Width MA Length", minval=1, group="Squeeze Settings")
bb_squeeze = bb_width < (ta.ema(bb_width, sqz_len) * input.float(0.5, "Squeeze Threshold(%)", minval=0.1, step=0.1, group="Squeeze Settings"))
squeeze_color = bb_squeeze ? color.new(color.blue,66) : na
fill(p1, p2, title="Squeeze Background", color=squeeze_color)

//candles
bullish_candle = close > open
bearish_candle = close < open
totalRange = high - low
f_upperWick(idx) => ((high - math.max(open, close))  / totalRange > 0.3)
f_lowerWick(idx) => ((math.min(open, close) - low)  / totalRange > 0.3)

//SLOPE
slope_ma = ta.ema(close, 5)
slope_bars_ago = input.int(5, "Slope Calculation Bars Ago") 
slope = ((slope_ma-slope_ma[slope_bars_ago])/slope_bars_ago)
positive_slope = slope >= 0
negative_slope = slope <= 0
plot(slope, "Slope", color=color.purple, style=plot.style_line, display=display.data_window)
//signals
long_signal = open < lower and close > lower
short_signal = open > upper and close < upper 

long_signal_4 = low <= lower_4  
short_signal_4 = high >= upper_4 

long_signal_d = long_signal_4 and low <= lower
short_signal_d = short_signal_4 and high >= upper

//PLOT
plotshape(long_signal, title="BB Long", location=location.belowbar, style=shape.circle, color=color.rgb(0, 140, 255, 88), size=size.tiny)
plotshape(short_signal, title="BB Short", location=location.abovebar, style=shape.circle, color=color.rgb(0, 140, 255, 88), size=size.tiny)

plotshape(long_signal_4, title="4/4 Long", location=location.belowbar, style=shape.circle, color=color.rgb(234, 0, 255, 88), size=size.tiny)
plotshape(short_signal_4, title="4/4 Short", location=location.abovebar, style=shape.circle, color=color.rgb(234, 0, 255, 88), size=size.tiny)

plotshape(long_signal_d, title="double Long", location=location.belowbar, style=shape.triangleup, color=color.rgb(255, 0, 0, 33), size=size.tiny)
plotshape(short_signal_d, title="doube Short", location=location.abovebar, style=shape.triangledown, color=color.rgb(255, 0, 0, 33), size=size.tiny)

//ALERT
alertcondition(long_signal_d or short_signal_d, title="BB Signal", message="BB Signal")
alertcondition(long_signal_d, title="BB LONG ALERT", message=" BB LONG Signal")
alertcondition(short_signal_d, title="BB SHORT ALERT", message=" BB SHORT Signal")
```