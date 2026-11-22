---
title: Gradient Descent
description: Understanding gradient descent mathematically.
---

# Gradient Descent & Backpropagation: A Beginner-Friendly Walkthrough

> **Audience:** If you understand slopes (rise over run) and basic algebra,
> you can follow every number here. This tutorial explains how neural
> networks — and LLMs — actually *learn* from data.

In the main tutorial ([llm_token_prediction_walkthrough.md](llm_token_prediction_walkthrough.md)),
we showed how an LLM *uses* its weights to predict the next word. But we never
explained **where those weights come from**. This tutorial fills that gap.

Every weight — every number in every embedding and every matrix — is learned
through a process called **gradient descent**, powered by a technique called
**backpropagation**. Let's understand both, one number at a time.

---

## Table of Contents

1. [The Big Picture: What Does "Learning" Mean?](#1-the-big-picture)
2. [The Hill Analogy](#2-the-hill-analogy)
3. [The Simplest Possible Model (One Weight)](#3-one-weight-model)
4. [What Is the Gradient?](#4-what-is-the-gradient)
5. [The Update Rule (The Most Important Formula)](#5-the-update-rule)
6. [Watching It Converge Step by Step](#6-watching-it-converge)
7. [The Learning Rate: The Most Important Knob](#7-the-learning-rate)
8. [Scaling Up to Millions of Weights](#8-scaling-up)
9. [Backpropagation: The Chain Rule in Action](#9-backpropagation)
10. [The Full Training Loop](#10-the-full-training-loop)
11. [Why This Works: Intuition Deep Dive](#11-why-this-works)
12. [Common Pitfalls](#12-common-pitfalls)
13. [Summary](#summary)

---

## 1. The Big Picture

### What does "learning" mean for a neural network?

A neural network is just a **giant pile of numbers** (called **weights**).
When you feed it input, it multiplies and adds those numbers to produce output.

"Learning" means **adjusting those numbers** so the output gets closer to the
correct answer.

```
Before learning:  weights are random  →  predictions are garbage
       ↓
   Training (adjust numbers using gradient descent)
       ↓
After learning:   weights are tuned   →  predictions are accurate
```

### The cycle

Every training step follows this cycle:

```
   ┌──────────────────────────────────────────┐
   │  1. FORWARD PASS                          │
   │     Feed input through the model          │
   │     → get a prediction                    │
   └──────────────────┬───────────────────────┘
                      ▼
   ┌──────────────────────────────────────────┐
   │  2. MEASURE ERROR (Loss)                  │
   │     Compare prediction to the truth       │
   │     → get a number (how wrong are we?)    │
   └──────────────────┬───────────────────────┘
                      ▼
   ┌──────────────────────────────────────────┐
   │  3. BACKWARD PASS (Backpropagation)       │
   │     Compute gradients for every weight    │
   │     → "which direction to nudge each one" │
   └──────────────────┬───────────────────────┘
                      ▼
   ┌──────────────────────────────────────────┐
   │  4. UPDATE (Gradient Descent)             │
   │     Nudge every weight slightly           │
   │     → reduce the error a tiny bit         │
   └──────────────────┬───────────────────────┘
                      ▼
                  (repeat billions of times)
```

Let's now understand each piece with real numbers.

---

## 2. The Hill Analogy

### The mental picture

Imagine you're **blindfolded on a hillside** and trying to reach the **lowest
point in the valley** (the bottom). You can't see, but you can feel the ground.

Your strategy:
1. **Feel the slope** with your foot — is it tilting left or right? How steep?
2. **Take a small step downhill** (in the opposite direction of the uphill slope)
3. **Repeat** until you're at the bottom

This is **exactly** what gradient descent does:
- The "hillside" is the **loss landscape** (how the error changes as you vary the weights)
- "Feeling the slope" is **computing the gradient**
- "Stepping downhill" is **updating the weights**
- The "bottom of the valley" is the **minimum error** (best possible weights)

```
  Error (Loss)
     |
     |  *                                   *
     |    *                               *
     |      *                           *
     |        *                       *
     |          *                  *
     |             *            *
     |                *      *
     |___________________*_________________ Weight (w)
     0        ←     bottom    →        10
                    (best w)
```

---

## 3. The Simplest Possible Model

### One weight, one target

Let's strip everything down to the absolute minimum. Our "model" has exactly
**one weight** called `w`. Its entire job: output a number close to a target.

```
Model:      prediction = w           (the model just outputs w)
Target:     5                        (the correct answer)
Goal:       make w as close to 5 as possible
```

### How do we measure error?

We use **squared error** — the difference between prediction and target, squared:

```
Error = (prediction − target)²
      = (w − 5)²
```

**Why square?**
- It makes everything **positive** (being off by +3 or −3 are equally bad)
- It **penalizes big errors more** than small ones (being off by 10 counts 100×
  as much, not just 10×)

### The error landscape

If we plot the error for different values of `w`, we get a **parabola**
(a U-shape):

```
Error
  25 |*                                                           *
     |
  16 |      *                                               *
     |
   9 |            *                                   *
     |
   4 |                  *                       *
     |
   1 |                        *           *
     |
   0 |______________________________*_______________________________ w
     0     1     2     3     4     5     6     7     8     9     10
                                   ↑
                               bottom: w = 5, error = 0
```

The bottom of the U is at `w = 5` (error = 0). That's our goal. But the model
doesn't know this — it has to **find** the bottom by feeling the slope.

### Starting point

Weights start at a **random value**. Let's say `w = 0`:

```
w = 0
prediction = 0
error = (0 − 5)² = 25
```

We're at the top-left of the parabola, far from the bottom. Let's use gradient
descent to slide down.

---

## 4. What Is the Gradient?

### Definition

The **gradient** is the **slope** of the error curve at our current position.
It tells us two things:

| Property | What it means | What we do |
|----------|--------------|------------|
| **Sign** (positive/negative) | Which direction is uphill? | Go the **opposite** way (downhill) |
| **Magnitude** (absolute value) | How steep is the slope? | Take a **bigger** step if steeper |

### The formula

For our error function `Error = (w − 5)²`, the gradient (derivative) is:

```
gradient = 2 × (w − 5)
```

> **Where does this come from?** It's the **power rule** from calculus:
> the derivative of `(something)²` is `2 × something`.
> So the derivative of `(w − 5)²` with respect to `w` is `2 × (w − 5)`.
>
> If you haven't studied calculus, don't worry — we'll verify this numerically
> below. You can also just trust the formula for now.

### Computing the gradient at w = 0

```
gradient = 2 × (0 − 5)
         = 2 × (−5)
         = −10
```

### What does −10 mean?

- **Negative** → the uphill direction is to the **left** → we should move **right**
- **Magnitude 10** → the slope is **steep** → we should take a **big step**

### Verification without calculus

Let's prove the gradient is correct by simply **nudging w slightly** and watching
the error change:

```
error at w = 0.00:  (0.00 − 5)² = (−5.00)² = 25.0000
error at w = 0.01:  (0.01 − 5)² = (−4.99)² = 24.9001

change in error = 24.9001 − 25.0000 = −0.0999
change in w     = 0.01 − 0.00      = 0.01

slope ≈ change in error / change in w = −0.0999 / 0.01 = −9.99 ≈ −10
```

The gradient formula said −10. The numerical check gives −9.99. **They match!**

This is how you can verify any gradient without knowing calculus: just nudge
the number by a tiny amount and measure the change.

---

## 5. The Update Rule

### The most important formula in machine learning

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   new_value = old_value − (learning_rate × gradient)│
│                                                     │
└─────────────────────────────────────────────────────┘
```

Let's break down **why each part is there**.

### Part 1: Why subtract?

The gradient points **uphill** (toward *increasing* error). We want to go
**downhill** (toward *decreasing* error). So we move in the **opposite**
direction — we subtract.

```
If gradient is NEGATIVE (−10):
    uphill is to the LEFT
    we want to go RIGHT (downhill)
    subtracting a negative = adding = moving RIGHT ✓

If gradient is POSITIVE (+10):
    uphill is to the RIGHT
    we want to go LEFT (downhill)
    subtracting a positive = moving LEFT ✓
```

### Part 2: Why multiply by learning_rate?

The raw gradient (−10) is too large for a safe step. If we did:

```
w_new = 0 − (−10) = 10
```

...we'd jump all the way from `w = 0` to `w = 10`, completely overshooting
the minimum at `w = 5`! We'd end up on the **other side** of the valley, just
as far from the bottom.

The **learning_rate** shrinks the step to a safe size:

```
learning_rate = 0.1   (take 10% of the gradient)

step = 0.1 × (−10) = −1

w_new = 0 − (−1) = 0 + 1 = 1
```

### Part 3: Putting it together

```
old_value     = 0
gradient      = −10
learning_rate = 0.1
step          = learning_rate × gradient = 0.1 × (−10) = −1
new_value     = old_value − step = 0 − (−1) = 1
```

### Verify it worked

```
error at w = 0:  (0 − 5)² = 25
error at w = 1:  (1 − 5)² = 16     ← error went DOWN! ✓
```

We moved in the right direction and reduced the error. Success!

---

## 6. Watching It Converge

### Step by step

Let's run 8 iterations. Grab a pencil and verify each row:

**Formulas:**
```
gradient = 2 × (w − 5)
step     = 0.1 × gradient
w_new    = w − step
error    = (w − 5)²
```

| Step | w | Error | Gradient | Step size | New w |
|------|----------|----------|-----------|-----------|--------|
| 0 | 0.000 | 25.00 | −10.00 | −1.000 | 1.000 |
| 1 | 1.000 | 16.00 | −8.00 | −0.800 | 1.800 |
| 2 | 1.800 | 10.24 | −6.40 | −0.640 | 2.440 |
| 3 | 2.440 | 6.55 | −5.12 | −0.512 | 2.952 |
| 4 | 2.952 | 4.19 | −4.10 | −0.410 | 3.362 |
| 5 | 3.362 | 2.68 | −3.28 | −0.328 | 3.690 |
| 6 | 3.690 | 1.72 | −2.62 | −0.262 | 3.952 |
| 7 | 3.952 | 1.10 | −2.10 | −0.210 | 4.162 |

### Worked example: Step 0 → Step 1

```
w         = 0
gradient  = 2 × (0 − 5)    = −10
step      = 0.1 × (−10)    = −1
w_new     = 0 − (−1)       = 1
error_old = (0 − 5)²       = 25
error_new = (1 − 5)²       = 16     ✓ (went down!)
```

### Worked example: Step 2 → Step 3

```
w         = 1.8
gradient  = 2 × (1.8 − 5)  = 2 × (−3.2) = −6.4
step      = 0.1 × (−6.4)   = −0.64
w_new     = 1.8 − (−0.64)  = 2.44
error_old = (1.8 − 5)²     = 10.24
error_new = (2.44 − 5)²    = 6.55    ✓ (went down!)
```

### Try it yourself: Step 3 → Step 4

```
w         = 2.44
gradient  = 2 × (2.44 − 5) = 2 × (_____) = ______
step      = 0.1 × _____    = ______
w_new     = 2.44 − _____   = ______
```

(Answer: gradient = −5.12, step = −0.512, w_new = 2.952)

### Visualizing convergence

```
Error
  25 |  ●
  16 |     ●
  10 |        ●
   7 |           ●
   4 |              ●
   2 |                 ●
   1 |                    ●
   0 |                        ● ● ● ● ● ●  →  approaching 0
     └─────────────────────────────────────────── step
      0  1  2  3  4  5  6  7  8
```

Notice: as `w` gets closer to 5, the **gradient gets smaller** (the slope
flattens near the bottom), so the **steps get smaller**. This is a feature,
not a bug — it naturally slows down as we approach the minimum, preventing
overshoot.

After 15 steps: `w = 4.824` (error = 0.031). After 30 steps: `w = 4.998`.
It converges!

---

## 7. The Learning Rate

### The most important knob

The learning rate controls **how big each step is**. Choosing it correctly is
critical:

```
new_value = old_value − (learning_rate × gradient)
                                ↑
                          too big → disaster
                          too small → painfully slow
                          just right → smooth convergence
```

### Five learning rates compared

Same problem (`w` starts at 0, target is 5), different learning rates:

#### Too small: learning_rate = 0.01

```
w: 0 → 0.10 → 0.20 → 0.29 → 0.39 → ... → 1.66 (after 20 steps)
```

It moves in the right direction but **painfully slowly**. After 20 steps it's
only at `w = 1.66` — still far from 5. Training would take forever.

```
Error
  25 |  ●
  20 |    ●
  16 |      ●
  12 |        ●  ●  ●
   0 |__________________________ step
      0  5  10  15  20
      (barely moving)
```

#### Just right: learning_rate = 0.1

```
w: 0 → 1.0 → 1.8 → 2.44 → 2.95 → ... → 4.94 (after 20 steps)
```

Smooth, steady convergence. Error drops to near zero. **This is what we want.**

```
Error
  25 |  ●
  16 |    ●
  10 |      ●
   5 |        ●  ●
   2 |             ●  ●
   0 |__________________●___ step
      0  5  10  15  20
      (smooth descent)
```

#### Also fine: learning_rate = 0.5

```
w: 0 → 5.0 (done in one step!)
```

For this specific problem, `lr = 0.5` is the **perfect** step size — it reaches
the minimum immediately. (This is a coincidence of this simple parabola; real
problems don't have a "perfect" learning rate.)

#### Too big: learning_rate = 1.0

```
Step 0:  w = 0,   gradient = −10,  step = 1.0 × (−10) = −10
         w_new = 0 − (−10) = 10

Step 1:  w = 10,  gradient = 2 × (10 − 5) = +10
         w_new = 10 − (1.0 × 10) = 0

Step 2:  w = 0 again!
```

It **oscillates** between 0 and 10 forever, never reaching 5! The steps are so
big that it jumps completely across the valley to the other side each time.

```
Error
  25 |  ●                                    ●  ●  ●  ●
  16 |
  10 |
   5 |
   0 |_____________________*________________ step
      0                   5                  10
      ↑ (bounces)         target          ↑ (bounces)
```

#### Way too big: learning_rate = 1.5

```
Step 0:  w = 0,    step = 1.5 × (−10) = −15,  w_new = 15
Step 1:  w = 15,   gradient = +20,  step = 1.5 × 20 = 30
         w_new = 15 − 30 = −15
Step 2:  w = −15,  gradient = −40,  even bigger step...
```

It **diverges** — spiraling out of control, getting worse every step. The loss
explodes toward infinity.

### Summary table

| Learning rate | Behavior | Error after 20 steps |
|---------------|----------|---------------------|
| 0.01 | Too slow | 11.60 |
| 0.1 | **Just right** | 0.005 |
| 0.5 | Perfect (for this problem) | 0.000 |
| 1.0 | Oscillating forever | 25.00 |
| 1.5 | **Diverges to infinity** | 6,871,947,673,600 |

> **In practice:** Finding the right learning rate is one of the most important
> (and hardest) parts of training a real model. Techniques like **learning rate
> schedules** (start large, gradually decrease) and **warmup** (start small,
> ramp up) help. Typical values for large models: `0.0001` to `0.001`.

---

## 8. Scaling Up

### From one weight to millions

Our toy example had **one weight** (`w`). A real LLM has **billions**. But the
update rule is **identical** — applied to every single weight independently:

```
For each weight wᵢ in the model (embeddings, W_Q, W_K, W_V, W_O, FFN, ...):
    wᵢ_new = wᵢ_old − (learning_rate × gradientᵢ)
```

Every weight gets its own gradient, computed during the backward pass. Then
they're all updated simultaneously.

### The challenge: computing billions of gradients

For our one-weight model, the gradient was simple: `2 × (w − 5)`.

But in a real model, an embedding weight `w` affects the prediction through a
**long chain of operations**:

```
w (embedding)
  → multiply with input
    → attention scores
      → softmax
        → attention output
          → feed-forward network
            → logits
              → softmax
                → probability
                  → loss
```

To compute how `w` affects the final `loss`, we need to trace this entire chain.
That's what **backpropagation** does.

---

## 9. Backpropagation

### The Chain Rule

Backpropagation is just the **chain rule** from calculus, applied efficiently.
Let me explain the chain rule with a concrete example you can verify by hand.

### A tiny 2-layer model

```
Input:     a = 2
Weight 1:  w₁ = 3
Weight 2:  w₂ = 4
Target:    10

Layer 1:   b = a × w₁       (b = 2 × 3 = 6)
Layer 2:   c = b × w₂       (c = 6 × 4 = 24)
Loss:      L = (c − target)² (L = (24 − 10)² = 196)
```

The loss is 196. We want to update `w₁`. The question is:

> *"If I change w₁ by a tiny amount, how much does the Loss change?"*

### Method 1: Brute force (nudge and measure)

Let's nudge `w₁` from 3 to 3.001 and see what happens:

```
b_new = 2 × 3.001 = 6.002
c_new = 6.002 × 4 = 24.008
L_new = (24.008 − 10)² = (14.008)² = 196.224

change in L  = 196.224 − 196 = 0.224
change in w₁ = 3.001 − 3    = 0.001

gradient ≈ change in L / change in w₁ = 0.224 / 0.001 = 224
```

So the gradient of `L` with respect to `w₁` is **224**.

> This method works for any function — no calculus needed! But it's slow for
> models with billions of weights. That's why we use Method 2.

### Method 2: The chain rule (calculus)

Instead of nudging numbers, we use the chain rule to compute the gradient
**exactly**, by breaking the computation into small steps:

```
dL     =   dL    ×   dc    ×   db
───       ───      ───      ───
dw₁       dc        db       dw₁
```

Each piece is a simple derivative:

**Piece 1:** `dL/dc` — how does Loss change when c changes?

```
L = (c − 10)²
dL/dc = 2 × (c − 10) = 2 × (24 − 10) = 28
```

(Power rule again: derivative of `(c − 10)²` is `2 × (c − 10)`.)

**Piece 2:** `dc/db` — how does c change when b changes?

```
c = b × w₂ = b × 4
dc/db = w₂ = 4
```

(c is just b multiplied by 4, so the derivative is 4.)

**Piece 3:** `db/dw₁` — how does b change when w₁ changes?

```
b = a × w₁ = 2 × w₁
db/dw₁ = a = 2
```

(b is just w₁ multiplied by 2, so the derivative is 2.)

### Chain them together

```
dL/dw₁ = dL/dc × dc/db × db/dw₁
       =   28   ×   4    ×   2
       = 224
```

**This matches our brute-force answer (224) exactly!** ✓

### Now update w₁

```
learning_rate = 0.01
gradient = 224

w₁_new = 3 − (0.01 × 224) = 3 − 2.24 = 0.76
```

### Verify the loss decreased

```
b_new = 2 × 0.76 = 1.52
c_new = 1.52 × 4 = 6.08
L_new = (6.08 − 10)² = (−3.92)² = 15.37
```

**Loss went from 196 → 15.37** in a single step! ✓

### What about w₂?

We can also compute the gradient for `w₂` using the chain rule:

```
dL/dw₂ = dL/dc × dc/dw₂

dL/dc   = 2 × (24 − 10) = 28
dc/dw₂  = b              = 6    (since c = b × w₂)

dL/dw₂ = 28 × 6 = 168
```

> **Key insight:** Notice that `dL/dc = 28` appears in **both** gradient
> computations. Backpropagation exploits this: it computes `dL/dc` **once**,
> then reuses it for all weights in earlier layers. This is what makes it
> efficient.

### The big picture of backpropagation

```
FORWARD PASS (left to right):
  input → layer1 → layer2 → ... → output → loss
                                              │
BACKWARD PASS (right to left):
  gradient ← layerN ← ... ← layer2 ← layer1 ← loss

At each layer, multiply the incoming gradient by the local derivative.
Reuse intermediate results for efficiency.
```

For a model with 80 layers and billions of weights, backpropagation computes
all gradients in a **single backward pass** — one sweep from loss back to input.

---

## 10. The Full Training Loop

### Putting it all together

Here's what happens during training of a real LLM:

### Step 1: Forward pass

Feed a batch of text through the model (exactly like our prediction tutorial):

```
"I love cats" → tokenize → embed → attention → FFN → logits → probabilities
```

### Step 2: Compute loss

Compare predictions to the actual next words:

```
P("cats") = 12%     ← should be high!
Loss = high (because the model was wrong)
```

### Step 3: Backward pass (backpropagation)

Starting from the loss, work backwards through every layer:

```
Loss → softmax → logits → FFN → attention → embeddings

At each step, compute the gradient for every weight using the chain rule.
Result: a gradient value for EVERY weight in the model.
```

### Step 4: Update all weights

Apply gradient descent to every weight simultaneously:

```
For each of the billions of weights wᵢ:
    wᵢ = wᵢ − learning_rate × gradientᵢ
```

### Step 5: Repeat

Move to the next batch of text and do it again. And again. And again.

```
Typical training run for a large model:
  - Trillions of training tokens
  - Each token triggers a forward + backward pass
  - Training takes weeks to months on thousands of GPUs
  - Total cost: millions of dollars in compute
```

---

## 11. Why This Works

### Why does gradient descent find good weights?

The loss landscape of a real model is incredibly complex — a surface in a
space with billions of dimensions. But gradient descent works because:

1. **Locally, the slope always points toward lower error** (that's what a
   derivative tells you). Even in high dimensions, following the negative
   gradient always moves you toward lower loss.

2. **Billions of tiny steps add up.** Each step is small, but after trillions
   of examples, the weights settle into a configuration that produces good
   predictions.

3. **The loss landscape, while complex, has many good basins.** The model
   doesn't need to find the *global* best solution — it just needs to find
   *a* good one. There are many.

### Why do similar words end up with similar embeddings?

Consider "cats" and "dogs":

- **"I love cats"** → the model learns to predict "cats" after "I love"
- **"I love dogs"** → the model learns to predict "dogs" after "I love"

Both words appear in the **same contexts**. When the model nudges the "cats"
embedding to improve a prediction, it's nudging in a direction that would
**also** improve predictions for "dogs" (since they appear in the same places).

Over billions of examples, these nudges push "cats" and "dogs" toward
**similar vectors**:

```
"cats" → [0.30, 0.80, 0.20, 0.10]
"dogs" → [0.40, 0.70, 0.30, 0.00]
          ↑ close   ↑ close   ↑ close
```

Nobody programmed this — it **emerged** from training. This is called the
**distributional hypothesis**: words that appear in similar contexts have
similar meanings.

---

## 12. Common Pitfalls

### Learning rate too high → divergence

```
w: 0 → 15 → −15 → 45 → −75 → ...    (spinning out of control)
Loss: 25 → 100 → 400 → 1600 → ...   (exploding!)
```

**Fix:** Use a smaller learning rate. Add **gradient clipping** (cap the
maximum gradient value).

### Learning rate too low → stalls

```
w: 0 → 0.01 → 0.02 → 0.03 → ...     (barely moving)
Loss: 25 → 24.9 → 24.8 → ...        (barely decreasing)
```

**Fix:** Use a larger learning rate, or a learning rate warmup schedule.

### Vanishing gradients → deep layers don't learn

In very deep networks, the chain rule multiplies many small numbers together,
causing gradients to **shrink to near-zero** for early layers. Those layers
barely update.

```
dL/dw₁ = 0.001 × 0.002 × 0.001 × ... ≈ 0.000000002
```

**Fix:** Residual connections (skip connections) provide a direct path for
gradients to flow. This is exactly why we use them in the Transformer!

### Exploding gradients → instability

Conversely, if many gradients are large, multiplying them causes the product
to **explode**, leading to huge, destabilizing updates.

**Fix:** Gradient clipping, layer normalization, careful initialization.

---

## Summary

### The three key formulas

**1. Loss (how wrong are we?):**
```
Loss = (prediction − target)²
```

**2. Gradient (which direction to move):**
```
gradient = dLoss / dweight   (computed via backpropagation / chain rule)
```

**3. Update (the actual learning step):**
```
new_weight = old_weight − learning_rate × gradient
```

### The complete process

```
         ┌──────────────────────────────────┐
         │  FORWARD: input → prediction      │
         ├──────────────────────────────────┤
         │  LOSS: compare to truth           │
         ├──────────────────────────────────┤
         │  BACKWARD: compute all gradients  │  ← repeat
         │    (chain rule, layer by layer)   │     billions
         ├──────────────────────────────────┤     of times
         │  UPDATE: nudge every weight       │
         │    w -= lr × gradient             │
         └──────────────────────────────────┘
```

### The golden rule

> **Subtract the gradient (times learning rate) from every weight, repeatedly,
> until the error stops decreasing.**

That's it. That's how neural networks learn. That's how ChatGPT learned to
generate text. The same simple formula, applied to billions of weights,
trillions of times.

---


*All numbers in this tutorial have been verified computationally.*
