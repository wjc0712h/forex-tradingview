```
//@version=6
indicator("EMEMA Trend Core", shorttitle = "EMEMA", overlay=true)

approach = input.string("Short Term", title="Trading Approach", options=["Long Term", "Swing Trading", "Short Term"])
bullCol = input.color(color.green, title="Bull Color")
bearCol = input.color(color.red, title="Bear Color")
neutralCol = input.color(color.gray, title="Neutral Color")

length = switch approach
    "Short Term" => 20
    "Swing Trading" => 34
    "Long Term" => 55

get_smema(tf) => request.security(syminfo.tickerid, tf, ta.ema(ta.ema(close, length), length), lookahead=barmerge.lookahead_off)

w_1H = approach == "Short Term"   ? 0.35 : approach == "Swing Trading" ? 0.10 : 0.03
w_4H = approach == "Short Term"   ? 0.30 : approach == "Swing Trading" ? 0.15 : 0.07
w_1D = approach == "Short Term"   ? 0.20 : approach == "Swing Trading" ? 0.25 : 0.20
w_3D = approach == "Short Term"   ? 0.10 : approach == "Swing Trading" ? 0.25 : 0.25
w_1W = approach == "Short Term"   ? 0.05 : approach == "Swing Trading" ? 0.15 : 0.35
w_1M = approach == "Short Term"   ? 0.00 : approach == "Swing Trading" ? 0.10 : 0.10

smema_1H = get_smema("60")
smema_4H = get_smema("240")
smema_1D = get_smema("D")
smema_3D = get_smema("3D")
smema_1W = get_smema("W")
smema_1M = get_smema("M")

global_smema = smema_1H * w_1H + smema_4H * w_4H + smema_1D * w_1D + smema_3D * w_3D + smema_1W * w_1W + smema_1M * w_1M

step = ta.atr(100)

tanh(x) =>
    e2x = math.exp(2 * x)
    (e2x - 1) / (e2x + 1)

raw_dev = (close - global_smema) / step
clamped_dev = tanh(raw_dev)
dev_score = clamped_dev * 5.0

slope = global_smema - global_smema[1]
slope_ratio = slope / step
clamped_slope = slope_ratio > 2.0 ? 2.0 : slope_ratio < -2.0 ? -2.0 : slope_ratio
slope_weight = 1.0 + clamped_slope * 0.10

adjusted_global_score = dev_score * slope_weight
adjusted_global_score := adjusted_global_score > 10.0 ? 10.0 : adjusted_global_score < -10.0 ? -10.0 : adjusted_global_score

trend_col = adjusted_global_score > 1.5 ? bullCol : adjusted_global_score < -1.5 ? bearCol : neutralCol

get_band_color(level, src, score, is_upper, col_bull, col_bear) =>
    r = math.abs(src - level) / ta.percentile_linear_interpolation(math.abs(src - level), 400, 100)
    c = score > 0 and is_upper ? col_bull : score < 0 and not is_upper ? col_bear : na
    na(c) ? na :
     r <= 0.03 ? color.new(c, 96) :
     r <= 0.06 ? color.new(c, 90) :
     r <= 0.10 ? color.new(c, 80) :
     r <= 0.15 ? color.new(c, 68) :
     r <= 0.20 ? color.new(c, 55) :
     r <= 0.27 ? color.new(c, 42) :
     r <= 0.35 ? color.new(c, 30) : color.new(c, 18)

plot(global_smema, color=trend_col, title="EMEMA Trend Core", linewidth=2)

long = not(adjusted_global_score[1] > 1.5) and adjusted_global_score > 1.5
short = not(adjusted_global_score[1] < -1.5) and adjusted_global_score < -1.5

plotshape(long, "Long", style=shape.triangleup,location = location.belowbar,size=size.tiny,color=color.rgb(76, 175, 79, 50))
plotshape(short, "Short", style=shape.triangledown,location = location.abovebar,size=size.tiny,color=color.rgb(255, 82, 82, 50))

alertcondition(long or short, "EMEMA SIGNAL", "EMEMA SIGNAL")
```