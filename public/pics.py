import os
import csv
import re
import requests
from urllib.parse import urlparse, parse_qs

import pandas as pd
from slugify import slugify

# ================== CONFIG ==================

# The CSV you exported from Google Sheets (the newest one you uploaded)
INPUT_CSV = "Bracelet Content - Sheet1.csv"

# New CSV that will be generated with updated image URLs
OUTPUT_CSV = "bracelet_content_migrated.csv"

# Column names from your sheet
IMAGE_COLUMN_NAME = "Image or Video"
TITLE_COLUMN_NAME = "Title/Headline (if applicable)"

# Local folder where images will be downloaded
OUTPUT_IMAGE_FOLDER = "output_images"

# Public base URL where images will live after you upload them to GitHub
# They will be served from: https://tap.footforwardfund.org/story-images/<filename>
SITE_IMAGE_BASE_URL = "https://tap.footforwardfund.org/story-images"

# ============================================


def ensure_folder(path: str):
    if not os.path.exists(path):
        os.makedirs(path)


def extract_drive_file_id(url: str):
    if "drive.google.com" not in url:
        return None

    m = re.search(r"/file/d/([^/]+)/", url)
    if m:
        return m.group(1)

    parsed = urlparse(url)
    qs = parse_qs(parsed.query)
    if "id" in qs:
        return qs["id"][0]

    return None


def build_drive_download_url(file_id: str):
    return f"https://drive.google.com/uc?export=download&id={file_id}"


def guess_extension_from_headers(headers, default=".jpg"):
    content_type = headers.get("Content-Type", "").lower()
    if "png" in content_type:
        return ".png"
    if "jpeg" in content_type or "jpg" in content_type:
        return ".jpg"
    if "gif" in content_type:
        return ".gif"
    if "webp" in content_type:
        return ".webp"
    return default


def download_image(url: str, dest_path: str):
    print(f"Downloading: {url}")

    file_id = extract_drive_file_id(url)
    if file_id:
        url = build_drive_download_url(file_id)

    try:
        with requests.get(url, stream=True, timeout=20) as r:
            r.raise_for_status()

            content_type = r.headers.get("Content-Type", "").lower()

            if "text/html" in content_type:
                print(f"  ⚠️ HTML response (blocked or preview) for: {url}")
                return False

            with open(dest_path, "wb") as f:
                for chunk in r.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)

        print(f"  ✅ Saved: {dest_path}")
        return True

    except Exception as e:
        print(f"  ❌ Failed: {e}")
        return False


def main():
    ensure_folder(OUTPUT_IMAGE_FOLDER)

    print(f"Reading CSV: {INPUT_CSV}")
    df = pd.read_csv(INPUT_CSV)

    use_title = TITLE_COLUMN_NAME in df.columns

    new_urls = []

    for idx, row in df.iterrows():
        orig_url = str(row.get(IMAGE_COLUMN_NAME, "")).strip()

        if not orig_url or orig_url.lower() == "nan":
            new_urls.append(orig_url)
            continue

        print("\n----------------------------")
        print(f"Row {idx}")
        print(f"Original URL: {orig_url}")

        # Build filename
        if use_title:
            title = str(row.get(TITLE_COLUMN_NAME, "")).strip()
            base_name = slugify(title)[:70] if title else f"image-{idx}"
        else:
            base_name = f"image-{idx}"

        # Inspect headers to guess extension
        file_id = extract_drive_file_id(orig_url)
        test_url = build_drive_download_url(file_id) if file_id else orig_url

        try:
            head_resp = requests.get(test_url, stream=True, timeout=20)
            head_resp.raise_for_status()
            ext = guess_extension_from_headers(head_resp.headers)
            head_resp.close()
        except Exception:
            ext = ".jpg"

        final_filename = f"{base_name}{ext}"
        final_path = os.path.join(OUTPUT_IMAGE_FOLDER, final_filename)

        # Download
        success = download_image(orig_url, final_path)

        if success:
            image_url = f"{SITE_IMAGE_BASE_URL}/{final_filename}"
            new_urls.append(image_url)
            print(f"  👉 New URL: {image_url}")
        else:
            new_urls.append(orig_url)
            print("  ⚠️ Using original URL (download failed).")

    df[IMAGE_COLUMN_NAME] = new_urls
    df.to_csv(OUTPUT_CSV, index=False, quoting=csv.QUOTE_ALL)

    print("\n====================================")
    print(f"✅ Finished! New CSV: {OUTPUT_CSV}")
    print("📂 Images downloaded into /output_images/")
    print("Next:")
    print("1. Move everything in 'output_images/' into your React project's 'public/story-images/'")
    print("2. Commit + push to GitHub")
    print("3. Replace the Google Sheet column with the URLs from 'bracelet_content_migrated.csv'")
    print("4. All images now load from your site — no more Google Drive issues.")
    print("====================================")


if __name__ == "__main__":
    main()
