# signal

SIH 26147 DSP core. Ground-truth synthetic signals are the test suite, training
data, and demo material in one.

- `generator.py` — synthetic signal generators (BPSK seeded; FSK/QAM/PSK family
  lands in P1).
- Planned: `io.py` (.wav/.iq format heuristics), `features.py` (cumulants,
  cyclostationary), `demod/`, `fec/`, `gui/`.
