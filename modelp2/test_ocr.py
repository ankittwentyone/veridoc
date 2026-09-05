from ocr.ocr_engine import run_ocr


image_path = "pan_test.webp"

result = run_ocr(image_path)
for _ in result:
    print(_)
    print("\n")
