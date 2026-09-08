from ocr.ocr_engine import run_ocr


image_path = "p-test.png"

result = run_ocr(image_path)
for _ in result:
    print(_)
    print("\n")
