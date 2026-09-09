import cv2
import numpy as np

from modelp2.ocr.ocr_engine import run_ocr
from font_checker.font_analyzer import FontDNA

font_analyzer = FontDNA(
    "font_checker/models/glyphdna.onnx"
)


# visual fields

vf_label = {
    "document_type": None,
    "issuing_country": None,
    "passport_number": None,
    "surname": None,
    "given_name": None,
    "date_of_birth": None,
    "place_of_birth": None,
    "place_of_issue": None,
    "date_of_issue": None,
    "date_of_expiry": None,
    "sex": None,
    "nationality": None,
}


# MRZ line 1

Line1_labels = {
    "document_code": None,
    "issuing_country": None,
    "name": None,
    "surname": None
}


# MRZ line 2

Line2_labels = {
    "passport_number": None,
    "passport_number_check_digit": None,
    "nationality": None,
    "birth_date": None,
    "birth_date_check_digit": None,
    "gender_sex": None,
    "expiration_date": None,
    "expiration_date_check_digit": None,
    "o&_pID": None,
    "o&_pID_check_digit": None,
    "overall_check_digit": None,
}


#font results - 

font_results = {
    "surname": None,
    "given_name": None,
    "passport_number": None,
    "date_of_birth": None,
    "date_of_expiry": None,
}


# MRZ - digit

def char_value(char):

    if char.isdigit():
        return int(char)

    if 'A' <= char <= 'Z':
        return ord(char) - ord('A') + 10

    if char == '<':
        return 0

    raise ValueError(
        f"Invalid MRZ character: {char}"
    )


def calculate_check_digit(data):

    weights = [7, 3, 1]

    total = 0

    for i, char in enumerate(data):

        value = char_value(char)

        weight = weights[i % 3]

        total += value * weight

    return total % 10


# Crop OCR box

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


#OCR extraction + validation checker

def value_checks(results, image):

    dob = None
    doe = None

    text1 = None

    reverseddate = None
    reversedexpdate = None


    #OCR - extraction

    for item in results:

        #document type

        if item["id"] == 4:

            text_1 = item["text"]

            vf_label["document_type"] = (
                text_1.upper()
            )


        #nationality and issuing country

        if item["id"] == 5:

            vf_label["nationality"] = (
                item["text"].upper()
            )

            vf_label["issuing_country"] = (
                item["text"].upper()
            )


        #passport number

        if item["id"] == 7:

            vf_label["passport_number"] = (
                item["text"].upper()
            )

            # FontDNA - passport number
            font_results["passport_number"] = analyze_font(
                image,
                item["box"]
            )


        #surname

        if item["id"] == 8:

            vf_label["surname"] = (
                item["text"].upper()
            )

            # FontDNA - surname
            font_results["surname"] = analyze_font(
                image,
                item["box"]
            )


        #name
        if item["id"] == 9:

            vf_label["given_name"] = (
                item["text"].upper()
            )

        # FontDNA
            font_results["given_name"] = analyze_font(
                image,
                item["box"]
            )
   
        #date of birth
    
        if item["id"] == 10:

            temp = item["text"]

            vf_label["date_of_birth"] = (
                item["text"]
            )

            temp1 = temp.split('/')

            dob = (
                temp1[2][-2:]
                + temp1[1]
                + temp1[0]
            )

            # FontDNA - dob
            font_results["date_of_birth"] = analyze_font(
                image,
                item["box"]
            )

    #sex    

        if item["id"] == 12:

            vf_label["sex"] = (
                item["text"].upper()
            )


    #place of birth

        if item["id"] == 13:

            vf_label["place_of_birth"] = (
                item["text"]
            )


    #place of issue

        if item["id"] == 14:

            vf_label["place_of_issue"] = (
                item["text"]
            )


    #date of issue

        if item["id"] == 17:

            vf_label["date_of_issue"] = (
                item["text"]
            )


        

        if item["id"] == 18:

            vf_label["date_of_expiry"] = (
                item["text"]
            )

            text = item["text"]

            temp1 = text.split('/')

            doe = (
                temp1[2][-2:]
                + temp1[1]
                + temp1[0]
            )

            # Fontextraction - doe
            font_results["date_of_expiry"] = analyze_font(
                image,
                item["box"]
            )

    #MRZ line 1

        if item["id"] == 21:

            text = item["text"]

            part1 = text[0]

            part2 = text[1]

            part3 = text[2:5]

            remaining = text[5:]

            surname_end = remaining.find("<<")

            surname = remaining[:surname_end]

            separator = remaining[
                surname_end:surname_end + 2
            ]

            remaining_after_separator = (
                remaining[surname_end + 2:]
            )

            name_end = (
                remaining_after_separator.find("<")
            )

            name = (
                remaining_after_separator[:name_end]
            )

            final = (
                remaining_after_separator[name_end:]
            )

            Line1_labels["document_code"] = part1

            Line1_labels["issuing_country"] = part3

            Line1_labels["surname"] = surname

            Line1_labels["name"] = name


    # MRZ line 2
    

        if item["id"] == 22:

            text1 = item["text"]

            # Passport number
            Line2_labels["passport_number"] = (
                text1[:9]
            )

            # Passport number check digit
            Line2_labels[
                "passport_number_check_digit"
            ] = int(text1[9])

            # Nationality
            Line2_labels["nationality"] = (
                text1[10:13]
            )

            # Birth date
            reverseddate = text1[13:19]

            Line2_labels["birth_date"] = (
                reverseddate
            )

            # Birth date check digit
            Line2_labels[
                "birth_date_check_digit"
            ] = int(text1[19])

            # Sex
            Line2_labels["gender_sex"] = (
                text1[20]
            )

            # Expiration date
            reversedexpdate = text1[21:27]

            Line2_labels["expiration_date"] = (
                reversedexpdate
            )

            # Expiration date check digit
            Line2_labels[
                "expiration_date_check_digit"
            ] = int(text1[27])

            # Optional / personal number
            Line2_labels["o&_pID"] = (
                text1[28:42]
            )

            # Optional / personal number check digit
            Line2_labels[
                "o&_pID_check_digit"
            ] = int(text1[42])

            # Overall check digit
            Line2_labels[
                "overall_check_digit"
            ] = int(text1[43])


    # valid or not checker

    if (
        vf_label["document_type"]
        != Line1_labels["document_code"]
    ):

        return "document is fake"


    if dob != Line2_labels["birth_date"]:

        return "document is fake"


    if not (
        vf_label["issuing_country"]
        == Line1_labels["issuing_country"]

        and

        Line2_labels["nationality"]
        == Line1_labels["issuing_country"]
    ):

        return "document is fake"


    if (
        vf_label["passport_number"]
        != Line2_labels["passport_number"].rstrip("<")
    ):

        return "document is fake"


    if (
        vf_label["given_name"]
        != Line1_labels["name"]
    ):

        return "document is fake"


    if (
        vf_label["surname"]
        != Line1_labels["surname"]
    ):

        return "document is fake"


    if doe != Line2_labels["expiration_date"]:

        return "document is fake"


    if (
        vf_label["sex"]
        != Line2_labels["gender_sex"]
    ):

        return "document is fake"


    #checksum - passport,birth,expiry,o&pid

    if (
        Line2_labels["passport_number_check_digit"]
        != calculate_check_digit(text1[:9])
    ):

        return "document is fake"


    if (
        Line2_labels["birth_date_check_digit"]
        != calculate_check_digit(reverseddate)
    ):

        return "document is fake"


    if (
        Line2_labels["expiration_date_check_digit"]
        != calculate_check_digit(reversedexpdate)
    ):

        return "document is fake"


    if (
        Line2_labels["o&_pID_check_digit"]
        != calculate_check_digit(text1[28:42])
    ):

        return "document is fake"


    #checksum - overall digit

    composite = (
        text1[0:10]
        + text1[13:20]
        + text1[21:43]
    )

    if (
        Line2_labels["overall_check_digit"]
        != calculate_check_digit(composite)
    ):

        return "document is fake"


    return "document is not fake"


image_path = (
    "/Users/ailab/Documents/GitHub/veridoc/"
    "testingdata/p-test.png"
)


# Load original image
image = cv2.imread(image_path)

if image is None:

    raise FileNotFoundError(
        f"Could not load image: {image_path}"
    )


#ocr

result = run_ocr(image_path)


# Print OCR results

for item in result:

    print(item)
    print("\n")

# results for value checks

print(
    value_checks(
        result,
        image
    )
)

# extracted information output

print("\nVISUAL FIELDS")
print(vf_label)

print("\nMRZ LINE 1")
print(Line1_labels)

print("\nMRZ LINE 2")
print(Line2_labels)


# font DNA result

print("\nFONT DNA RESULTS")

for field, data in font_results.items():

    print("\n")
    print("FIELD:", field)

    if data is None:

        print("No FontDNA result")

        continue

    print(
        "Embedding shape:",
        data["embedding"].shape
    )

    print(
        "Confidence:",
        data["confidence"]
    )

    print(
        "Style:",
        data["style"]
    )

    print(
        "Category:",
        data["category"]
    )

    print(
        "Script:",
        data["script"]
    )