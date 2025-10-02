```
## HA
```
// === Inputs ===
src_ = input(hlc3, title="VWAP Source")
anchor = input.string("Session", title="Anchor Period", options=["Session", "Week", "Month", "Quarter", "Year"], group="VWAP Settings")
offset = input.int(0, title="Offset", group="VWAP Settings", minval=0)
bandMult = input.float(1.0, title="VWAP Band Mult", step=0.5)
volatilityWindow = input.int(20, title="Volatility Period")
maxVolatility = input.float(2.0, title="Max ATR Volatility Filter", step=0.1)
trendStrength = input.int(20, title="Drift Lookback (Trend Strength)")

// === VWAP Bands ===
isNewPeriod = switch anchor
    "Session" => timeframe.change("D")
    "Week" => timeframe.change("W")
    "Month" => timeframe.change("M")
    "Quarter" => timeframe.change("3M")
    "Year" => timeframe.change("12M")
    => false

[vwapVal, upper, _] = ta.vwap(src_, isNewPeriod, 1)
stdevAbs = upper - vwapVal
upperBand = vwapVal + bandMult * stdevAbs
lowerBand = vwapVal - bandMult * stdevAbs

plot(vwapVal, title="VWAP", color=color.blue)
plot(upperBand, title="Upper Band", color=color.red)
plot(lowerBand, title="Lower Band", color=color.green)

// === Relative Volume Expectation Model (S-shaped) ===
// Corrected timestamp usage: Use a valid starting datetime for the calculation of milliseconds
// You can use a fixed past date like Jan 1, 2000, or just use time() which gives current bar's timestamp in ms.
// For `dayProgress`, we want milliseconds *since the beginning of the current day*.
// The `timenow` gives current exchange time in milliseconds.
// To get milliseconds since midnight of the current day, we can subtract the timestamp of the beginning of the current day.

// Get the timestamp of the current bar's day start
var int today_midnight_ms = na
if timeframe.change("D")
    today_midnight_ms := timenow - (hour(timenow) * 60 * 60 * 1000) - (minute(timenow) * 60 * 1000) - (second(timenow) * 1000)

// Calculate day progress in milliseconds from the start of the current trading day
dayProgress = timenow - today_midnight_ms

// The rest of your S-shaped model calculation remains the same
sessionMinutes = 6.5 * 60 // US session: 9:30–16:00 = 390 mins
t = dayProgress / (sessionMinutes * 60 * 1000)
t := math.min(math.max(t, 0), 1)
xExpected = 5*t/3 - 2*t*t + 4*t*t*t/3

plot(xExpected, title="E[X(t)]", color=color.new(color.purple, 80), display=display.none) // background calc

// === Drift Detection ===
trend = ta.ema(close, trendStrength)
priceDrift = close - trend
driftSignal = ta.ema(priceDrift, 5)

// === Volatility Filter ===
atr = ta.atr(volatilityWindow)
volOk = atr < maxVolatility * syminfo.mintick

// === Entry Zones with Tolerance ===
tolerance = close * 0.0015 // Corrected: 0.0015 is already a percentage, no need to divide by 100 again
buyZone = close < lowerBand or (close >= lowerBand and close <= lowerBand + tolerance)
sellZone = close > upperBand or (close <= upperBand and close >= upperBand - tolerance)

// === Entry Timing (Binning - every 30 mins) ===
binMins = 30
binOK = (minute(timenow) % binMins == 0) // Use minute() with timenow

// === Final Entry Conditions ===
buyCond = buyZone and volOk and binOK and driftSignal > 0
sellCond = sellZone and volOk and binOK and driftSignal < 0```

// // VWAP Buy Zone: Price near VWAP or lower bands (tolerance-based) or crossover
// vwap_buy_zone = (f_touches_buy(vwapValue, tolerance) or f_touches_buy(lowerBandValue1, tolerance) or f_touches_buy(lowerBandValue2, tolerance) or f_touches_buy(lowerBandValue3, tolerance) or f_touches_buy2(vwapValue) or f_touches_buy2(lowerBandValue1) or f_touches_buy2(lowerBandValue2) or f_touches_buy2(lowerBandValue3)) and f_is_thrust_candle() and f_confirm_bounce_buy()

// // VWAP Sell Zone: Price near VWAP or upper bands (tolerance-based) or crossover
// vwap_sell_zone = (f_touches_sell(vwapValue, tolerance) or f_touches_sell(upperBandValue1, tolerance) or f_touches_sell(upperBandValue2, tolerance) or f_touches_sell(upperBandValue3, tolerance) or f_touches_sell2(vwapValue) or f_touches_sell2(upperBandValue1) or f_touches_sell2(upperBandValue2) or f_touches_sell2(upperBandValue3)) and f_is_thrust_candle() and f_confirm_bounce_sell()
// buy_signal = vwap_buy_zone and ha_buy_signal
// sell_signal = vwap_sell_zone and ha_sell_signal
// --- VWAP REVERSAL DETECTION ---
// --- INPUTS FOR REVERSAL CANDLE DETECTION ---
input_min_wick_ratio = input.float(0.4, "Min Rejection Wick Ratio (0.0-1.0)", minval=0.0, maxval=1.0, step=0.05, group="Reversal Candle Settings")
input_max_body_ratio = input.float(0.4, "Max Body Ratio for Rejection (0.0-1.0)", minval=0.0, maxval=1.0, step=0.05, group="Reversal Candle Settings")

// --- REVERSAL CANDLE FUNCTIONS ---
// Function to check for a bearish reversal candle (e.g., Shooting Star, inverted hammer at resistance)
f_is_bearish_reversal_candle(open_price, close_price, high_price, low_price, min_wick_ratio, max_body_ratio) =>
    body_size = math.abs(close_price - open_price)
    total_range = high_price - low_price

    // Avoid division by zero
    if total_range == 0
        false
    
    upper_wick_size = high_price - math.max(open_price, close_price) // Upper wick is from the higher of open/close to high
    lower_wick_size = math.min(open_price, close_price) - low_price   // Lower wick is from the lower of open/close to low

    // A significant upper wick (rejection from above)
    is_long_upper_wick = upper_wick_size / total_range >= min_wick_ratio
    
    // Body is relatively small, indicating indecision or struggle
    is_small_body = body_size / total_range <= max_body_ratio
    
    // Ideally closes bearish, or at least not strongly bullish (i.e., close <= open)
    is_bearish_or_doji = close_price <= open_price
    
    // Combine conditions
    is_long_upper_wick and is_small_body // More general resistance candle
    // If you want to be very specific to Shooting Star:
    // and is_bearish_or_doji and lower_wick_size / total_range < 0.1 // Small lower wick
    

// Function to check for a bullish reversal candle (e.g., Hammer, inverted hammer at support)
f_is_bullish_reversal_candle(open_price, close_price, high_price, low_price, min_wick_ratio, max_body_ratio) =>
    body_size = math.abs(close_price - open_price)
    total_range = high_price - low_price

    // Avoid division by zero
    if total_range == 0
        false

    upper_wick_size = high_price - math.max(open_price, close_price)
    lower_wick_size = math.min(open_price, close_price) - low_price
    
    // A significant lower wick (rejection from below)
    is_long_lower_wick = lower_wick_size / total_range >= min_wick_ratio
    
    // Body is relatively small
    is_small_body = body_size / total_range <= max_body_ratio
    
    // Ideally closes bullish, or at least not strongly bearish (i.e., close >= open)
    is_bullish_or_doji = close_price >= open_price
    
    // Combine conditions
    is_long_lower_wick and is_small_body // More general support candle
    // If you want to be very specific to Hammer:
    // and is_bullish_or_doji and upper_wick_size / total_range < 0.1 // Small upper wick

// Bullish Reversal at VWAP Bands
f_vwap_reversal_buy(vwap_val, lower_b1, lower_b2, lower_b3, current_open, current_close, current_high, current_low, tolerance, min_wick_ratio, max_body_ratio) =>
    // Condition 1: Price interacting with a lower VWAP band (tolerance or crossover)
    touches_lower_bands = (f_touches_buy(vwap_val, tolerance) or f_touches_buy(lower_b1, tolerance) or f_touches_buy(lower_b2, tolerance) or f_touches_buy(lower_b3, tolerance)) or
                          (f_touches_buy2(vwap_val) or f_touches_buy2(lower_b1) or f_touches_buy2(lower_b2) or f_touches_buy2(lower_b3))

    // Condition 2: Current candle is a bullish reversal pattern
    is_bull_reversal_candle = f_is_bullish_reversal_candle(current_open, current_close, current_high, current_low, min_wick_ratio, max_body_ratio)
    
    // Condition 3: Price is at or below the lowest band and showing reversal (your existing logic)
    // You can refine `lowest` here to make it relative to the VWAP structure if needed.
    is_at_extreme_low_reversal = (current_close < lower_b3 and lowest)

    // Combine for a VWAP reversal buy signal
    (touches_lower_bands or is_at_extreme_low_reversal) and is_bull_reversal_candle


// Bearish Reversal at VWAP Bands
f_vwap_reversal_sell(vwap_val, upper_b1, upper_b2, upper_b3, current_open, current_close, current_high, current_low, tolerance, min_wick_ratio, max_body_ratio) =>
    // Condition 1: Price interacting with an upper VWAP band (tolerance or crossover)
    touches_upper_bands = (f_touches_sell(vwap_val, tolerance) or f_touches_sell(upper_b1, tolerance) or f_touches_sell(upper_b2, tolerance) or f_touches_sell(upper_b3, tolerance)) or
                          (f_touches_sell2(vwap_val) or f_touches_sell2(upper_b1) or f_touches_sell2(upper_b2) or f_touches_sell2(upper_b3))

    // Condition 2: Current candle is a bearish reversal pattern
    is_bear_reversal_candle = f_is_bearish_reversal_candle(current_open, current_close, current_high, current_low, min_wick_ratio, max_body_ratio)
    
    // Condition 3: Price is at or above the highest band and showing reversal (your existing logic)
    is_at_extreme_high_reversal = (current_close > upper_b3 and highest)

    // Combine for a VWAP reversal sell signal
    (touches_upper_bands or is_at_extreme_high_reversal) and is_bear_reversal_candle

// --- INTEGRATE INTO YOUR STRATEGY ---

// Calculate VWAP Reversal Signals
vwap_reversal_buy_signal = f_vwap_reversal_buy(vwapValue, lowerBandValue1, lowerBandValue2, lowerBandValue3, open, close, high, low, tolerance, input_min_wick_ratio, input_max_body_ratio)
vwap_reversal_sell_signal = f_vwap_reversal_sell(vwapValue, upperBandValue1, upperBandValue2, upperBandValue3, open, close, high, low, tolerance, input_min_wick_ratio, input_max_body_ratio)
// Or, replacing the VWAP zone entirely if the reversal pattern is your main VWAP entry trigger
buy_signal = vwap_reversal_buy_signal and ha_buy_signal
sell_signal = vwap_reversal_sell_signal and ha_sell_signal
```