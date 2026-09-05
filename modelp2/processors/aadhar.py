import torch
from ocr_engine import run_ocr

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

# image tampering - deepfake/copy-paste
# ELA - detects difference in JPEG compression levels
# face forgery - checking the face quality / liveness detector or CNN
# classifier for font uniformity - fake onces mix arial and calibri

