import cv2

image_path = "testingdata/pan.jpeg"

image = cv2.imread(image_path)

if image is None:
    print("Could not load image")
    exit()

height, width = image.shape[:2]

print("Image width:", width)
print("Image height:", height)