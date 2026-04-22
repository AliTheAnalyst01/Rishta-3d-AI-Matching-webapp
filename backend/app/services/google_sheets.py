import os
import json
from typing import List, Dict, Any, Optional
from google.oauth2 import service_account
from googleapiclient.discovery import build
from app.core.config import settings

SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]


def get_sheets_service():
    """Build Google Sheets API service.
    Supports API key (for public sheets) or service account JSON.
    """
    # API key — simplest, works when sheet is shared publicly
    if settings.GOOGLE_SHEETS_API_KEY:
        return build("sheets", "v4", developerKey=settings.GOOGLE_SHEETS_API_KEY)

    # Service account (base64-encoded JSON)
    if settings.GOOGLE_SHEETS_CREDENTIALS_B64:
        try:
            import base64
            decoded = base64.b64decode(settings.GOOGLE_SHEETS_CREDENTIALS_B64).decode("utf-8")
            creds_info = json.loads(decoded)
            creds = service_account.Credentials.from_service_account_info(
                creds_info, scopes=SCOPES
            )
            return build("sheets", "v4", credentials=creds)
        except Exception as e:
            print(f"Failed to decode service account credentials: {e}")

    # Service account from file
    if os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"):
        creds = service_account.Credentials.from_service_account_file(
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"], scopes=SCOPES
        )
        return build("sheets", "v4", credentials=creds)

    raise ValueError("No Google Sheets credentials configured. Set GOOGLE_SHEETS_API_KEY or GOOGLE_SHEETS_CREDENTIALS_B64.")


def read_sheet_range(spreadsheet_id: str, range_name: str) -> List[List[Any]]:
    """Read a specific range from the spreadsheet."""
    service = get_sheets_service()
    result = (
        service.spreadsheets()
        .values()
        .get(spreadsheetId=spreadsheet_id, range=range_name)
        .execute()
    )
    return result.get("values", [])


def extract_data_sheet() -> List[Dict[str, Any]]:
    """
    Extract structured profiles from the 'Data' sheet.
    Returns list of dicts keyed by column headers.
    Columns: Timestamp, Registration No., Gender, Name, Sect, Marital Status, Caste,
    Date of Birth, Height, Weight, Body Type, Complexion, Education, Profession,
    Income, Family Status, Father/Mother Profession, Siblings, Address, City & Country,
    Demand/Requirements, Photo URL, Age, Raw Text
    """
    rows = read_sheet_range(settings.SPREADSHEET_ID, "Data!A1:Y")

    if not rows:
        return []

    header = rows[0]
    profiles = []

    for row in rows[1:]:
        # Pad row to match header length
        row = row + [""] * (len(header) - len(row))
        profile = {header[i]: row[i] for i in range(len(header))}
        profiles.append(profile)

    return profiles


def extract_categorised_sheets() -> List[Dict[str, Any]]:
    """
    Extract and merge all category-specific sheets.
    Sheet layout is side-by-side blocks of 3 columns: Reg# | Profile_blob | Photo
    First block: cols A(0), B(1), C(2)  — second block: cols E(4), F(5), G(6)
    """
    sheets_to_read = [
        "Male Rishta",
        "Female Rishta",
        "Syed Male Rishta",
        "Syed Female Rishta",
        "Non Syed Male Rishta",
        "Non Syed Female Rishta",
        "Doctors Proposal",
        "2nd Marriage Proposal",
        "Shia 2nd Marriage Proposal",
        "Sunni 2nd Marriage Proposal",
    ]

    # Each block: (reg_no_col, blob_col, photo_col)
    BLOCKS = [(0, 1, 2), (4, 5, 6)]

    all_raw = []
    service = get_sheets_service()

    for sheet_name in sheets_to_read:
        try:
            result = (
                service.spreadsheets()
                .values()
                .get(spreadsheetId=settings.SPREADSHEET_ID, range=f"{sheet_name}!A1:G")
                .execute()
            )
            values = result.get("values", [])
            if not values:
                continue

            for row in values[1:]:
                for reg_col, blob_col, photo_col in BLOCKS:
                    if len(row) <= blob_col:
                        continue
                    raw_text = str(row[blob_col]).strip()
                    if not raw_text:
                        continue
                    reg_no = str(row[reg_col]).strip() if len(row) > reg_col else ""
                    photo_url = str(row[photo_col]).strip() if len(row) > photo_col else ""
                    all_raw.append({
                        "raw_text": raw_text,
                        "reg_no_hint": reg_no,
                        "photo_url_hint": photo_url,
                        "source_sheet": sheet_name,
                    })
        except Exception as e:
            print(f"Error reading {sheet_name}: {e}")
            continue

    return all_raw
