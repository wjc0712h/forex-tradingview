```
//@version=6
indicator("Relative Currency Strength", shorttitle="RCS", overlay=false, timeframe="", timeframe_gaps=true)
get_ma_periods() =>
    tf = timeframe.period
    [fast, slow] = switch tf
        "1" => [24, 360]      // 1 minute
        "3" => [20, 240]      // 3 minutes
        "5" => [15, 180]      // 5 minutes
        "15" => [12, 120]     // 15 minutes
        "30" => [10, 90]      // 30 minutes
        "60" => [24, 360]     // 1 hour
        "240" => [12, 144]    // 4 hours
        "1D" => [5, 60]       // Daily
        "1W" => [4, 20]       // Weekly
        "1M" => [3, 12]       // Monthly
        => [5, 60]            // Default values for other timeframes
    
    [fast, slow]

// Get dynamic periods
[dynamic_fast, dynamic_slow] = get_ma_periods()

// Use dynamic periods in your inputs (optional - allows manual override)
fast_period = dynamic_fast
slow_period = dynamic_slow

ma_type = input.string("SMMA(RMA)", "Moving Average Type",  options=["SMA", "EMA","DEMA", "SMMA(RMA)", "WMA", "VWMA"], group = "MA")
ma_fast = input.int(5, "Fast Length",  group = "MA")
ma_slow = input.int(60, "Slow Length", group = "MA")

use_manual = input.bool(false, "Use Manual Length",group = "options")
use_advanced = input.bool(false, "Use Advanced Calculation",group = "options")
use_volume_weight = input.bool(false, "Use Volume Weighting",group = "options")
normalization = input.string("Standard", "Normalization Method", options=["Standard", "Z-Score", "Basket"], group = "options")

// Function to get appropriate MA periods based on timeframe


//show currencies
show_usd = input.bool(true, "Show USD",group ="currencies")
show_eur = input.bool(true, "Show EUR",group ="currencies")
show_gbp = input.bool(true, "Show GBP",group ="currencies")
show_jpy = input.bool(true, "Show JPY",group ="currencies")
show_chf = input.bool(true, "Show CHF",group ="currencies")
show_aud = input.bool(true, "Show AUD",group ="currencies")
show_cad = input.bool(true, "Show CAD",group ="currencies")
show_nzd = input.bool(true, "Show NZD",group ="currencies")

//Labels color
color_eur = input(color.blue,     title="EUR label color",group = "color")
color_usd = input(#0000ff,        title="USD label color",group = "color")
color_gbp = input(color.purple,   title="GBP label color",group = "color")
color_chf = input(color.fuchsia,  title="CHF label color",group = "color")
color_jpy = input(color.orange,   title="JPY label color",group = "color")
color_aud = input(color.lime,     title="AUD label color",group = "color")
color_cad = input(color.red,      title="CAD label color",group = "color")
color_nzd = input(color.green,    title="NZD label color",group = "color")

//weight
usd_weight = 0.88
eur_weight = 0.32
jpy_weight = 0.17
gbp_weight = 0.13
aud_weight = 0.07
cad_weight = 0.05
chf_weight = 0.05
nzd_weight = 0.02

// Function to get moving average
get_dema(source, length) =>
    ema1 = ta.ema(source, length)
    ema2 = ta.ema(ema1, length)
    2 * ema1 - ema2
get_ma(source, length) =>
    switch ma_type
        "SMA" => ta.sma(source, length)
        "EMA" => ta.ema(source, length)
        "SMMA(RMA)" => ta.rma(source, length)
        "DEMA" => get_dema(source,length)
        "WMA" => ta.wma(source, length)
        "VWMA" => ta.vwma(source, length)

// Function to request currency data
get_currency_data(symbol) =>
    request.security(symbol, timeframe.period, close)

// Get currency pair data
eur_usd = get_currency_data("OANDA:EURUSD")
gbp_usd = get_currency_data("OANDA:GBPUSD")
aud_usd = get_currency_data("OANDA:AUDUSD")
nzd_usd = get_currency_data("OANDA:NZDUSD")

//---- pair data
usd_eur = 1 / eur_usd
usd_gbp = 1 / gbp_usd
usd_aud = 1 / aud_usd
usd_nzd = 1 / nzd_usd
usd_jpy = get_currency_data("OANDA:USDJPY")
usd_chf = get_currency_data("OANDA:USDCHF")
usd_cad = get_currency_data("OANDA:USDCAD")

//currencies strength
usd_strength = (math.log(usd_eur) + math.log(usd_gbp) + math.log(usd_jpy / 100) + math.log(usd_chf) + math.log(usd_aud) + math.log(usd_cad) + math.log(usd_nzd)) / 7
eur_strength = -math.log(usd_eur)
gbp_strength = -math.log(usd_gbp)
jpy_strength = -math.log(usd_jpy/100)
chf_strength = -math.log(usd_chf)
aud_strength = -math.log(usd_aud)
cad_strength = -math.log(usd_cad)
nzd_strength = -math.log(usd_nzd)

// Cross pairs for enhanced calculation
eur_gbp = get_currency_data("OANDA:EURGBP")
eur_jpy = get_currency_data("OANDA:EURJPY")
eur_aud = get_currency_data("OANDA:EURAUD")
eur_cad = get_currency_data("OANDA:EURCAD")
eur_nzd = get_currency_data("OANDA:EURNZD")
eur_chf = get_currency_data("OANDA:EURCHF")

gbp_jpy = get_currency_data("OANDA:GBPJPY")
gbp_cad = get_currency_data("OANDA:GBPCAD")
gbp_aud = get_currency_data("OANDA:GBPAUD")
gbp_chf = get_currency_data("OANDA:GBPCHF")
gbp_nzd = get_currency_data("OANDA:GBPNZD")

aud_cad = get_currency_data("OANDA:AUDCAD")
aud_nzd = get_currency_data("OANDA:AUDNZD")
aud_chf = get_currency_data("OANDA:AUDCHF")
aud_jpy = get_currency_data("OANDA:AUDJPY")

cad_jpy = get_currency_data("OANDA:CADJPY")
cad_chf = get_currency_data("OANDA:CADCHF")

nzd_jpy = get_currency_data("OANDA:NZDJPY")
nzd_cad = get_currency_data("OANDA:NZDCAD")
nzd_chf = get_currency_data("OANDA:NZDCHF")

chf_jpy = get_currency_data("OANDA:CHFJPY")

enhanced_strength(base_currency) =>
    strength = switch base_currency
        "USD" =>
            -math.log(eur_usd) - math.log(gbp_usd) + math.log(usd_jpy / 100) + 
             math.log(usd_chf) - math.log(aud_usd) + math.log(usd_cad) - math.log(nzd_usd)
        "EUR" =>
            math.log(eur_usd) + math.log(eur_gbp) + math.log(eur_jpy / 100) + 
             math.log(eur_chf) + math.log(eur_aud) + math.log(eur_cad) + math.log(eur_nzd)
        "GBP" =>
            math.log(gbp_usd) - math.log(eur_gbp) + math.log(gbp_jpy / 100) + 
             math.log(gbp_chf) + math.log(gbp_aud) + math.log(gbp_cad) + math.log(gbp_nzd)
        "JPY" =>
            -math.log(usd_jpy / 100) - math.log(eur_jpy / 100) - math.log(gbp_jpy / 100) - 
             math.log(chf_jpy / 100) - math.log(aud_jpy / 100) - math.log(cad_jpy / 100) - math.log(nzd_jpy / 100)
        "CHF" =>
            -math.log(usd_chf) - math.log(eur_chf) - math.log(gbp_chf) + 
             math.log(chf_jpy / 100) - math.log(aud_chf) - math.log(cad_chf) - math.log(nzd_chf)
        "AUD" =>
            math.log(aud_usd) - math.log(eur_aud) - math.log(gbp_aud) + 
             math.log(aud_jpy / 100) + math.log(aud_chf) + math.log(aud_cad) + math.log(aud_nzd)
        "CAD" =>
            -math.log(usd_cad) - math.log(eur_cad) - math.log(gbp_cad) + 
             math.log(cad_jpy / 100) + math.log(cad_chf) - math.log(aud_cad) - math.log(nzd_cad)
        "NZD" =>
            math.log(nzd_usd) + math.log(eur_nzd) + math.log(gbp_nzd) + 
             math.log(nzd_jpy / 100) + math.log(nzd_chf) + math.log(aud_nzd) + math.log(nzd_cad)
        => 0.0
    weight = switch base_currency
        "USD" => usd_weight
        "EUR" => eur_weight
        "GBP" => gbp_weight
        "JPY" => jpy_weight
        "CHF" => chf_weight
        "AUD" => aud_weight
        "CAD" => cad_weight
        "NZD" => nzd_weight
        => 1.0
    use_volume_weight ? strength * weight : strength / 7

// Calculate raw strengths
usd_raw = enhanced_strength("USD")
eur_raw = enhanced_strength("EUR")
gbp_raw = enhanced_strength("GBP")
jpy_raw = enhanced_strength("JPY")
chf_raw = enhanced_strength("CHF")
aud_raw = enhanced_strength("AUD")
cad_raw = enhanced_strength("CAD")
nzd_raw = enhanced_strength("NZD")

// Z-Score normalization
normalize_zscore(strength, length) =>
    avg = ta.sma(strength, length)
    std_dev = ta.stdev(strength, length)
    std_dev > 0 ? (strength - avg) / std_dev : 0

// Apply normalization
normalize_strength(strength) =>
    switch normalization
        "Standard" => strength
        "Z-Score" => normalize_zscore(strength, slow_period)
        "Basket" => 
            // Basket normalization: subtract average of all currencies
            avg_strength = (usd_raw + eur_raw + gbp_raw + jpy_raw + chf_raw + aud_raw + cad_raw + nzd_raw) / 8
            strength - avg_strength


if use_advanced
    usd_strength := normalize_strength(usd_raw)
    eur_strength := normalize_strength(eur_raw)
    gbp_strength := normalize_strength(gbp_raw)
    jpy_strength := normalize_strength(jpy_raw)
    chf_strength := normalize_strength(chf_raw)
    aud_strength := normalize_strength(aud_raw)
    cad_strength := normalize_strength(cad_raw)
    nzd_strength := normalize_strength(nzd_raw)

if use_manual
    slow_period := ma_slow
    fast_period := ma_fast

// Apply moving averages
usd_ma = get_ma(usd_strength, slow_period)
eur_ma = get_ma(eur_strength, slow_period)
gbp_ma = get_ma(gbp_strength, slow_period)
jpy_ma = get_ma(jpy_strength, slow_period)
chf_ma = get_ma(chf_strength, slow_period)
aud_ma = get_ma(aud_strength, slow_period)
cad_ma = get_ma(cad_strength, slow_period)
nzd_ma = get_ma(nzd_strength, slow_period)

// Fast moving averages for signals
usd_fast = get_ma(usd_strength, fast_period)
eur_fast = get_ma(eur_strength, fast_period)
gbp_fast = get_ma(gbp_strength, fast_period)
jpy_fast = get_ma(jpy_strength, fast_period)
chf_fast = get_ma(chf_strength, fast_period)
aud_fast = get_ma(aud_strength, fast_period)
cad_fast = get_ma(cad_strength, fast_period)
nzd_fast = get_ma(nzd_strength, fast_period)

// Plot currency strengths
plot(show_usd ? usd_ma : na, "USD", color_usd, 3)
plot(show_eur ? eur_ma : na, "EUR", color_eur, 3)
plot(show_gbp ? gbp_ma : na, "GBP", color_gbp, 3)
plot(show_jpy ? jpy_ma : na, "JPY", color_jpy, 3)
plot(show_chf ? chf_ma : na, "CHF", color_chf, 3)
plot(show_aud ? aud_ma : na, "AUD", color_aud, 3)
plot(show_cad ? cad_ma : na, "CAD", color_cad, 3)
plot(show_nzd ? nzd_ma : na, "NZD", color_nzd, 3)

plot(show_usd ? usd_fast : na, "USD", color.new(color_usd,30), 2)
plot(show_eur ? eur_fast : na, "EUR", color.new(color_eur,30), 2)
plot(show_gbp ? gbp_fast : na, "GBP", color.new(color_gbp,30), 2)
plot(show_jpy ? jpy_fast : na, "JPY", color.new(color_jpy,30), 2)
plot(show_chf ? chf_fast : na, "CHF", color.new(color_chf,30), 2)
plot(show_aud ? aud_fast : na, "AUD", color.new(color_aud,30), 2)
plot(show_cad ? cad_fast : na, "CAD", color.new(color_cad,30), 2)
plot(show_nzd ? nzd_fast : na, "NZD", color.new(color_nzd,30), 2)

usd_cross = ta.cross(usd_ma,usd_fast)
eur_cross = ta.cross(eur_ma,eur_fast)
gbp_cross = ta.cross(gbp_ma,gbp_fast)
jpy_cross = ta.cross(jpy_ma,jpy_fast)
chf_cross = ta.cross(chf_ma,chf_fast)
aud_cross = ta.cross(aud_ma,aud_fast)
cad_cross = ta.cross(cad_ma,cad_fast)
nzd_cross = ta.cross(nzd_ma,nzd_fast)

cross = usd_cross and eur_cross and gbp_cross and jpy_cross and chf_cross and aud_cross and cad_cross and nzd_cross
alertcondition(cross, title="RCS CROSSING", message="RCS CROSSING")
```