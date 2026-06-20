#!/usr/bin/env python3
"""Generate Keith-Weston-Resume.pdf from the HTML source."""

from __future__ import annotations

import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from pypdf import PdfReader, PdfWriter

ROOT = Path(__file__).resolve().parent
HTML_FILE = ROOT / "Keith-Weston-Resume.html"
PDF_FILE = ROOT / "Keith-Weston-Resume.pdf"

CHROME_CANDIDATES = (
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
)

PDF_METADATA = {
    "/Title": "Keith Weston – Lead UX Designer Resume",
    "/Author": "Keith Weston",
    "/Subject": "Resume – Lead UX Designer",
    "/Keywords": "UX Design, Design Systems, Mobile UX, Platform UX, Keith Weston",
}


def find_chrome() -> Path:
    for candidate in CHROME_CANDIDATES:
        path = Path(candidate)
        if path.is_file():
            return path
    chrome = shutil.which("google-chrome") or shutil.which("chromium")
    if chrome:
        return Path(chrome)
    raise RuntimeError(
        "Could not find Chrome/Chromium. Install Google Chrome or add it to PATH."
    )


def export_pdf(chrome: Path) -> None:
    html_url = HTML_FILE.resolve().as_uri()
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp_path = Path(tmp.name)

    try:
        result = subprocess.run(
            [
                str(chrome),
                "--headless=new",
                "--disable-gpu",
                "--no-pdf-header-footer",
                f"--print-to-pdf={tmp_path}",
                html_url,
            ],
            capture_output=True,
            text=True,
            check=False,
        )
        if result.returncode != 0 or not tmp_path.is_file():
            raise RuntimeError(
                "Chrome failed to export PDF.\n"
                f"stdout: {result.stdout.strip()}\n"
                f"stderr: {result.stderr.strip()}"
            )

        reader = PdfReader(str(tmp_path))
        writer = PdfWriter(clone_from=reader)
        writer.add_metadata(PDF_METADATA)
        with PDF_FILE.open("wb") as output:
            writer.write(output)
    finally:
        tmp_path.unlink(missing_ok=True)


def main() -> None:
    chrome = find_chrome()
    export_pdf(chrome)
    print(f"Wrote {PDF_FILE.name}")


if __name__ == "__main__":
    try:
        main()
    except RuntimeError as error:
        print(error, file=sys.stderr)
        sys.exit(1)
