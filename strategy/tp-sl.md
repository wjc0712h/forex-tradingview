#### 손익비 계산.
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