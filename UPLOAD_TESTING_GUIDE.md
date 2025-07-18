# 🧪 SpendWise-All Upload Testing Guide

## Overview
This guide will help you test the bank statement upload functionality in your SpendWise-All platform.

## Prerequisites
1. **Complete SAAS Flow**: Ensure you've completed authentication, plan selection, and profile setup
2. **Active Plan**: Have an active subscription (any Tamil plan works)
3. **Test Files**: Use the provided sample files or create your own

## 🚀 Step-by-Step Testing Process

### 1. Access Upload Page
```
Dashboard → "Upload Statements" card → /transactions/upload
```

### 2. Upload Interface Features
- **Drag & Drop**: Drag Excel files directly onto the upload area
- **File Browser**: Click to select files from your computer
- **File Validation**: Automatic validation of file format and size
- **Plan Restrictions**: Different file types based on your plan

### 3. Plan-Based File Support
| Plan | File Types | Monthly Limit |
|------|------------|---------------|
| Aarambam (Free) | Excel only | 3 statements |
| Kudumbam (₹299) | Excel only | Unlimited |
| Valarchi (₹599) | PDF + Excel | Unlimited |
| Vetri (₹1299) | PDF + Excel | Unlimited |

## 📁 Test Files Available

### Sample Bank Statements
1. **SBI Format**: `test-files/sample-sbi-statement.csv`
2. **HDFC Format**: `test-files/sample-hdfc-statement.csv`

### Creating Excel Test Files
Convert the CSV files to Excel format:
1. Open CSV in Excel/Google Sheets
2. Save as `.xlsx` format
3. Upload to test the system

## 🔍 Testing Scenarios

### Scenario 1: Successful Upload
1. **File**: Use sample SBI or HDFC statement
2. **Expected**: 
   - File validation passes
   - Processing progress bar appears
   - AI categorization runs
   - Results show processed transactions
   - Save to database option appears

### Scenario 2: File Format Validation
1. **Test**: Upload non-Excel file (e.g., .txt, .pdf on free plan)
2. **Expected**: Validation error message

### Scenario 3: File Size Validation
1. **Test**: Upload file > 10MB
2. **Expected**: Size limit error

### Scenario 4: Plan Restrictions
1. **Test**: Upload PDF on Aarambam (free) plan
2. **Expected**: Plan upgrade prompt

### Scenario 5: Processing Results
After successful processing, verify:
- **Transaction Count**: Matches uploaded data
- **AI Categorization**: Transactions have categories
- **Bank Detection**: Correct bank identified
- **Amount Formatting**: Proper currency display

## 🎯 Key Features to Test

### Upload Component (`XlsUpload.tsx`)
- [x] Drag & drop functionality
- [x] File validation (format, size)
- [x] Processing progress indicator
- [x] Results display with transaction preview
- [x] Save to database functionality
- [x] Supported banks list

### Processing Hook (`useXlsProcessing.ts`)
- [x] File processing with progress updates
- [x] AI categorization integration
- [x] Database saving functionality
- [x] Error handling and validation

### Upload Page (`TransactionUpload.tsx`)
- [x] Three-tab interface (Upload, History, Analytics)
- [x] Plan-based restrictions display
- [x] Recent uploads tracking
- [x] Transaction history view
- [x] Analytics dashboard

## 🔧 Debugging Tips

### Check Browser Console
Look for:
- File processing logs
- API call responses
- Error messages
- Progress updates

### Database Verification
After upload, check:
- `transactions` table for new records
- `xls_processing_logs` table for processing history
- User-specific data filtering

### Common Issues
1. **File Not Processing**: Check file format and size
2. **No Categories**: Verify AI categorization service
3. **Save Failed**: Check database connection and user authentication
4. **Plan Restrictions**: Verify user's current subscription plan

## 📊 Expected Results

### Successful Processing Shows:
- Total transactions processed
- Success/failure counts
- Processing time
- Bank information detected
- Transaction preview with categories
- Save to database option

### Analytics Tab Shows:
- Total transaction count
- Credit/debit breakdown
- Category-wise spending
- Net inflow/outflow

### History Tab Shows:
- Recent upload results
- All processed transactions
- Transaction details with confidence scores

## 🚨 Error Scenarios to Test

1. **Invalid File Format**: Upload .txt or .doc file
2. **Corrupted Excel**: Upload damaged Excel file
3. **Empty File**: Upload Excel with no data
4. **Wrong Bank Format**: Upload unsupported bank format
5. **Network Issues**: Test with poor connectivity

## ✅ Success Criteria

Upload functionality is working correctly if:
- [x] Files upload without errors
- [x] Processing completes successfully
- [x] AI categorization assigns categories
- [x] Transactions save to database
- [x] History and analytics update
- [x] Plan restrictions work properly
- [x] Error handling is graceful

## 🔄 Next Steps After Testing

1. **Payment Integration**: Test with Razorpay for paid plans
2. **Family Features**: Test multi-user upload permissions
3. **Usage Limits**: Test monthly statement limits
4. **PDF Processing**: Test PDF uploads on premium plans
5. **Mobile Testing**: Test upload on mobile devices

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify your plan and permissions
3. Try with different file formats
4. Contact support with specific error messages

---

**Happy Testing! 🎉**

Your SpendWise-All platform is ready for comprehensive upload testing with AI-powered transaction categorization and family-friendly financial management.