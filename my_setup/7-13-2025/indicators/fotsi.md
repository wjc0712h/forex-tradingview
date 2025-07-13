```
//@version=6
indicator(title="Forex Overview True Strength Index", shorttitle="FOTSI", precision=2, overlay=false)

//Global input
length1 = input.int(0,  title="Momentum period",  minval=0)
length2 = input.int(25, title="Smoothing period", minval=1)
length3 = input.int(15, title="Smoothing period", minval=1)
allertB = input.int(3,  title="Trigger bar",      minval=1)
offsetL = input.int(0,  title="Labels offset")
show_all = input.bool(false, "Show All Currencies", group="Display")

//Labels color
color_eur = input.color(color.blue,     title="EUR label color")
color_usd = input.color(#0000ff,        title="USD label color")
color_gbp = input.color(color.purple,   title="GBP label color")
color_chf = input.color(color.fuchsia,  title="CHF label color")
color_jpy = input.color(color.orange,   title="JPY label color")
color_aud = input.color(color.lime,     title="AUD label color")
color_cad = input.color(color.red,      title="CAD label color")
color_nzd = input.color(color.green,    title="NZD label color")

//Momentum calculation
mom_eurusd = request.security("OANDA:EURUSD", timeframe.period, close - open[length1])
mom_eurgbp = request.security("OANDA:EURGBP", timeframe.period, close - open[length1])
mom_eurchf = request.security("OANDA:EURCHF", timeframe.period, close - open[length1])
mom_eurjpy = request.security("OANDA:EURJPY", timeframe.period, close - open[length1]) / 100
mom_euraud = request.security("OANDA:EURAUD", timeframe.period, close - open[length1])
mom_eurcad = request.security("OANDA:EURCAD", timeframe.period, close - open[length1])
mom_eurnzd = request.security("OANDA:EURNZD", timeframe.period, close - open[length1])
mom_usdchf = request.security("OANDA:USDCHF", timeframe.period, close - open[length1])
mom_usdjpy = request.security("OANDA:USDJPY", timeframe.period, close - open[length1]) / 100
mom_usdcad = request.security("OANDA:USDCAD", timeframe.period, close - open[length1])
mom_gbpusd = request.security("OANDA:GBPUSD", timeframe.period, close - open[length1])
mom_gbpchf = request.security("OANDA:GBPCHF", timeframe.period, close - open[length1])
mom_gbpjpy = request.security("OANDA:GBPJPY", timeframe.period, close - open[length1]) / 100
mom_gbpaud = request.security("OANDA:GBPAUD", timeframe.period, close - open[length1])
mom_gbpcad = request.security("OANDA:GBPCAD", timeframe.period, close - open[length1])
mom_gbpnzd = request.security("OANDA:GBPNZD", timeframe.period, close - open[length1])
mom_chfjpy = request.security("OANDA:CHFJPY", timeframe.period, close - open[length1]) / 100
mom_audusd = request.security("OANDA:AUDUSD", timeframe.period, close - open[length1])
mom_audchf = request.security("OANDA:AUDCHF", timeframe.period, close - open[length1])
mom_audjpy = request.security("OANDA:AUDJPY", timeframe.period, close - open[length1]) / 100
mom_audcad = request.security("OANDA:AUDCAD", timeframe.period, close - open[length1])
mom_audnzd = request.security("OANDA:AUDNZD", timeframe.period, close - open[length1])
mom_cadchf = request.security("OANDA:CADCHF", timeframe.period, close - open[length1])
mom_cadjpy = request.security("OANDA:CADJPY", timeframe.period, close - open[length1]) / 100
mom_nzdusd = request.security("OANDA:NZDUSD", timeframe.period, close - open[length1])
mom_nzdchf = request.security("OANDA:NZDCHF", timeframe.period, close - open[length1])
mom_nzdjpy = request.security("OANDA:NZDJPY", timeframe.period, close - open[length1]) / 100
mom_nzdcad = request.security("OANDA:NZDCAD", timeframe.period, close - open[length1])

//Currency momentum calculation
mom_eur =   mom_eurusd + mom_eurgbp + mom_eurchf + mom_eurjpy + mom_euraud + mom_eurcad + mom_eurnzd
mom_usd = - mom_eurusd - mom_gbpusd + mom_usdchf + mom_usdjpy - mom_audusd + mom_usdcad - mom_nzdusd  
mom_gbp = - mom_eurgbp + mom_gbpusd + mom_gbpchf + mom_gbpjpy + mom_gbpaud + mom_gbpcad + mom_gbpnzd
mom_chf = - mom_eurchf - mom_usdchf - mom_gbpchf + mom_chfjpy - mom_audchf - mom_cadchf - mom_nzdchf
mom_jpy = - mom_eurjpy - mom_usdjpy - mom_gbpjpy - mom_chfjpy - mom_audjpy - mom_cadjpy - mom_nzdjpy
mom_aud = - mom_euraud + mom_audusd - mom_gbpaud + mom_audchf + mom_audjpy + mom_audcad + mom_audnzd
mom_cad = - mom_eurcad - mom_usdcad - mom_gbpcad + mom_cadchf + mom_cadjpy - mom_audcad - mom_nzdcad
mom_nzd = - mom_eurnzd + mom_nzdusd - mom_gbpnzd + mom_nzdchf + mom_nzdjpy - mom_audnzd + mom_nzdcad

//TSI calculation (공통 함수 사용)
tsi_calc(momentum, length2, length3) =>
    smo1 = ta.ema(momentum, length2)
    smo2 = ta.ema(smo1, length3)
    sma1 = ta.ema(math.abs(momentum), length2)
    sma2 = ta.ema(sma1, length3)
    100 * (smo2 / sma2)

tsi_eur = tsi_calc(mom_eur, length2, length3)
tsi_usd = tsi_calc(mom_usd, length2, length3)
tsi_gbp = tsi_calc(mom_gbp, length2, length3)
tsi_chf = tsi_calc(mom_chf, length2, length3)
tsi_jpy = tsi_calc(mom_jpy, length2, length3)
tsi_aud = tsi_calc(mom_aud, length2, length3)
tsi_cad = tsi_calc(mom_cad, length2, length3)
tsi_nzd = tsi_calc(mom_nzd, length2, length3)

// === Current symbol currency detection ===
symbol = syminfo.ticker
upperSymbol = str.upper(symbol)

showEUR = str.contains(upperSymbol, "EUR")
showUSD = str.contains(upperSymbol, "USD")
showGBP = str.contains(upperSymbol, "GBP")
showJPY = str.contains(upperSymbol, "JPY")
showCHF = str.contains(upperSymbol, "CHF")
showAUD = str.contains(upperSymbol, "AUD")
showCAD = str.contains(upperSymbol, "CAD")
showNZD = str.contains(upperSymbol, "NZD")

//Currency plotting
plot((showEUR or show_all) ? tsi_eur: na, title="EUR", color=color.blue,    linewidth=2)
plot((showUSD or show_all) ? tsi_usd: na, title="USD", color=#0000ff,       linewidth=2)
plot((showGBP or show_all) ? tsi_gbp: na, title="GBP", color=color.purple,  linewidth=2)
plot((showCHF or show_all) ? tsi_chf: na, title="CHF", color=color.fuchsia, linewidth=2)
plot((showJPY or show_all) ? tsi_jpy: na, title="JPY", color=color.orange,  linewidth=2)
plot((showAUD or show_all) ? tsi_aud: na, title="AUD", color=color.lime,    linewidth=2)
plot((showCAD or show_all) ? tsi_cad: na, title="CAD", color=color.red,     linewidth=2)
plot((showNZD or show_all) ? tsi_nzd: na, title="NZD", color=color.green,   linewidth=2)

//Labels - 최신 바에서만 표시
if barstate.islast
    label.new(time + offsetL, tsi_eur, "EUR",
         style = label.style_label_left,
         color = color_eur,
         textcolor = color.white,
         xloc = xloc.bar_time)
    
    label.new(time + offsetL, tsi_usd, "USD",
         style = label.style_label_left,
         color = color_usd,
         textcolor = color.white,
         xloc = xloc.bar_time)
    
    label.new(time + offsetL, tsi_gbp, "GBP",
         style = label.style_label_left,
         color = color_gbp,
         textcolor = color.white,
         xloc = xloc.bar_time)
    
    label.new(time + offsetL, tsi_chf, "CHF",
         style = label.style_label_left,
         color = color_chf,
         textcolor = color.white,
         xloc = xloc.bar_time)
    
    label.new(time + offsetL, tsi_jpy, "JPY",
         style = label.style_label_left,
         color = color_jpy,
         textcolor = color.white,
         xloc = xloc.bar_time)
    
    label.new(time + offsetL, tsi_aud, "AUD",
         style = label.style_label_left,
         color = color_aud,
         textcolor = color.white,
         xloc = xloc.bar_time)
    
    label.new(time + offsetL, tsi_cad, "CAD",
         style = label.style_label_left,
         color = color_cad,
         textcolor = color.white,
         xloc = xloc.bar_time)
    
    label.new(time + offsetL, tsi_nzd, "NZD",
         style = label.style_label_left,
         color = color_nzd,
         textcolor = color.white,
         xloc = xloc.bar_time)

//Graphics plotting
overbuy     = hline(50,  title="Overbuy",       color=color.black,    linestyle=hline.style_solid)
oversell    = hline(-50, title="Oversell",      color=color.black,  linestyle=hline.style_solid)
level25     = hline(25,  title="Upper range",   color=color.black,  linestyle=hline.style_dotted)
levelm25    = hline(-25, title="Lower range",   color=color.black,  linestyle=hline.style_dotted)

fill(level25, levelm25, title="Range", color=color.new(color.gray, 90))

// === Currency Slopes ===
slope_length = input.int(1, "SLOPE LENGTH")
slope_eur = tsi_eur - tsi_eur[slope_length]
slope_usd = tsi_usd - tsi_usd[slope_length]
slope_gbp = tsi_gbp - tsi_gbp[slope_length]
slope_chf = tsi_chf - tsi_chf[slope_length]
slope_jpy = tsi_jpy - tsi_jpy[slope_length]
slope_aud = tsi_aud - tsi_aud[slope_length]
slope_cad = tsi_cad - tsi_cad[slope_length]
slope_nzd = tsi_nzd - tsi_nzd[slope_length]

// === Slope Table Setup ===
var table t = table.new(position.top_right, 2, 8, bgcolor=color.white, border_width=1,border_color=color.black)

if barstate.islast
    table.cell(t, 0, 0, "EUR", text_color=color_eur)
    table.cell(t, 1, 0, str.tostring(slope_eur,"#.##"), text_color=color.black,text_size=size.small)

    table.cell(t, 0, 1, "USD", text_color=color_usd)
    table.cell(t, 1, 1, str.tostring(slope_usd,"#.##"), text_color=color.black,text_size=size.small)

    table.cell(t, 0, 2, "GBP", text_color=color_gbp)
    table.cell(t, 1, 2, str.tostring(slope_gbp,"#.##"), text_color=color.black,text_size=size.small)

    table.cell(t, 0, 3, "CHF", text_color=color_chf)
    table.cell(t, 1, 3, str.tostring(slope_chf,"#.##"), text_color=color.black,text_size=size.small)

    table.cell(t, 0, 4, "JPY", text_color=color_jpy)
    table.cell(t, 1, 4, str.tostring(slope_jpy,"#.##"), text_color=color.black,text_size=size.small)

    table.cell(t, 0, 5, "AUD", text_color=color_aud)
    table.cell(t, 1, 5, str.tostring(slope_aud,"#.##"), text_color=color.black,text_size=size.small)

    table.cell(t, 0, 6, "CAD", text_color=color_cad)
    table.cell(t, 1, 6, str.tostring(slope_cad,"#.##"), text_color=color.black,text_size=size.small)

    table.cell(t, 0, 7, "NZD", text_color=color_nzd)
    table.cell(t, 1, 7, str.tostring(slope_nzd,"#.##"), text_color=color.black,text_size=size.small)
    ```