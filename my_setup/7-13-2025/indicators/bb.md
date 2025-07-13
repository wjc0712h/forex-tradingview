```
//@version=6
indicator(shorttitle="BB", title="My Bollinger Bands", overlay=true, timeframe="", timeframe_gaps=true)

ma(source, length, _type) =>
    switch _type
        "SMA" => ta.sma(source, length)
        "EMA" => ta.ema(source, length)
        "SMMA (RMA)" => ta.rma(source, length)
        "WMA" => ta.wma(source, length)
        "VWMA" => ta.vwma(source, length)

//--------------------Main BB
length = input.int(20, minval=1, group ="Main BB")
maType = input.string("SMA", "Basis MA Type", options = ["SMA", "EMA", "SMMA (RMA)", "WMA", "VWMA"], group ="Main BB")
src = input(close, title="Source", group ="Main BB")
mult = input.float(2, minval=0.001, maxval=50, title="StdDev", group ="Main BB")
mult2 = input.float(2.58, minval=0.001, maxval=50, title="StdDev 2", group ="Main BB")
offset = input.int(0, "Offset", minval = -500, maxval = 500, display = display.data_window, group ="Main BB")

basis = ma(src, length, maType)
dev = mult * ta.stdev(src, length)
dev2 = mult2 * ta.stdev(src, length)
upper = basis + dev
lower = basis - dev

upper2 = basis + dev2
lower2 = basis - dev2


p0 = plot(basis, "Basis", color=color.blue, offset = offset, linewidth = 2)
p1 = plot(upper, "Upper", color=color.blue, offset = offset)
p2 = plot(lower, "Lower", color=color.blue, offset = offset)
p3 = plot(upper2, "Upper", color=color.blue, offset = offset)
p4 = plot(lower2, "Lower", color=color.blue, offset = offset)

//-----------------Sub BB
// show_sub = input.bool(false, title="Show Sub BB", group ="Sub BB")
// length_ = input.int(60, minval=1, group ="Sub BB")
// maType_ = input.string("SMA", "Basis MA Type", options = ["SMA", "EMA", "SMMA (RMA)", "WMA", "VWMA"], group ="Sub BB")
// src_ = input(close, title="Source", group ="Sub BB")
// mult_ = input.float(0.5, minval=0.001, maxval=50, title="StdDev", group ="Sub BB")
// offset_ = input.int(0, "Offset", minval = -500, maxval = 500, display = display.data_window, group ="Sub BB")


// basis_ = ma(src_, length_, maType_)
// dev_ = mult_ * ta.stdev(src_, length_)
// upper_ = basis_ + dev_
// lower_ = basis_ - dev_


// p0_ = plot(basis_, "Sub Basis", color=color.rgb(255, 0, 0, 77), offset = offset, linewidth = 2, display = show_sub? display.all : display.none)
// p1_ = plot(upper_, "Sub Upper", color=color.rgb(255, 0, 0, 77), offset = offset, display = show_sub? display.all : display.none)
// p2_ = plot(lower_, "Sub Lower", color=color.rgb(255, 0, 0, 77), offset = offset, display = show_sub? display.all : display.none)
bbw   = ((upper - lower) / basis) * 100
he = ta.highest(bbw, 100)
lc = ta.lowest(bbw, 100)

// Squeeze condition: current width is less than a percentage of its moving average
bb_squeeze = bbw < (he+lc)/4
squeeze_color = bb_squeeze ? color.rgb(0, 89, 255, 88) : na
fill(p1, p2, title="Squeeze Background", color=squeeze_color)

buySignal = low[1] < lower2[1] and open < lower and close > lower
sellSignal = high[1] > upper2[1] and open > upper and close < upper

plotshape(buySignal, "Long", style=shape.triangleup,location = location.belowbar,size=size.tiny,color=color.rgb(33, 149, 243, 50))
plotshape(sellSignal, "Short", style=shape.triangledown,location = location.abovebar,size=size.tiny,color=color.rgb(33, 149, 243, 50))

alertcondition(buySignal or sellSignal, "BB SIGNAL", message = "BB SIGNAL")
```