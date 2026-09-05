from modelp2.ocr.ocr_engine import run_ocr

document_fake = True

label1 = {
    "pancard_no": None,
    "name": None,
    "fathers_name": None,
    "gradfather_name":None,
    "surname":None,
    "date_of_birth": None,
}

#important id's -
# id - 8,11,13,15,16
def value_checks(results):
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
        
    
    print(fml1,fml2,surname1,surname2,dob1,dob2)

    if father_name1 == father_name2 and surname1 == surname2:
        label1["fathers_name"] = father_name1
        label1["surname"] = surname1
    else:
        document_fake = True

    if dob1 == dob2 :
        label1["date_of_birth"] = dob1
    else:
        document_fake = True
    
    print(label1)

    for _ in label1:
        if _ == None or document_fake == True:
            return("document is fake")
        elif _ != None and document_fake == False:
            return("document is not fake")

    


image_path = "/Users/ailab/Documents/GitHub/veridoc/modelp2/pan_test.webp"
result = run_ocr(image_path)
for _ in result:
    print(_)
    print("\n")


print(normal_checks(result))
