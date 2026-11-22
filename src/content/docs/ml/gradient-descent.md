---
title: Gradient Descent
description: Understanding gradient descent mathematically and through Python.
---

# Gradient Descent

Gradient descent is an optimization algorithm used to minimize
a loss function.

## 1. Mathematical Foundation

The objective is to minimize:

$$
J(\theta) = \frac{1}{2m}
\sum_{i=1}^{m}(h_\theta(x_i)-y_i)^2
$$

The parameter update rule is:

$$
\theta := \theta -
\alpha \frac{\partial J(\theta)}{\partial \theta}
$$

Where:

- $\theta$ = Model parameters
- $\alpha$ = Learning rate
- $J(\theta)$ = Cost function

## 2. Python Implementation

```python title="gradient_descent.py"
import numpy as np

def gradient_descent(x, y, learning_rate=0.01, epochs=1000):
    m = len(x)
    theta = 0.0

    for _ in range(epochs):
        predictions = theta * x
        gradient = (1 / m) * np.sum(
            (predictions - y) * x
        )
        theta -= learning_rate * gradient

    return theta
```

## 3. Complexity

The algorithm's complexity for one
parameter update is:

$$
O(m \cdot n)
$$

where m is the number of samples and n
is the number of parameters.
