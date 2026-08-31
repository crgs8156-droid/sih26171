import numpy as np


def generate_bpsk(
    fs: float, baud: float, n_bits: int, snr_db: float | None = None
) -> np.ndarray:
    sps = int(round(fs / baud))
    if sps < 1:
        raise ValueError("baud must be lower than fs")
    bits = np.random.randint(0, 2, n_bits)
    symbols = 2.0 * bits - 1.0
    samples = np.repeat(symbols, sps).astype(np.complex128)
    if snr_db is not None:
        power = float(np.mean(np.abs(samples) ** 2))
        noise_std = np.sqrt(power / (10 ** (snr_db / 10) * 2))
        samples += noise_std * (
            np.random.randn(samples.size) + 1j * np.random.randn(samples.size)
        )
    return samples
