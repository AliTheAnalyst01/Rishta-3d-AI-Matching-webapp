#!/usr/bin/env python3
"""
Helper script to encode Google Service Account credentials for environment variable.

Usage:
  python scripts/encode_credentials.py path/to/service-account.json
  # Outputs base64 string to copy into .env
"""

import base64
import sys
import pathlib


def encode_file(filepath: str) -> str:
    with open(filepath, "rb") as f:
        data = f.read()
    encoded = base64.b64encode(data).decode("utf-8")
    return encoded


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    filepath = sys.argv[1]
    if not pathlib.Path(filepath).exists():
        print(f"Error: file not found: {filepath}")
        sys.exit(1)

    encoded = encode_file(filepath)
    print("\n--- COPY THIS INTO YOUR .env ---\n")
    print(f"GOOGLE_SHEETS_CREDENTIALS_B64={encoded}\n")
