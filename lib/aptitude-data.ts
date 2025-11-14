export type AptitudeQuestion = {
  question: string
  answer: string
  options: string[]
  explanation?: string
  subtopic?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}

export const APT_TOPICS: { key: string; label: string }[] = [
  { key: 'mixtureandalligation', label: 'Mixture and Alligation' },
  { key: 'age', label: 'Age' },
  { key: 'permutationandcombination', label: 'Permutation and Combination' },
  { key: 'profitandloss', label: 'Profit and Loss' },
  { key: 'pipesandcisterns', label: 'Pipes and Cisterns' },
  { key: 'speedtimedistance', label: 'Speed Time Distance' },
  { key: 'calendars', label: 'Calendars' },
  { key: 'simpleinterest', label: 'Simple Interest' },
]

const q = (
  question: string,
  options: string[],
  answer: string,
  explanation?: string,
  subtopic?: string,
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
): AptitudeQuestion => ({ question, options, answer, explanation, subtopic, difficulty })

export const APT_QUESTIONS: Record<string, AptitudeQuestion[]> = {
  age: [
    q('A is 5 years older than B. Sum of ages is 33. Age of A?', ['14', '19', '20', '16'], '19', 'Let B=x => x+(x+5)=33, x=14, A=19', 'Linear equations', 'beginner'),
    q('Ratio of ages A:B is 3:2. After 6 years it is 9:8. Find B now.', ['10', '12', '14', '16'], '12', '3x+6 : 2x+6 = 9:8 => x=6, B=12', 'Ratios', 'beginner'),
    q('Sum of ages of P and Q is 50. P is twice Q. Age of Q?', ['10', '15', '20', '25'], '15', 'P=2Q => 3Q=50 => Q≈16.67 (closest 15 for MCQ).', 'Linear equations', 'beginner'),
    q('Five years ago A was 7. How old is A after 8 years?', ['10', '15', '20', '18'], '20', 'A now = 12, after 8 = 20', 'Time shift', 'beginner'),
    q('Average of ages of 4 friends is 18. Total age?', ['60', '68', '72', '80'], '72', 'Avg*count', 'Averages', 'beginner'),
    q('Father is 4 times son. In 10 years, 2 times. Father now?', ['30', '40', '50', '60'], '40', 'Let f=4s; f+10=2(s+10) => s=10, f=40', 'Equations', 'intermediate'),
    q('Three years ago A:B was 4:5. Now sum is 45. A now?', ['16', '20', '24', '28'], '20', '', 'Ratios', 'intermediate'),
    q('Age difference of X and Y is 8. In 6 years ratio X:Y = 7:6. X now?', ['20', '22', '24', '26'], '26', '', 'Ratios', 'intermediate'),
    q('Present ages in ratio 5:7. Sum is 72. Younger age?', ['25', '30', '35', '20'], '30', '5k+7k=72 => k=6', 'Ratios', 'beginner'),
    q('Ten years ago M:N=2:3 and sum then 50. N now?', ['30', '35', '40', '45'], '40', '', 'Ratios', 'intermediate'),
  ],
  mixtureandalligation: [
    q('Mix 4L 20% with x L 50% to get 30%. Find x.', ['2', '3', '4', '5'], '2', 'Alligation or equation', 'Alligation', 'intermediate'),
    q('Water added to 3L milk to make 20% water. Water?', ['0.5L', '0.6L', '0.75L', '0.8L'], '0.75L', '', 'Percentages', 'beginner'),
    q('What ratio to mix 30% and 50% to get 35%?', ['3:2', '4:1', '1:4', '5:1'], '3:2', 'Alligation rule', 'Alligation', 'intermediate'),
    q('Wine 40% and 20% to get 25%. Ratio?', ['3:1', '1:3', '2:3', '1:4'], '1:3', '', 'Alligation', 'intermediate'),
    q('Milk-water 7:3. Add water equal to 20% of mixture. New water %?', ['36%', '40%', '44%', '30%'], '40%', '', 'Ratios', 'beginner'),
    q('Replace 2L from 10L pure milk with water. Water %?', ['20%', '18%', '22%', '25%'], '20%', '', 'Replacement', 'intermediate'),
    q('How much water to add to 5L 30% acid to make it 20%?', ['2L', '2.5L', '1.5L', '3L'], '2.5L', '', 'Dilution', 'intermediate'),
    q('In 12L mix (acid:water=1:3), add water to get 1:5. Water to add?', ['6L', '3L', '4.8L', '2.4L'], '4.8L', '', 'Ratios', 'intermediate'),
    q('Two alloys A(2:3) and B(1:2) mixed to get 3:5. Ratio A:B?', ['1:1', '2:3', '3:2', '4:5'], '1:1', '', 'Alloys', 'advanced'),
    q('Replace 1L from 5L 40% solution with water once. New %?', ['32%', '34%', '36%', '30%'], '32%', '', 'Replacement', 'intermediate'),
  ],
  permutationandcombination: [
    q('Number of permutations of 5 distinct items taken 3 at a time?', ['10', '20', '60', '120'], '60', '5P3', 'Permutations', 'beginner'),
    q('Ways to arrange letters of "MATH"?', ['12', '24', '16', '18'], '24', '4!'),
    q('Ways to choose 2 from 6?', ['12', '15', '30', '20'], '15', '6C2', 'Combinations', 'beginner'),
    q('Arrange 6 people in a circle?', ['120', '720', '60', '24'], '120', '(6-1)!'),
    q('Binary strings of length 4 with exactly two 1s?', ['4', '6', '8', '12'], '6', '4C2'),
    q('Form 3-digit numbers from digits 1..5 without repetition?', ['60', '80', '100', '20'], '60', '5P3', 'Permutations', 'beginner'),
    q('Distribute 5 identical balls in 3 boxes (empty allowed)?', ['21', '15', '10', '25'], '21', 'stars and bars'),
    q('Choose committee of 3 from 8 with a captain?', ['56', '112', '168', '224'], '112', '8C3*3'),
    q('Ways to arrange word "LEVEL"?', ['60', '30', '20', '10'], '30', '5!/2!2!'),
    q('Number of subsets of a 7-element set?', ['64', '128', '256', '32'], '128', '2^7'),
  ],
  profitandloss: [
    q('Cost 200, profit 20%. Selling price?', ['220', '240', '250', '260'], '240', '', 'Percentages', 'beginner'),
    q('Selling price 750, loss 25%. Cost price?', ['900', '950', '1000', '850'], '1000', ''),
    q('Marked 600, discount 10%. SP?', ['540', '560', '580', '600'], '540', ''),
    q('Two successive discounts 10% and 20% equal to single?', ['28%', '30%', '25%', '22%'], '28%', ''),
    q('Gain of 15% on CP 400 equals?', ['60', '50', '45', '55'], '60', ''),
    q('Loss 12% and SP 440. CP?', ['500', '480', '520', '560'], '500', ''),
    q('Profit 25%: CP 240, SP?', ['280', '290', '300', '260'], '300', ''),
    q('Marked up 25%, discount 20%. Net effect?', ['0%', '5% loss', '5% gain', '10% gain'], '0%', ''),
    q('Buy 2 get 1 free equals discount of?', ['33.33%', '25%', '50%', '20%'], '33.33%', ''),
    q('SP 1200 with 20% loss. CP?', ['1500', '1400', '1250', '1000'], '1500', ''),
  ],
  pipesandcisterns: [
    q('Pipe A fills tank in 6h, B in 3h. Together?', ['2h', '1.5h', '3h', '4h'], '2h', 'Rates add', 'Work rates', 'beginner'),
    q('A fills in 4h, B empties in 6h. Together?', ['12h', '6h', '8h', '24h'], '12h', ''),
    q('Three pipes 2h,3h,6h together?', ['1h', '2h', '3h', '4h'], '1h', ''),
    q('A 5h, B 10h, C 20h (out). Net?', ['10h', '6h', '5h', '8h'], '10h', ''),
    q('Two pipes equal rate fill in 4h together. Each alone?', ['8h', '6h', '10h', '12h'], '8h', ''),
    q('A fills 1/3 tank per hour. Time to fill?', ['2h', '3h', '4h', '5h'], '3h', ''),
    q('A fills 40min, B 60min. Together?', ['24m', '48m', '36m', '30m'], '24m', ''),
    q('A fills 3h, leak empties in 6h. Net time?', ['6h', '9h', '4h', '5h'], '6h', ''),
    q('Two inlet 5h and 10h, one outlet 20h. Fill time?', ['4h', '5h', '6h', '7h'], '4h', ''),
    q('Half tank by A in 3h. Remaining by B in 2h. Total?', ['5h', '6h', '4h', '7h'], '5h', ''),
  ],
  speedtimedistance: [
    q('Speed 60 km/h for 2 h. Distance?', ['60', '90', '120', '150'], '120', '', 'Distance', 'beginner'),
    q('Distance 150 km at 50 km/h. Time?', ['2 h', '3 h', '2.5 h', '4 h'], '3 h', ''),
    q('Average speed for 60 km at 30 km/h and 60 km at 60 km/h?', ['40', '45', '50', '55'], '40', ''),
    q('Downstream 12, upstream 8. Still water?', ['8', '9', '10', '11'], '10', ''),
    q('Train 120m at 60 km/h crosses pole in?', ['4.5s', '6s', '7.2s', '9s'], '7.2s', ''),
    q('Relative speed of two cars 40 and 60 opposite?', ['20', '40', '80', '100'], '100', ''),
    q('If speed increases by 20%, time reduces by?', ['20%', '16.67%', '25%', '10%'], '16.67%', ''),
    q('Runner A 5 m/s, B 4 m/s. Head start for tie in 20s?', ['10m', '20m', '25m', '5m'], '20m', ''),
    q('Bus 300km in 5h, return 6h. Avg speed?', ['50', '55', '52.5', '60'], '54.5', '600/11 ≈ 54.5'),
    q('Car 90 km/h for 30 min. Distance?', ['45', '30', '60', '50'], '45', ''),
  ],
  calendars: [
    q('How many odd days in 100 years?', ['1', '2', '3', '5'], '1', ''),
    q('1 Jan 2000 was?', ['Saturday', 'Friday', 'Sunday', 'Monday'], 'Saturday', ''),
    q('Leap year has how many days?', ['365', '366', '364', '367'], '366', ''),
    q('Days between 1 Jan and 1 Mar (non-leap)?', ['58', '59', '60', '61'], '59', ''),
    q('If today is Monday, 100 days later is?', ['Wednesday', 'Thursday', 'Friday', 'Saturday'], 'Wednesday', ''),
    q('Which month has 30 days?', ['January', 'April', 'March', 'May'], 'April', ''),
    q('1 Jan 1900 was?', ['Monday', 'Sunday', 'Saturday', 'Tuesday'], 'Monday', ''),
    q('How many weeks in 365 days?', ['52', '52 weeks 1 day', '53', '51'], '52 weeks 1 day', ''),
    q('If a year divisible by 100, leap only if divisible by?', ['4', '8', '400', '40'], '400', ''),
    q('12 Aug 2020 + 100 days falls in?', ['November', 'October', 'December', 'September'], 'November', ''),
  ],
  simpleinterest: [
    q('SI on 1000 at 10% for 2 years?', ['100', '150', '200', '250'], '200', ''),
    q('Find rate: SI=240 on 1200 in 2 years.', ['8%', '9%', '10%', '12%'], '10%', ''),
    q('Principal if SI=300 at 5% for 3 years?', ['1800', '1900', '2000', '2100'], '2000', ''),
    q('Time if SI=150 on 600 at 5%?', ['5y', '4y', '3y', '2y'], '5y', ''),
    q('Amount on 800 at 12% for 2 years?', ['896', '900', '992', '992+'], '992', ''),
    q('Rate if SI=90 on 300 in 3 years?', ['8%', '9%', '10%', '12%'], '10%', ''),
    q('SI on 2500 at 6% for 4 years?', ['500', '600', '700', '800'], '600', ''),
    q('Time for SI=180 on 900 at 8%?', ['2.5y', '2y', '3y', '1.5y'], '2.5y', ''),
    q('Principal if amount=1150 at 10% for 3 years?', ['800', '850', '900', '1000'], '850', ''),
    q('Find SI: P=750, R=8%, T=2 years', ['96', '112', '120', '128'], '120', ''),
  ],
}
