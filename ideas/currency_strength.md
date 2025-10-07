이건 내가 통화의 힘을 구하기 위한 생각을 글로 적은것이다. 나는 전문지식이 없기 때문에 여기에 적는 정보는 전문성이나 타당성이 매우 떨어진다.\
또 생각을 글로 옮기는 과정에서 AI 도움을 많이 받았다. 그저 나의 뇌가 사고하는 것을 문장으로 표현한 것으로 확정된 말투로 적지 않았다. 

//-----------------------\
데이터가 많아질수록, 계산법이 발전할수록 상대강도가 정확해진다고 할때 그 계산된 강도들로 절대강도를 계산할수있을까?\
절대강도라는 것은 사실 극도로 발전된 상대강도일것이다. 왜냐면 절대강도라는 것이 있을수 없지 않은가?...

다른 사람들이 계산한 통화상대강도지표도 여러번 보았고 또 직접 만들어 보았을때 다 비슷한 계산법을 관찰할수있다.\
주요 통화 8개를 포함하는 28개의 크로스 페어를 기본으로 계산하는 것이다.

내가 주로 쓰는 FOTSI, FXRSI, FXMACD는 모두 이런 기본으로 계산된다.

FOTSI는 Serghey Magala의 블로그에서 처음 보았다. 통화별로 집계된 TSI(True Strength Index) 지표 값을 기반으로 계산하는 통화상대강도 지표이며 이 지표에 매료되어 FXRSI, FXMACD를 만들었다.

$$usd = (-eurusd - gbpusd  + usdjpy  + usdchf  - audusd  + usdcad - nzdusd)$$
이런식으로 한 통화의 강세를 해당 통화의 크로스페어들의 합으로 계산할수있다.

$$usd = (-eurusd * 0.30 - gbpusd * 0.22 + usdjpy * 0.28 + usdchf * 0.10 - audusd * 0.08 + usdcad * 0.02 - nzdusd * 0.00)$$
통화별로 가중치를 두어 계산할수있다. DXY(달러지수)를 생각하면 쉽다. DXY또한 이런식으로 통화별로 가중치를 두어 계산된다. 물론 위와 같이 간단한 식으로 계산되는게 아닐수도 있다. 

```
zscore(src, length) =>
    mean = ta.ema(src, length)           // 주어진 길이만큼 지수이동평균을 계산하여 평균을 구함
    stddev = ta.stdev(src, length)       // 표준편차 계산: 값이 평균에서 얼마나 벗어나는지 측정
    (src - mean) / stddev                // z-score: 값이 평균에서 몇 표준편차만큼 떨어져 있는지 나타냄


macd_calc(src, fast, slow, sig) =>
    fast_ma = ta.ema(src, fast)          // 단기 EMA: 최근 가격 변화에 더 민감
    slow_ma = ta.ema(src, slow)          // 장기 EMA: 가격 변화의 전체 흐름을 반영
    macd = zscore(fast_ma - slow_ma, zscore_length) // 두 EMA 차이를 z-score로 정규화
    signal = ta.ema(macd, sig)           // MACD 신호선: MACD 흐름을 부드럽게 추적
    hist = macd - signal                  // 히스토그램: MACD와 신호선 간 차이
    [macd,signal,hist]


rsi_macd_calc(src, fast, slow, sig) =>
    fast_ma = ta.ema(src, fast)          // 단기 EMA
    slow_ma = ta.ema(src, slow)          // 장기 EMA
    macd = zscore(fast_ma - slow_ma,lengthZscore) // MACD 차이의 z-score
    signal = ta.ema(macd, sig)           // 신호선
    rsi_val = ta.rsi(signal, lengthRSI)  // RSI: 신호선 변동성 기반 과매수/과매도 판단
    rsi_val

```
위와 같이 통화지수를 활용해 macd, rsi로 변형시킨후 zscore(정규화 방식)을 해주었다.\
//----------------------\
시장은 항상 균형을 유지하려고 하는 거 같다. 아니, 균형이 깨지는 것을 싫어한다. 균형이 깨지면 변동성은 당연히 높아진다.

A라는 통화가 매수된다는 것은, B라는 통화를 팔고 A를 매수하는 것이다.\
나는 이것이 보존법칙이라고 생각한다.

8개의 주요 통화: `USD,CAD,EUR,GBP,CHF,JPY,AUD,NZD`의 순 포지션 합계는 항상 0이될것이다.\
물론 세상에는 다른 많은 통화가 있고 그것들과의 상호작용은 무시할수없을것이다. 그러나 주요 통화들끼리의 상대강도를 구하는 것이므로 잡다함은 생략한다.

쉽게 말해, $100의 유입은 $100달러 상당의 통화(들)의 유출이다. 8개 통화를 합친 포지션의 에너지는 만들어지거나 없어지지않는다는 것이다.\
총 에너지 안에서 부분 에너지들이 끊임없이 변환된다. 자금 흐름(money flow)인것이다. 통화의 에너지가 어느 통화 혹은 분산되어 어느 통화들로 가는지를 알아내면 돈을 벌수있을것이다.
 
정리하면,

$$\displaystyle\sum_{}^{} 주요통화순포지션 = 0$$

그래서,
* 8개의 통화가 모두 매수될수없고 모두 매도 될수없을것이다.
* 한 통화의 강세는 다른 통화의 약세이며, 힘은 분산될수있을것이다.
* 극단적인 포지션 불균형은 결국 조정을 받을것으로 보인다.
* 등등, 더 생각이 안난다.

계산법

$$r_t = \ln\!\left(\dfrac{P_t}{P_{t-L}}\right)$$

각 통화쌍의 log return을 계산한다.

```
half_EURUSD = r_eurusd * 0.5
s_EUR := s_EUR + half_EURUSD
s_USD := s_USD - half_EURUSD
```
해당 return을 반으로 나누어
Base 통화에는 +0.5, Quote 통화에는 -0.5 로 분배한다.

```
sum_raw = s_EUR + s_USD + s_GBP + s_AUD + s_NZD + s_CAD + s_CHF + s_JPY
mean_raw = sum_raw / 8.0

strength_EUR = s_EUR - mean_raw
strength_USD = s_USD - mean_raw
strength_GBP = s_GBP - mean_raw
strength_AUD = s_AUD - mean_raw
strength_NZD = s_NZD - mean_raw
strength_CAD = s_CAD - mean_raw
strength_CHF = s_CHF - mean_raw
strength_JPY = s_JPY - mean_raw
```
모든 strength 합을 구해서 평균을 낸 뒤,
각 통화 strength에서 그 평균을 빼면,
자동으로 총합이 0이 된다.

$$\text{strength}_X = s_X - \frac{\sum_{i=1}^{8} s_i}{8}$$

$$\sum_{i=1}^{8} \text{strength}_i = 0$$

(chatGPT가 식으로 설명해주었다.)

정규화를 해야되는데 정규화를 하면 제로섬 보정이 깨진다.. 아무튼 한번 지표로 만들어 보았는데 FOTSI나 FXRSI보다 더 나은지는 모르겠다.\
해결 방법은, 정규화를 하고 제로섬 보정을 하면 된다.
`tsi_통화 -= tsi_mean` 이런식으로 말이다.\
//----------------------\
통화, 상대강도지수(相對強度指數) 위치, 속도, 가속도에 관한 나의 생각.

$$P_t$$

<p>위치 - 현재 강도  (강한가, 약한가)</p>

* 0 위로: USD가 평균보다 강함
* 0 아래: USD가 평균보다 약함
* 0 크로스: 상대 강도 전환 (강→약 또는 약→강)

$$v_t = P_t - P_{t-1}$$

<p>속도 - 강도 변화율(얼마나 빨리 강해지나 약해지나)</p>

* 0 위: 강해지는 중 (상승 모멘텀)
* 0 아래: 약해지는 중 (하락 모멘텀)
* 0 크로스: 모멘텀 방향 전환

$$a_t = v_t - v_{t-1}$$

<p>가속 - 속도 변화율(모멘텀의 증가 혹은 감소)</p>

* 0 위: 모멘텀 증가 중
* 0 아래: 모멘텀 감소 중
* 0 크로스: 모멘텀 전환점

$$j_t = a_t - a_{t-1}$$

<p>저크 - 충격량(급격한 시장 리벨런스)</p>
//HTF, LTF을 분석하고 그 중간에서 거래를 해야한다.

저크보다 <b>충격량</b>이 더 나은 것같다.
$$J_t(N) = \sum_{i=t-N+1}^{t} m_i \cdot a_i$$
이런식으로 계산 근데 질량은 빼고 가속의 누적 합의 평균으로 계산했다.

* 0 위: 지속적인 상승 압력
* 0 아래: 지속적인 하락 압력
* 0 크로스: 누적 에너지 방향 전환

//----------------------



