import cv2
import numpy as np
import onnxruntime as ort


class FontDNA:

    def __init__(self, model_path):

        self.session = ort.InferenceSession(model_path)

        self.input_name = self.session.get_inputs()[0].name

        print("Input:", self.input_name)
        print("Outputs:", [
            output.name
            for output in self.session.get_outputs()
        ])
    def preprocess(self, image):
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Original dimensions
        h, w = gray.shape

        # Resize to height 40 while preserving aspect ratio
        new_height = 40
        new_width = int(w * (new_height / h))

        # Width must be a multiple of 8
        new_width = max(8, ((new_width + 7) // 8) * 8)

        # Maximum width is 320
        new_width = min(new_width, 320)

        resized = cv2.resize(
            gray,
            (new_width, new_height),
            interpolation=cv2.INTER_AREA
        )

        # Convert to float32 and scale [0,255] -> [0,1]
        img = resized.astype(np.float32) / 255.0

        # Normalize using the crop's own statistics
        mean = img.mean()
        std = img.std()

        img = (img - mean) / (std + 1e-4)

        # Add channel dimension
        # (40, width) -> (1, 40, width)
        img = np.expand_dims(img, axis=0)

        # Add batch dimension
        # (1, 40, width) -> (1, 1, 40, width)
        img = np.expand_dims(img, axis=0)

        # cols = real width / 8
        cols = np.array(
            [new_width // 8],
            dtype=np.int64
        )

        return img, cols

    def analyze(self, image):
        img, cols = self.preprocess(image)
        outputs = self.session.run(
        None,
        {
            "img": img,
            "cols": cols
        }
        )

        return outputs

analyzer = FontDNA(
    "models/glyphdna.onnx"
)
print("\nINPUTS")
for inp in analyzer.session.get_inputs():
    print("Name:", inp.name)
    print("Shape:", inp.shape)
    print("Type:", inp.type)

print("\nOUTPUTS")
for out in analyzer.session.get_outputs():
    print("Name:", out.name)
    print("Shape:", out.shape)
    print("Type:", out.type)

image = cv2.imread("reference/surname.png")

outputs = analyzer.analyze(image)

print("\nNumber of outputs:", len(outputs))

for output in outputs:
    print(output.shape)