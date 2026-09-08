from paddleocr import PaddleOCR

ocr = PaddleOCR(
    lang="hi"
)

def run_ocr(image_path):
 
    results = ocr.predict(image_path)

    output = []
   
    id = 0
    for result in results:
        
        texts = result["rec_texts"]
        scores = result["rec_scores"]
        boxes = result["rec_polys"]

        for text, score, box in zip(texts, scores, boxes):

            output.append({
                "id":id,
                "text": text,
                "confidence": float(score),
                "box": box.tolist()
            })
            id += 1

    return output