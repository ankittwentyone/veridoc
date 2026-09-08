from modelp2.ocr.ocr_engine import run_ocr

#visual fields
front_labels = {
    "name":None,
    "date_of_birth":None,
    "gender":None,
    "aadhar_number":None,
    "aadhar_number_issued_date":None,
    "checksum_aadharno":None,
}

#Mathematics related checker
back_labels = {
    "address":None,
    "all_details_date":None,
    "aadhar_number":None
}

front = "/Users/ailab/Documents/GitHub/veridoc/testingdata/aadhar1.png"
back = "/Users/ailab/Documents/GitHub/veridoc/testingdata/aadhar2.png"

result1 = run_ocr(front)
result2 = run_ocr(back)

for _ in result1:
    print(_)
    print("\n")

for _ in result2:
    print(_)
    print("\n")




# image tampering - deepfake/copy-paste
# ELA - detects difference in JPEG compression levels
# face forgery - checking the face quality / liveness detector or CNN
# classifier for font uniformity - fake onces mix arial and calibri

