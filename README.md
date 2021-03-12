# Scical - Scientific Calculation with significant figures

With the ScientificNumber data type, all arithmetic operations are performed correctly according to the rules for significant figures.

```
0.000 + 0.0 = 0.0
2.3782 + 3 = 5
0.4 + 4.0 = 4.4
123 - 0.9 = 122
1.4 * 2 = 3
```

One challenge here is that rounding is done only at the end. If we were to round after each arithmetic operation it can produce wrong results like: `1 + 1.3 + 1.3 = 3`. Correct would be: `1 + 1.3 + 1.3 = 4`. 
