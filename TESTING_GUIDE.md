# Testing Guide - NGO Impact Tracker

## Step-by-Step Testing Instructions

### ✅ Step 1: Test Single Report Submission

1. **Click "GO TO FORM"** on the homepage
2. **Fill in the form:**
   - NGO ID: `NGO001`
   - Month: `2024-01`
   - People Helped: `150`
   - Events Conducted: `5`
   - Funds Utilized: `50000.00`
3. **Click "Submit Report"**
4. **Expected Result:** Green success message "Report submitted successfully!"

### ✅ Step 2: Test Dashboard (Verify Data Saved)

1. **Click "VIEW DASHBOARD"** on the homepage
2. **Enter month:** `2024-01`
3. **Click "Load Data"**
4. **Expected Result:** You should see:
   - Total NGOs Reporting: **1**
   - Total People Helped: **150**
   - Total Events Conducted: **5**
   - Total Funds Utilized: **₹50,000.00**

### ✅ Step 3: Test Bulk CSV Upload

1. **Click "UPLOAD CSV"** on the homepage
2. **Click "Select CSV File"**
3. **Select the file:** `sample_data.csv` (in project root)
4. **Click "Upload and Process"**
5. **Watch the progress:**
   - Status should change from "pending" → "processing" → "completed"
   - You'll see "Processed X of Y rows"
6. **Expected Result:** 
   - Status: "completed"
   - Successful rows: 7 (from sample_data.csv)
   - Failed rows: 0

### ✅ Step 4: Verify Bulk Upload Data in Dashboard

1. **Go back to Dashboard** (click "VIEW DASHBOARD")
2. **Enter month:** `2024-01`
3. **Click "Load Data"**
4. **Expected Result:** Updated totals:
   - Total NGOs Reporting: **3** (NGO001, NGO002, NGO003)
   - Total People Helped: **650** (150 + 200 + 300)
   - Total Events Conducted: **25** (5 + 8 + 12)
   - Total Funds Utilized: **₹245,000.00**

### ✅ Step 5: Test Idempotency (No Duplicates)

1. **Submit the same report again:**
   - Go to "Submit Report"
   - NGO ID: `NGO001`
   - Month: `2024-01`
   - People Helped: `200` (different value)
   - Events Conducted: `6`
   - Funds Utilized: `60000.00`
2. **Expected Result:** Report should update, not create duplicate
3. **Check Dashboard for 2024-01:**
   - Total People Helped should reflect the **new value** (200 instead of 150)
   - This proves idempotency works!

### ✅ Step 6: Test Error Handling

1. **Submit invalid data:**
   - Go to "Submit Report"
   - Month: `invalid` (wrong format)
   - Fill other fields
2. **Expected Result:** Error message showing validation error

## Quick API Tests (Optional)

You can also test directly via API:

### Test Dashboard API:
```
http://127.0.0.1:8000/api/dashboard?month=2024-01
```

### Test Submit Report (PowerShell):
```powershell
$body = @{
    ngo_id = "NGO002"
    month = "2024-02"
    people_helped = 200
    events_conducted = 8
    funds_utilized = 75000.00
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/report" -Method POST -Body $body -ContentType "application/json"
```

## What to Check:

✅ **Frontend is running** - You can see the homepage  
✅ **Backend is running** - API endpoints respond  
✅ **Database is working** - Data persists after submission  
✅ **CSV processing works** - Bulk upload processes files  
✅ **Dashboard aggregates** - Shows correct totals  
✅ **Idempotency works** - No duplicate reports  

## Troubleshooting

**If CSV upload shows "pending" forever:**
- Make sure Celery worker is running
- Make sure Redis is running

**If dashboard shows zeros:**
- Submit a report first
- Check the month format (YYYY-MM)

**If you get CORS errors:**
- Make sure backend is running on port 8000
- Check `NEXT_PUBLIC_API_URL` in frontend/.env.local

