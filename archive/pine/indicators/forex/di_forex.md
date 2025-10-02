// This Pine Script® code is subject to the terms of the Mozilla Public License 2.0 at https://mozilla.org/MPL/2.0/
// © cdw1432t

//@version=6
indicator(title = "disparity scalp", shorttitle = "DIS", overlay=false)

// VARIABLES
di_len = input.int(20, "SMA Length", minval=1)
di_threshold = input.float(1, "DI threshold")
showLABELS = input.bool(false, "Show Labels", group="Show")
showSTATS = input.bool(false, "Show Statistics", group="Show")

// DATA
sma = ta.sma(close, di_len)
di_percent = (100 * (close - sma) / sma)

less_di = (di_threshold <= di_percent)  
more_di = (-di_threshold >= di_percent) 


plot(di_percent, title="Disparity Index", linewidth=2, color=color.black)
hline(0, title="Zero Level", linestyle=hline.style_solid, color=color.black)


type PotentialPoint
    float price
    float deviation
    int barIndex
    bool isHigh

var potentialPoints = array.new<PotentialPoint>()
var float[] deviationsArray = array.new<float>() 
lookaheadBars = input.int(25, title="lookaheadBars", minval=1)
if array.size(potentialPoints) > 0
    for i = array.size(potentialPoints) - 1 to 0
        currentPoint = array.get(potentialPoints, i)

        if bar_index >= currentPoint.barIndex + lookaheadBars
            confirmedNeverRevisited = true

            if currentPoint.isHigh
                for k = 1 to lookaheadBars
                    if currentPoint.barIndex + k <= bar_index
                        if close[bar_index - (currentPoint.barIndex + k)] >= currentPoint.price
                            confirmedNeverRevisited := false
                            break
                    else
                        confirmedNeverRevisited := false
                        break
            else
                for k = 1 to lookaheadBars
                    if currentPoint.barIndex + k <= bar_index
                        if close[bar_index - (currentPoint.barIndex + k)] <= currentPoint.price
                            confirmedNeverRevisited := false
                            break
                    else
                        confirmedNeverRevisited := false
                        break

            if confirmedNeverRevisited
                if showLABELS
                    label.new(x = currentPoint.barIndex,y = currentPoint.deviation,yloc = yloc.price,text = str.tostring(currentPoint.deviation, "#.##") + "%",style = currentPoint.isHigh ? label.style_label_down : label.style_label_up,color = currentPoint.isHigh ? color.rgb(255, 82, 82, 77) : color.rgb(76, 175, 79, 77),textcolor = color.black,text_formatting = text.format_bold)

                array.push(deviationsArray, math.abs(currentPoint.deviation)) 

            array.remove(potentialPoints, i)

if ta.highestbars(close, lookaheadBars) == 0
    deviationHigh = (close - sma) / sma * 100
    if deviationHigh > 0
        newHighPoint = PotentialPoint.new(close, deviationHigh, bar_index, true)
        array.push(potentialPoints, newHighPoint)

if ta.lowestbars(close, lookaheadBars) == 0  
    deviationLow = (close - sma) / sma * 100
    if deviationLow < 0
        newLowPoint = PotentialPoint.new(close, deviationLow, bar_index, false)
        array.push(potentialPoints, newLowPoint)


//-------------Current DI
var label currentDeviationLabel = na

if barstate.islast
    if na(currentDeviationLabel) and showLABELS
        currentDeviationLabel := label.new(x = bar_index,y = di_percent,style = label.style_label_lower_left,textcolor = color.black,size = size.normal,text_formatting = text.format_bold)
        label.set_x(currentDeviationLabel, bar_index)
        label.set_y(currentDeviationLabel, di_percent)
        label.set_text(currentDeviationLabel, str.tostring(di_percent, "#.##") + "%")
        label.set_color(currentDeviationLabel, di_percent >= 0 ? color.new(color.green, 33) : color.new(color.red, 33))

if not barstate.islast and not na(currentDeviationLabel)
    label.delete(currentDeviationLabel)
    currentDeviationLabel := na

//-------------STATS
var table disparityTable = table.new(position.bottom_right, 2, 7, border_width=1)
f_mean(arr) =>
    float result = na
    if array.size(arr) > 0
        total = 0.0
        for i = 0 to array.size(arr) - 1
            total += array.get(arr, i)
        result := total / array.size(arr)
    result

f_median(arr) =>
    float result = na
    if array.size(arr) > 0
        sorted = array.copy(arr)
        array.sort(sorted, order.ascending)
        mid = array.size(sorted) / 2
        if array.size(sorted) % 2 == 0
            result := (array.get(sorted, mid - 1) + array.get(sorted, mid)) / 2
        else
            result := array.get(sorted, mid)
    result

f_mode(arr) =>
    float result = na
    if array.size(arr) > 0
        map<float, int> counts = map.new<float, int>()
        for i = 0 to array.size(arr) - 1
            val = array.get(arr, i)
            cnt = counts.get(val)
            if na(cnt)
                cnt := 0
            counts.put(val, cnt + 1)

        keys = map.keys(counts)
        maxCount = 0
        for i = 0 to array.size(keys) - 1
            key = array.get(keys, i)
            count = counts.get(key)
            if count > maxCount
                maxCount := count
                result := key
    result

f_min(arr) => array.size(arr) > 0 ? array.min(arr) : na
f_max(arr) => array.size(arr) > 0 ? array.max(arr) : na
f_current(dev, mean, median, mode, min, max) =>
    col = color.black
    val = math.abs(dev)
    if val > mean or val > median
        col := color.blue
    [dev,col]

if array.size(deviationsArray) >= 5
    recentCount = math.min(array.size(deviationsArray), 20)
    recentDevs = array.new<float>()
    for i = array.size(deviationsArray) - recentCount to array.size(deviationsArray) - 1
        array.push(recentDevs, array.get(deviationsArray, i))
    meanVal = f_mean(recentDevs)
    medianVal = f_median(recentDevs)
    modeVal = f_mode(recentDevs)
    minVal = f_min(recentDevs)
    maxVal = f_max(recentDevs)
    [currentVal, currentColor] = f_current(di_percent, meanVal,medianVal,modeVal,minVal,maxVal)
    if showSTATS and barstate.islast  
        table.cell(disparityTable, 0, 0, "Stats", text_color=color.white, bgcolor=color.rgb(54, 58, 69, 50))
        table.cell(disparityTable, 0, 1, "Current")
        table.cell(disparityTable, 1, 1, na(currentVal) ? "N/A" : str.tostring(currentVal, "#.##") + "%", text_color = currentColor)
        table.cell(disparityTable, 0, 2, "Mean")
        table.cell(disparityTable, 1, 2, na(meanVal) ? "N/A" : str.tostring(meanVal, "#.##") + "%")
        table.cell(disparityTable, 0, 3, "Median")
        table.cell(disparityTable, 1, 3, na(medianVal) ? "N/A" : str.tostring(medianVal, "#.##") + "%")
        table.cell(disparityTable, 0, 4, "Mode")
        table.cell(disparityTable, 1, 4, na(modeVal) ? "N/A" : str.tostring(modeVal, "#.##") + "%")
        table.cell(disparityTable, 0, 5, "Highest")
        table.cell(disparityTable, 1, 5, na(maxVal) ? "N/A" : str.tostring(maxVal, "#.##") + "%")
        table.cell(disparityTable, 0, 6, "Lowest")
        table.cell(disparityTable, 1, 6, na(minVal) ? "N/A" : str.tostring(minVal, "#.##") + "%")

    if di_percent > medianVal or di_percent < -medianVal
        label.new(x = bar_index,y = di_percent,style = label.style_circle,size = size.tiny,color= color.rgb(155, 39, 176, 60))