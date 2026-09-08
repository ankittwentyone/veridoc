from modelp2.ocr.ocr_engine import run_ocr

#visual fields
vs = {
    "name":None,
    "date_of_birth":None,
    "gender":None,
    "address":None,
    "aadhar_number":None,
}

#Mathematics related checker
labels1 = {
    "aadhar_number":None,
    "checksum_aadharno":None,
}


    
image_path1 = "/Users/ailab/Documents/GitHub/veridoc/modelp2/aadhar1.png"
image_path2 = "/Users/ailab/Documents/GitHub/veridoc/modelp2/aadhar2.png"
result1 = run_ocr(image_path1)
result2 = run_ocr(image_path2)
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

