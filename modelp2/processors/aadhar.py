import cv2
import numpy as np
from modelp2.ocr.ocr_engine import run_ocr
from modelp2.font_checker.font_analyzer import FontDNA

font_analyzer = FontDNA(
    "modelp2/font_checker/models/glyphdna.onnx"
)

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

# font labels

front_font_labels = {
    "name": None,
    "date_of_birth": None,
    "gender": None,
    "aadhar_number": None,
    "aadhar_number_issued_date": None,
}

back_font_labels = {
    "address": None,
    "all_details_date": None,
    "aadhar_number": None,
}

#for ocr - crop box

def crop_box(image, box):

    x_coordinates = [
        point[0]
        for point in box
    ]

    y_coordinates = [
        point[1]
        for point in box
    ]

    x1 = int(min(x_coordinates))
    y1 = int(min(y_coordinates))

    x2 = int(max(x_coordinates))
    y2 = int(max(y_coordinates))

    # Keep coordinates inside image

    height, width = image.shape[:2]

    x1 = max(0, x1)
    y1 = max(0, y1)

    x2 = min(width, x2)
    y2 = min(height, y2)

    return image[y1:y2, x1:x2]


#FONT - DNA 

def analyze_font(image, box):

    crop = crop_box(
        image,
        box
    )

    # Check that crop is valid

    if crop.size == 0:

        return None

    outputs = font_analyzer.analyze(
        crop
    )

    # FontDNA outputs
    # outputs[0] -> embedding
    # outputs[1] -> style
    # outputs[2] -> category
    # outputs[3] -> confidence
    # outputs[4] -> script

    embedding = outputs[0][0]

    style = outputs[1][0]

    category = outputs[2][0]

    confidence = outputs[3][0]

    script = outputs[4][0]

    return {
        "embedding": embedding,
        "style": style,
        "category": category,
        "confidence": confidence,
        "script": script
    }

#loading front and back images to fontDNA

front = "/Users/ailab/Documents/GitHub/veridoc/testingdata/aadhar1.png"
back = "/Users/ailab/Documents/GitHub/veridoc/testingdata/aadhar2.png"

front_image = cv2.imread(front)
back_image = cv2.imread(back)

if front_image is None:
    raise FileNotFoundError(
        f"Could not load front image: {front}"
    )


if back_image is None:
    raise FileNotFoundError(
        f"Could not load back image: {back}"
    )

result1 = run_ocr(front)
result2 = run_ocr(back)

# Print OCR results

for item in result1:

    print(item)
    print("\n")

for item in result2:

    print(item)
    print("\n")

# results for value checks
#value_checks(result1, front_image)
#value_checks(result2, back_image)

# font DNA result
front_font_results = []
back_font_results = []

#front
print("\nfont dna front results")

for item in result1:

    text = item.get("text", "")
    box = item.get("box")

    if not text or not box:
        continue

    font_data = analyze_font(
        front_image,
        box
    )

    if font_data is None:
        continue

    front_font_results.append({
        "text": text,
        "box": box,
        "embedding": font_data["embedding"],
        "style": font_data["style"],
        "category": font_data["category"],
        "confidence": font_data["confidence"],
        "script": font_data["script"]
    })

    print("\nTEXT:", text)

    print(
        "Embedding shape:",
        font_data["embedding"].shape
    )

    print(
        "Confidence:",
        font_data["confidence"]
    )

    print(
        "Style:",
        font_data["style"]
    )

    print(
        "Category:",
        font_data["category"]
    )

    print(
        "Script:",
        font_data["script"]
    )

#back
print("fontDNA results back")

for item in result2:

    text = item.get("text", "")
    box = item.get("box")

    if not text or not box:
        continue

    font_data = analyze_font(
        back_image,
        box
    )

    if font_data is None:
        continue

    back_font_results.append({
        "text": text,
        "box": box,
        "embedding": font_data["embedding"],
        "style": font_data["style"],
        "category": font_data["category"],
        "confidence": font_data["confidence"],
        "script": font_data["script"]
    })

    print("\nTEXT:", text)

    print(
        "Embedding shape:",
        font_data["embedding"].shape
    )

    print(
        "Confidence:",
        font_data["confidence"]
    )

    print(
        "Style:",
        font_data["style"]
    )

    print(
        "Category:",
        font_data["category"]
    )

    print(
        "Script:",
        font_data["script"]
    )



# image tampering - deepfake/copy-paste
# ELA - detects difference in JPEG compression levels
# face forgery - checking the face quality / liveness detector or CNN
# classifier for font uniformity - fake onces mix arial and calibri

