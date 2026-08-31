import numpy as np

from generator import generate_bpsk


def test_bpsk_length_and_dtype():
    samples = generate_bpsk(fs=1000, baud=100, n_bits=50)
    assert samples.size == 500
    assert np.iscomplexobj(samples)


def test_bpsk_values_bipolar():
    samples = generate_bpsk(fs=1000, baud=100, n_bits=100)
    assert set(np.unique(samples.real)) <= {-1.0, 1.0}


def test_bpsk_noise_degrades_constancy():
    clean = generate_bpsk(fs=1000, baud=100, n_bits=2000)
    noisy = generate_bpsk(fs=1000, baud=100, n_bits=2000, snr_db=0)
    assert np.std(np.abs(noisy)) > np.std(np.abs(clean))


def test_bpsk_rejects_baud_above_fs():
    try:
        generate_bpsk(fs=100, baud=200, n_bits=10)
    except ValueError:
        pass
    else:
        raise AssertionError("expected ValueError")
