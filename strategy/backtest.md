## backtesting / tradingview

#### 설정
strategy("_STGY", overlay=true, initial_capital=100000, currency=currency.USD, default_qty_type = strategy.percent_of_equity, default_qty_value = 33, slippage=2, process_orders_on_close = true, fill_orders_on_standard_ohlc = true)

#### 손익비 계산
```
var float TP_pip = input(13.3, title="TP Pips (forex)")
var float SL_pip = input(6.3, title="SL Pips (forex)")
var float TP_percent = input.float(1, title="TP % (crypto)")  // e.g. 0.2% TP
var float SL_percent = input.float(0.3, title="SL % (crypto)")  // e.g. 0.1% SL
var float TP_points = input.float(33.0, title="TP Points (Futures)")
var float SL_points = input.float(13.0, title="SL Points (Futures)")

pip_value = 0.0001
if (syminfo.currency == "JPY")
    pip_value := 0.01

isCrypto = str.contains(syminfo.ticker, "USDT")

// Tick size
tick_size = syminfo.mintick

// Determine if ES or NQ
isFutures = str.contains(syminfo.ticker, "ES") or str.contains(syminfo.ticker, "NQ")

// TP / SL for Futures
TP = isCrypto ? close * (TP_percent / 100) : isFutures ? TP_points : TP_pip * pip_value
SL = isCrypto ? close * (SL_percent / 100) : isFutures ? SL_points : SL_pip * pip_value
```
```
noPosition = strategy.position_size == 0
if (buy_signal and noPosition)
    strategy.entry("Long", strategy.long)
    strategy.exit("TP/SL Long", from_entry="Long", limit=close+TP, stop=close-SL)

if (sell_signal and noPosition)
    strategy.entry("Short", strategy.short)
    strategy.exit("TP/SL Short", from_entry="Short", limit=close-TP, stop=close+SL)
```