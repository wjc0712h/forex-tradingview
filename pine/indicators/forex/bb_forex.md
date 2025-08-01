// This Pine Script® code is subject to the terms of the Mozilla Public License 2.0 at https://mozilla.org/MPL/2.0/
// © cdw1432t

//@version=6
indicator("Bollinger Bands Forex", shorttitle = "BB_F", overlay = true)

const string main_bb = "Main Bollinger Bands"
const string sub_bb = "Sub Bollinger Bands"
const string signal_group = "Signals"

ma(source, length, _type) =>
    switch _type
        "SMA" => ta.sma(source, length)
        "EMA" => ta.ema(source, length)
        "SMMA(RMA)" => ta.rma(source, length)
        "WMA" => ta.wma(source, length)
        "VWMA" => ta.vwma(source, length)

// === Main Bollinger Bands ===
length = input.int(20, minval=1, title="Length", group=main_bb)
maType = input.string("SMA", "Basis MA Type", options=["SMA", "EMA", "SMMA(RMA)", "WMA", "VWMA"], group=main_bb)
src = input.source(close, title="Source", group=main_bb)
mult = input.float(2, minval=0.001, maxval=50, title="StdDev", group=main_bb)
main_timeframe = input.timeframe('', "Main TimeFrame", group=main_bb)
offset = input.int(0, "Offset", minval=-500, maxval=500, group=main_bb)
basis = request.security(syminfo.tickerid, main_timeframe, ma(src, length, maType),lookahead=barmerge.lookahead_off)
dev = mult * request.security(syminfo.tickerid, main_timeframe, ta.stdev(src, length),lookahead=barmerge.lookahead_off)
upper = basis + dev
lower = basis - dev
plot(basis, "Main Basis", color=color.rgb(0, 140, 255, 70), offset=offset,linewidth = 2)
p1 = plot(upper, "Main Upper", color=color.rgb(0, 140, 255, 70), offset=offset,linewidth = 2)
p2 = plot(lower, "Main Lower", color=color.rgb(0, 140, 255, 70), offset=offset,linewidth = 2)

// === Sub Bollinger Bands ===
length_ = input.int(4, minval=1, title="Length", group=sub_bb)
maType_ = input.string("SMA", "Basis MA Type", options=["SMA", "EMA", "SMMA(RMA)", "WMA", "VWMA"], group=sub_bb)
src_ = input.source(open, title="Source", group=sub_bb)
mult_ = input.float(4.0, minval=0.001, maxval=50, title="StdDev", group=sub_bb)
sub_timeframe = input.timeframe('', "Sub TimeFrame", group=sub_bb)
offset_ = input.int(0, "Sub Offset", minval=-500, maxval=500, group=sub_bb)
basis_ = request.security(syminfo.tickerid, sub_timeframe, ma(src_, length_, maType_),lookahead=barmerge.lookahead_off)
dev_ = mult_ * request.security(syminfo.tickerid, sub_timeframe, ta.stdev(src_, length_),lookahead=barmerge.lookahead_off)
upper_ = basis_ + dev_
lower_ = basis_ - dev_
plot(basis_, "Sub Basis", color=#F23645, offset=offset_, display = display.none)
p1_ = plot(upper_, "Sub Upper", color=color.rgb(242, 54, 70, 70), offset=offset_)
p2_ = plot(lower_, "Sub Lower", color=color.rgb(242, 54, 70, 70), offset=offset_)

// SQUEEZE
bb_width = (upper - lower) / basis
bb_width_ma = ta.sma(bb_width, 100)

squeeze = bb_width < (bb_width_ma * 0.5)
squeezeColor = squeeze ? color.new(color.rgb(33, 149, 243), 80) : na
fill(p1, p2, title="Squeeze Background", color=squeezeColor)

// === SIGNAL ===


touches_main_upper = high >= upper
touches_main_lower = low <= lower

touches_sub_upper = high >= upper_
touches_sub_lower = low <= lower_

touches_upper = touches_main_upper and touches_sub_upper
touches_lower = touches_main_upper and touches_sub_lower

buySignal = touches_lower and close > lower
sellSignal = touches_upper and close < upper 

// Plot signals
plotshape(buySignal , title="Buy Signal", location=location.belowbar, style=shape.triangleup, color=color.blue, size=size.tiny)
plotshape(sellSignal, title="Sell Signal", location=location.abovebar, style=shape.triangledown, color=color.blue, size=size.tiny)

plotshape(touches_main_upper , title="Buy Signal", location=location.abovebar, style=shape.circle, color=color.rgb(0, 140, 255, 70), size=size.tiny)
plotshape(touches_main_lower, title="Sell Signal", location=location.belowbar, style=shape.circle, color=color.rgb(0, 140, 255, 70), size=size.tiny)

plotshape(touches_sub_upper , title="Buy Signal", location=location.abovebar, style=shape.circle, color=color.rgb(242, 54, 70, 70), size=size.tiny)
plotshape(touches_sub_lower, title="Sell Signal", location=location.belowbar, style=shape.circle, color=color.rgb(242, 54, 70, 70), size=size.tiny)

