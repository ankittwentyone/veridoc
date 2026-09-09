import cv2

from modelp2.ocr.ocr_engine import run_ocr
from modelp2.font_checker.font_analyzer import FontDNA


font_analyzer = FontDNA(
    "modelp2/font_checker/models/glyphdna.onnx"
)


document_fake = False


label1 = {
    "pancard_no": None,
    "name": None,
    "fathers_name": None,
    "grandfather_name": None,
    "surname": None,
    "date_of_birth": None,
}


font_results = []


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

    height, width = image.shape[:2]

    x1 = max(0, x1)
    y1 = max(0, y1)

    x2 = min(width, x2)
    y2 = min(height, y2)

    return image[y1:y2, x1:x2]


def analyze_font(image, box):

    crop = crop_box(
        image,
        box
    )

    if crop.size == 0:
        return None

    outputs = font_analyzer.analyze(
        crop
    )

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


def value_checks(results):

    global document_fake

    for item in results:

        if item["id"] == 8:
            label1["pancard_no"] = item["text"]

        if item["id"] == 11:

            fml1 = item["text"].split()

            label1["name"] = fml1[0]

            father_name1 = fml1[1]

            surname1 = fml1[2]

        if item["id"] == 13:

            fml2 = item["text"].split()

            father_name2 = fml2[0]

            label1["grandfather_name"] = fml2[1]

            surname2 = fml2[2]

        if item["id"] == 15:
            dob1 = item["text"]

        if item["id"] == 17:

            dob = item["text"].split('/')

            dob2 = "".join(dob)

    print(
        fml1,
        fml2,
        surname1,
        surname2,
        dob1,
        dob2
    )

    if father_name1 == father_name2 and surname1 == surname2:

        label1["fathers_name"] = father_name1
        label1["surname"] = surname1

    else:

        document_fake = True

    if dob1 == dob2:

        label1["date_of_birth"] = dob1

    else:

        document_fake = True

    print(label1)

    for _ in label1:

        if label1[_] is None or document_fake:

            return "document is fake"

        elif label1[_] is not None and document_fake is False:

            return "document is not fake"


image_path = (
    "testingdata/pan_test.webp"
)


image = cv2.imread(image_path)


if image is None:

    raise FileNotFoundError(
        f"Could not load image: {image_path}"
    )


result = run_ocr(image_path)


print("\nPAN OCR RESULTS")

for item in result:

    print(item)
    print()


print("\nPAN VALIDATION")

print(
    value_checks(result)
)


print("\nPAN FONT DNA RESULTS")


for item in result:

    text = item.get("text", "")
    box = item.get("box")

    if not text or not box:
        continue

    font_data = analyze_font(
        image,
        box
    )

    if font_data is None:
        continue

    font_results.append({
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