#!/usr/bin/env python
"""Quick E2E tests without unicode characters"""
import requests
import json
from PIL import Image
import io

BASE_URL = "http://127.0.0.1:8000"
results = []

print("=" * 70)
print("TRUTHSHIELD E2E TEST SUITE - FINAL VERIFICATION")
print("=" * 70)

# Test 1: Health
print("\n[Test 1] Health Endpoint")
try:
    resp = requests.get(f"{BASE_URL}/health")
    if resp.status_code == 200:
        print("PASS - Health check OK")
        results.append(True)
    else:
        print("FAIL - Health check failed")
        results.append(False)
except Exception as e:
    print(f"FAIL - {str(e)}")
    results.append(False)

# Test 2: Auth
print("\n[Test 2] Authentication")
try:
    token_resp = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": "demo@truthshield.ai", "password": "Demo@12345"},
    )
    if token_resp.status_code == 200:
        token = token_resp.json()["access_token"]
        print("PASS - Login successful, token acquired")
        results.append(True)
    else:
        print("FAIL - Login failed")
        results.append(False)
except Exception as e:
    print(f"FAIL - {str(e)}")
    results.append(False)

headers = {"Authorization": f"Bearer {token}"}

# Test 3: Fake-News
print("\n[Test 3] Fake-News Analyzer")
try:
    payload = {
        "title": "Test",
        "text": "Test content",
        "source_url": "https://example.com",
        "language": "en",
    }
    resp = requests.post(f"{BASE_URL}/api/fakenews/analyze", json=payload, headers=headers)
    if resp.status_code == 200:
        result = resp.json()
        label = result.get("label")
        risk = result.get("risk_score")
        print(f"PASS - Fake-news analysis: label={label}, risk={risk}")
        results.append(True)
    else:
        print(f"FAIL - Fake-news returned {resp.status_code}")
        results.append(False)
except Exception as e:
    print(f"FAIL - {str(e)}")
    results.append(False)

# Test 4: Deepfake Image
print("\n[Test 4] Deepfake Image Analyzer")
try:
    img = Image.new("RGB", (100, 100), color="red")
    img_bytes = io.BytesIO()
    img.save(img_bytes, format="PNG")
    img_bytes.seek(0)
    files = {"file": ("test.png", img_bytes, "image/png")}
    resp = requests.post(f"{BASE_URL}/api/deepfake/image", files=files, headers=headers)
    if resp.status_code == 200:
        result = resp.json()
        label = result.get("label")
        risk = result.get("risk_score")
        print(f"PASS - Deepfake analysis: label={label}, risk={risk}")
        results.append(True)
    else:
        print(f"FAIL - Deepfake returned {resp.status_code}")
        results.append(False)
except Exception as e:
    print(f"FAIL - {str(e)}")
    results.append(False)

# Test 5: History
print("\n[Test 5] History Endpoint")
try:
    resp = requests.get(f"{BASE_URL}/api/history", headers=headers)
    if resp.status_code == 200:
        scans = len(resp.json()["items"])
        print(f"PASS - History retrieved {scans} scans")
        results.append(True)
    else:
        print(f"FAIL - History returned {resp.status_code}")
        results.append(False)
except Exception as e:
    print(f"FAIL - {str(e)}")
    results.append(False)

# Test 6: Admin Stats
print("\n[Test 6] Admin Stats")
try:
    resp = requests.get(f"{BASE_URL}/api/admin/stats", headers=headers)
    if resp.status_code == 200:
        stats = resp.json()
        users = stats.get("total_users", 0)
        scans = stats.get("total_scans", 0)
        print(f"PASS - Admin stats: {users} users, {scans} scans")
        results.append(True)
    else:
        print(f"FAIL - Admin stats returned {resp.status_code}")
        results.append(False)
except Exception as e:
    print(f"FAIL - {str(e)}")
    results.append(False)

print("\n" + "=" * 70)
passed = sum(results)
total = len(results)
print(f"RESULT: {passed}/{total} TESTS PASSED")
if passed == total:
    print("SUCCESS - ALL SYSTEMS OPERATIONAL")
else:
    print(f"FAILURE - {total - passed} test(s) failed")
print("=" * 70)
