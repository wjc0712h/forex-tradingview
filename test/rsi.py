import pandas as pd
import numpy as np
from ta.momentum import RSIIndicator
from itertools import product

# Load EUR/USD data (replace with your data source)
# Expected format: Date, Open, High, Low, Close
data = pd.read_csv('EURUSD_daily.csv')
data['Date'] = pd.to_datetime(data['Date'])
data.set_index('Date', inplace=True)

# Define parameter ranges
rsi_lengths = range(5, 51, 5)  # 5 to 50, step 5 (reduce for faster testing)
overbought_levels = range(50, 91, 5)  # 50 to 90, step 5
oversold_levels = range(10, 51, 5)   # 10 to 50, step 5

# Store results
results = []

# Backtest function
def backtest_rsi(data, length, overbought, oversold):
    # Calculate RSI
    rsi = RSIIndicator(data['Close'], window=length).rsi()
    data['RSI'] = rsi
    
    # Initialize signals
    data['Signal'] = 0
    data['Position'] = 0
    
    # Generate signals
    for i in range(1, len(data)):
        if data['RSI'].iloc[i-1] > oversold and data['RSI'].iloc[i] <= oversold:
            data['Signal'].iloc[i] = 1  # Buy
        elif data['RSI'].iloc[i-1] < overbought and data['RSI'].iloc[i] >= overbought:
            data['Signal'].iloc[i] = -1  # Sell
    
    # Calculate position
    data['Position'] = data['Signal'].shift(1)  # Hold position until next signal
    
    # Calculate returns (assuming 1 lot, no spread/slippage)
    data['Returns'] = data['Close'].pct_change()
    data['Strategy_Returns'] = data['Position'] * data['Returns']
    
    # Total profit (cumulative returns)
    total_profit = data['Strategy_Returns'].sum() * 10000  # Scale for pips
    return total_profit

# Iterate through parameter combinations
for length, overbought, oversold in product(rsi_lengths, overbought_levels, oversold_levels):
    if oversold >= overbought:  # Skip invalid combinations
        continue
    profit = backtest_rsi(data.copy(), length, overbought, oversold)
    results.append({
        'length': length,
        'overbought': overbought,
        'oversold': oversold,
        'profit': profit
    })

# Convert results to DataFrame
results_df = pd.DataFrame(results)
best_params = results_df.loc[results_df['profit'].idxmax()]

print("Best Parameters:")
print(f"RSI Length: {best_params['length']}")
print(f"Overbought: {best_params['overbought']}")
print(f"Oversold: {best_params['oversold']}")
print(f"Profit: {best_params['profit']:.2f} pips")