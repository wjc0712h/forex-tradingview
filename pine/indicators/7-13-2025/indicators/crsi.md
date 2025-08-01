```
//@version=6
indicator("Currency RSI Overview", shorttitle = "CRSI", overlay=false)

// === INPUTS ===
rsiLength = input.int(14, title="RSI Length", minval=1, group="RSI Settings")
smoothing = input.int(3, title="RSI Smoothing", minval=1, tooltip="Apply smoothing to RSI values", group="RSI Settings")
ma_type = input.string("EMA", "Moving Average Type", options=["SMA", "EMA", "RMA", "WMA"], group="RSI Settings")

// Levels
ob_level = input.float(70.0, "Overbought Level", minval=50, maxval=100, group="Levels")
os_level = input.float(30.0, "Oversold Level", minval=0, maxval=50, group="Levels")

// Display options
show_all = input.bool(false, "Show All Currencies", group="Display")
show_strength_ranking = input.bool(true, "Show Strength Ranking", group="Display")

// Label colors
color_eur = input(color.blue, title="EUR Color", group="Colors")
color_usd = input(#0000ff, title="USD Color", group="Colors")
color_gbp = input(color.purple, title="GBP Color", group="Colors")
color_chf = input(color.fuchsia, title="CHF Color", group="Colors")
color_jpy = input(color.orange, title="JPY Color", group="Colors")
color_aud = input(color.lime, title="AUD Color", group="Colors")
color_cad = input(color.red, title="CAD Color", group="Colors")
color_nzd = input(color.green, title="NZD Color", group="Colors")

// === FUNCTIONS ===

// Moving Average function
get_ma(source, length, ma_type) =>
    switch ma_type
        "SMA" => ta.sma(source, length)
        "EMA" => ta.ema(source, length)
        "RMA" => ta.rma(source, length)
        "WMA" => ta.wma(source, length)
        => ta.ema(source, length)

// Enhanced RSI function with smoothing
get_rsi_enhanced(symbol, smooth_length) =>
    raw_rsi = ta.rsi(request.security(symbol, timeframe.period, close), rsiLength)
    smoothed_rsi = get_ma(raw_rsi, smooth_length, ma_type)
    smoothed_rsi

// === RSI CALCULATIONS ===

// Get RSI for all major pairs
rsi_eurusd = get_rsi_enhanced("OANDA:EURUSD", smoothing)
rsi_eurjpy = get_rsi_enhanced("OANDA:EURJPY", smoothing)
rsi_eurgbp = get_rsi_enhanced("OANDA:EURGBP", smoothing)
rsi_eurchf = get_rsi_enhanced("OANDA:EURCHF", smoothing)
rsi_euraud = get_rsi_enhanced("OANDA:EURAUD", smoothing)
rsi_eurcad = get_rsi_enhanced("OANDA:EURCAD", smoothing)
rsi_eurnzd = get_rsi_enhanced("OANDA:EURNZD", smoothing)

rsi_gbpusd = get_rsi_enhanced("OANDA:GBPUSD", smoothing)
rsi_gbpjpy = get_rsi_enhanced("OANDA:GBPJPY", smoothing)
rsi_gbpchf = get_rsi_enhanced("OANDA:GBPCHF", smoothing)
rsi_gbpaud = get_rsi_enhanced("OANDA:GBPAUD", smoothing)
rsi_gbpcad = get_rsi_enhanced("OANDA:GBPCAD", smoothing)
rsi_gbpnzd = get_rsi_enhanced("OANDA:GBPNZD", smoothing)

rsi_usdjpy = get_rsi_enhanced("OANDA:USDJPY", smoothing)
rsi_usdchf = get_rsi_enhanced("OANDA:USDCHF", smoothing)
rsi_audusd = get_rsi_enhanced("OANDA:AUDUSD", smoothing)
rsi_nzdusd = get_rsi_enhanced("OANDA:NZDUSD", smoothing)
rsi_usdcad = get_rsi_enhanced("OANDA:USDCAD", smoothing)

rsi_audcad = get_rsi_enhanced("OANDA:AUDCAD", smoothing)
rsi_audchf = get_rsi_enhanced("OANDA:AUDCHF", smoothing)
rsi_audjpy = get_rsi_enhanced("OANDA:AUDJPY", smoothing)
rsi_audnzd = get_rsi_enhanced("OANDA:AUDNZD", smoothing)

rsi_cadchf = get_rsi_enhanced("OANDA:CADCHF", smoothing)
rsi_cadjpy = get_rsi_enhanced("OANDA:CADJPY", smoothing)

rsi_chfjpy = get_rsi_enhanced("OANDA:CHFJPY", smoothing)
rsi_nzdcad = get_rsi_enhanced("OANDA:NZDCAD", smoothing)
rsi_nzdchf = get_rsi_enhanced("OANDA:NZDCHF", smoothing)
rsi_nzdjpy = get_rsi_enhanced("OANDA:NZDJPY", smoothing)

// === Enhanced Synthetic RSI per currency (using more pairs) ===
rsi_eur = (rsi_eurusd + rsi_eurjpy + rsi_eurgbp + rsi_eurchf + rsi_euraud + rsi_eurcad + rsi_eurnzd) / 7
rsi_usd = (100 - rsi_eurusd + 100 - rsi_gbpusd + rsi_usdjpy + rsi_usdchf + 100 - rsi_audusd + rsi_usdcad + 100 - rsi_nzdusd) / 7
rsi_gbp = (rsi_gbpusd + 100 - rsi_eurgbp + rsi_gbpjpy + rsi_gbpchf + rsi_gbpaud + rsi_gbpcad + rsi_gbpnzd) / 7
rsi_jpy = (100 - rsi_usdjpy + 100 - rsi_eurjpy + 100 - rsi_gbpjpy + 100 - rsi_chfjpy + 100 - rsi_audjpy + 100 - rsi_cadjpy + 100 - rsi_nzdjpy) / 7
rsi_chf = (100 - rsi_usdchf + 100 - rsi_eurchf + 100 - rsi_gbpchf + rsi_chfjpy + 100 - rsi_audchf + 100 - rsi_cadchf + 100 - rsi_nzdchf) / 7
rsi_aud = (rsi_audusd + 100 - rsi_euraud + 100 - rsi_gbpaud + rsi_audjpy + rsi_audchf + rsi_audcad + rsi_audnzd) / 7
rsi_cad = (100 - rsi_usdcad + 100 - rsi_eurcad + 100 - rsi_gbpcad + rsi_cadjpy + rsi_cadchf + 100 - rsi_audcad + 100 - rsi_nzdcad) / 7
rsi_nzd = (rsi_nzdusd + 100 - rsi_eurnzd + 100 - rsi_gbpnzd + rsi_nzdjpy + rsi_nzdchf + 100 - rsi_audnzd + rsi_nzdcad) / 7

// === Current symbol currency detection === 
symbol = syminfo.ticker
upperSymbol = str.upper(symbol)

// Extract base and quote currencies
base_currency = str.substring(symbol, 0, 3)     
quote_currency = str.substring(symbol, 3, 6)   

// Currency detection
showEUR = str.contains(upperSymbol, "EUR")
showUSD = str.contains(upperSymbol, "USD")
showGBP = str.contains(upperSymbol, "GBP")
showJPY = str.contains(upperSymbol, "JPY")
showCHF = str.contains(upperSymbol, "CHF")
showAUD = str.contains(upperSymbol, "AUD")
showCAD = str.contains(upperSymbol, "CAD")
showNZD = str.contains(upperSymbol, "NZD")

// === Signal Detection ===
eur_ob = rsi_eur > ob_level
eur_os = rsi_eur < os_level
usd_ob = rsi_usd > ob_level
usd_os = rsi_usd < os_level
gbp_ob = rsi_gbp > ob_level
gbp_os = rsi_gbp < os_level
jpy_ob = rsi_jpy > ob_level
jpy_os = rsi_jpy < os_level
chf_ob = rsi_chf > ob_level
chf_os = rsi_chf < os_level
aud_ob = rsi_aud > ob_level
aud_os = rsi_aud < os_level
cad_ob = rsi_cad > ob_level
cad_os = rsi_cad < os_level
nzd_ob = rsi_nzd > ob_level
nzd_os = rsi_nzd < os_level

// === Base/Quote Currency RSI States ===
// Get RSI values for base and quote currencies
getRSI(currency) =>
    switch currency
        "EUR" => rsi_eur
        "USD" => rsi_usd
        "GBP" => rsi_gbp
        "JPY" => rsi_jpy
        "CHF" => rsi_chf
        "AUD" => rsi_aud
        "CAD" => rsi_cad
        "NZD" => rsi_nzd
        => na

base_rsi = getRSI(base_currency)
quote_rsi = getRSI(quote_currency)

base_ob = base_rsi > ob_level
base_os = base_rsi < os_level
quote_ob = quote_rsi > ob_level
quote_os = quote_rsi < os_level

// === Background Colors Based on Base/Quote Logic ===
// Base currency overbought = pair likely to fall = red
// Base currency oversold = pair likely to rise = green
// Quote currency overbought = pair likely to rise = green
// Quote currency oversold = pair likely to fall = red

bgcolor(base_ob ? color.new(color.red, 80) : na, title="Base Currency Overbought")
bgcolor(base_os ? color.new(color.green, 80) : na, title="Base Currency Oversold")
bgcolor(quote_ob ? color.new(color.green, 80) : na, title="Quote Currency Overbought")
bgcolor(quote_os ? color.new(color.red, 80) : na, title="Quote Currency Oversold")
// === PLOTS ===
// Main RSI lines
plot(show_all or showEUR ? rsi_eur : na, title="EUR RSI", color=color_eur, linewidth=2)
plot(show_all or showUSD ? rsi_usd : na, title="USD RSI", color=color_usd, linewidth=2)
plot(show_all or showGBP ? rsi_gbp : na, title="GBP RSI", color=color_gbp, linewidth=2)
plot(show_all or showJPY ? rsi_jpy : na, title="JPY RSI", color=color_jpy, linewidth=2)
plot(show_all or showAUD ? rsi_aud : na, title="AUD RSI", color=color_aud, linewidth=2)
plot(show_all or showCHF ? rsi_chf : na, title="CHF RSI", color=color_chf, linewidth=2)
plot(show_all or showCAD ? rsi_cad : na, title="CAD RSI", color=color_cad, linewidth=2)
plot(show_all or showNZD ? rsi_nzd : na, title="NZD RSI", color=color_nzd, linewidth=2)

// RSI Levels
hline(ob_level, "Overbought", color=color.black, linestyle=hline.style_solid)
hline(50, "Mid", color=color.black, linestyle=hline.style_dotted)
hline(os_level, "Oversold", color=color.black, linestyle=hline.style_solid)


// === STRENGTH RANKING TABLE ===
if show_strength_ranking and barstate.islast
    var table ranking_table = table.new(position.middle_right, 3, 9, bgcolor=color.white, border_width=1, border_color=color.black)
    
    // Create array of [currency, rsi_value, color]
    currencies = array.new<float>()
    currency_names = array.new<string>()
    currency_colors = array.new<color>()
    
    array.push(currencies, rsi_eur)
    array.push(currency_names, "EUR")
    array.push(currency_colors, color_eur)
    
    array.push(currencies, rsi_usd)
    array.push(currency_names, "USD")
    array.push(currency_colors, color_usd)
    
    array.push(currencies, rsi_gbp)
    array.push(currency_names, "GBP")
    array.push(currency_colors, color_gbp)
    
    array.push(currencies, rsi_jpy)
    array.push(currency_names, "JPY")
    array.push(currency_colors, color_jpy)
    
    array.push(currencies, rsi_chf)
    array.push(currency_names, "CHF")
    array.push(currency_colors, color_chf)
    
    array.push(currencies, rsi_aud)
    array.push(currency_names, "AUD")
    array.push(currency_colors, color_aud)
    
    array.push(currencies, rsi_cad)
    array.push(currency_names, "CAD")
    array.push(currency_colors, color_cad)
    
    array.push(currencies, rsi_nzd)
    array.push(currency_names, "NZD")
    array.push(currency_colors, color_nzd)
    
    // Sort by RSI value (descending)
    for i = 0 to array.size(currencies) - 2
        for j = i + 1 to array.size(currencies) - 1
            if array.get(currencies, i) < array.get(currencies, j)
                // Swap values
                temp_rsi = array.get(currencies, i)
                temp_name = array.get(currency_names, i)
                temp_color = array.get(currency_colors, i)
                
                array.set(currencies, i, array.get(currencies, j))
                array.set(currency_names, i, array.get(currency_names, j))
                array.set(currency_colors, i, array.get(currency_colors, j))
                
                array.set(currencies, j, temp_rsi)
                array.set(currency_names, j, temp_name)
                array.set(currency_colors, j, temp_color)

    
    // Fill table
    for i = 0 to array.size(currencies) - 1
        rank = str.tostring(i + 1)
        name = array.get(currency_names, i)
        rsi_val = str.tostring(math.round(array.get(currencies, i), 1))
        curr_color = array.get(currency_colors, i)
        
        //table.cell(ranking_table, 0, i + 1, rank, text_color=color.black, text_size=size.small)
        table.cell(ranking_table, 1, i + 1, name, text_color=curr_color, text_size=size.small)
        table.cell(ranking_table, 2, i + 1, rsi_val, text_color=color.black, text_size=size.small)

// === ALERTS ===
alertcondition(eur_ob or usd_ob or gbp_ob or jpy_ob or chf_ob or aud_ob or cad_ob or nzd_ob or eur_os or usd_os or gbp_os or jpy_os or chf_os or aud_os or cad_os or nzd_os, "Currency RSI", "Currency RSI")
```