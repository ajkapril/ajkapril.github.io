# RSA Practice Lab

An interactive browser-based study tool for learning how RSA encryption and decryption work step by step.

This project is built for a personal GitHub Pages site. It helps users practise the RSA process by choosing small demo values, converting text into number blocks, encrypting each block, and then reversing the process in a separate decryption section.

> **Educational warning:** this project is for learning only. It is not suitable for real security. Real RSA requires secure prime generation, large key sizes, safe padding schemes, and careful cryptographic implementation.

---

## Project goal

The aim of this project is to make RSA easier to understand by showing every stage of the calculation instead of only showing the final encrypted message.

The site should explain:

- how prime numbers `p` and `q` are chosen;
- how `n` and Euler's totient function `φ(n)` are calculated;
- how the public exponent `e` is selected;
- how the private exponent `d` is found;
- how a text message becomes number blocks;
- how each block is encrypted;
- how each encrypted block is decrypted;
- why the private key must normally stay secret.

---

## Features

Current and planned features:

- RSA encryption practice form
- Separate RSA decryption practice form
- Automatic small demo values for `p`, `q`, and `e`
- Manual input fields for custom RSA values
- Step-by-step key generation output
- Text-to-number block conversion explanation
- Block-by-block encryption calculations
- Practice packet output containing encrypted blocks and key values for learning
- Block-by-block decryption calculations
- Recovered plaintext output

---

## Mathematical background

RSA is based on modular arithmetic and the difficulty of factoring a large number `n` into its two prime factors.

### Key generation

Choose two prime numbers:

```text
p and q
```

Calculate:

```text
n = p × q
```

Calculate Euler's totient function:

```text
φ(n) = (p - 1) × (q - 1)
```

Choose a public exponent `e` such that:

```text
1 < e < φ(n)
gcd(e, φ(n)) = 1
```

Find the private exponent `d` such that:

```text
d × e ≡ 1 mod φ(n)
```

The public key is:

```text
(e, n)
```

The private key is:

```text
(d, n)
```

### Encryption

Each message block `m` is encrypted using:

```text
c = m^e mod n
```

where:

| Symbol | Meaning |
|---|---|
| `m` | plaintext number block |
| `e` | public exponent |
| `n` | modulus |
| `c` | encrypted number block |

### Decryption

Each encrypted block `c` is decrypted using:

```text
m = c^d mod n
```

where:

| Symbol | Meaning |
|---|---|
| `c` | encrypted number block |
| `d` | private exponent |
| `n` | modulus |
| `m` | recovered plaintext number block |

---

## Message encoding

The project should convert text into number blocks before encryption.

Important rule:

```text
every plaintext block must be smaller than n
```

If a block is greater than or equal to `n`, RSA encryption will not recover the original block correctly.

---

## File structure

```text
projects/rsa/
├── index.html
├── rsa.css
├── rsa.js
└── README.md
```

Possible later structure if the JavaScript becomes larger:

```text
projects/rsa/
├── index.html
├── rsa.css
├── rsa.js
├── rsa-core.js
├── encoding.js
└── README.md
```

Possible split:

| File | Purpose |
|---|---|
| `index.html` | Page structure and input/output sections |
| `rsa.css` | RSA page styling |
| `rsa.js` | Connects forms, buttons, and page output |
| `rsa-core.js` | For RSA maths functions |
| `encoding.js` | For message-to-block conversion |

---

## Core functions to implement

The main JavaScript logic should eventually include:

```js
function isPrime(n) {}
function gcd(a, b) {}
function modInverse(e, phi) {}
function modPow(base, exponent, modulus) {}
function encodeMessageToBlocks(message, n) {}
function decodeBlocksToMessage(blocks) {}
function encryptBlock(m, e, n) {}
function decryptBlock(c, d, n) {}
```

The most important helper is `modPow`, because RSA uses very large powers.
Avoid calculating `m ** e` directly for anything beyond tiny examples. Use modular exponentiation instead.

---

## Minimum viable version

First:

1. User enters a short message.
2. App uses demo values for `p`, `q`, and `e`.
3. App calculates `n`, `φ(n)`, and `d`.
4. App converts each character into a number block.
5. App encrypts each block with `c = m^e mod n`.
6. App displays the encrypted blocks.
7. App allows the encrypted blocks to be pasted into the decryption section.
8. App decrypts each block with `m = c^d mod n`.
9. App converts the recovered blocks back into text.

Features to add after:

| Stage | Feature | Why it matters |
|---:|---|---|
| 1 | Key generation walkthrough | Shows the RSA setup clearly |
| 2 | Block encoding visualiser | Explains how text becomes numbers |
| 3 | Encryption table | Shows each `m^e mod n` calculation |
| 4 | Decryption table | Shows each `c^d mod n` calculation |
| 5 | Error handling | Prevents invalid primes, bad `e`, and oversised blocks |
| 6 | Practice packet | Lets users move between encryption and decryption sections |
| 7 | Quiz mode | Lets users calculate missing RSA values themselves |
| 8 | Larger-number mode | Uses `BigInt` more |

---

## Security notes

This project intentionally uses small numbers so the maths can be shown clearly.
That makes it useful for education but insecure for real use.

Do not use this project for real encryption because:

- the demo primes are too small;
- the private key is shown on the page;
- the app does not use secure random prime generation;
- the app does not use padding such as OAEP (Optimal Asymmetric Encryption Padding);
- browser-side educational code should not be treated as a cryptographic library.

In real RSA:

| Item | Should it be public? |
|---|---|
| `n` | Yes |
| `e` | Yes |
| encrypted message | Yes |
| `p` | No |
| `q` | No |
| `φ(n)` | No |
| `d` | No |

---

## Future improvements

Possible extensions:

- animated modular exponentiation steps;
- interactive Euclidean algorithm visualiser;
- quiz mode for calculating `n`, `φ(n)`, `e`, and `d`;
- larger `BigInt` examples;
- comparison between valid and invalid RSA parameter choices;
- explanation cards for public-key versus private-key cryptography;
- downloadable practice worksheets;
- multiple example messages with saved history.

---

## Status

This project is currently planned as a static GitHub Pages project using HTML, CSS, and JavaScript.

The first target is a working educational RSA calculator with separate encryption and decryption sections.
