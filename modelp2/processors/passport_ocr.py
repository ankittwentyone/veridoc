from modelp2.ocr.ocr_engine import run_ocr

#visual fields:
vf_label = {
    "document_type":None,
    "issuing_country":None,
    "passport_number":None,
    "surname":None,
    "given_name":None,
    "date_of_birth":None,
    "place_of_birth":None,
    "place_of_issue":None,
    "date_of_issue":None,
    "date_of_expiry":None,
    "sex":None,
    "nationality":None,
    
}

#MRZ

#Line 1 focuses on document type, issuing country, and the passport holder's name.
#example line 1 :P<UTOERIKSSON<<ERIKA<<<<<<<<<<<<<<<<<<<<<<<<<

Line1_labels = {
	"document_code":None,
    "issuing_country":None,
    "name":None,
    "surname":None
}


#Line 2 contains passport numbers, dates, nationality, and checksums used to verify data integrity.
#example line 2 : L898902C<3UTO6908061F9406236ZE184226B<<<<<14

Line2_labels = {
    "passport_number":None,
    "passport_number_check_digit":None,
    "nationality":None,
    "birth_date":None,
    "birth_date_check_digit":None,
    "gender_sex":None,
    "expiration_date":None,
    "expiration_date_check_digit":None,
    "o&_pID":None,
    "o&_pID_check_digit":None,
    "overall_check_digit":None,
}

#important id's -
# id - 7,8,9,10,12,13,14,15,17,18,21,22


def value_checks(results):
    sign1 = '>' 
    sign2 = '>'
    for item in results:
        if item["id"] == 4:
            text_1 = item["text"]
            vf_label["document_type"] = text_1.upper()

        if item["id"] == 5:
            vf_label["nationality"] = item["text"]
            vf_label["issuing_country"] = item["text"]

        if item["id"] == 7:
            vf_label["passport_number"] = item["text"]
            
        if item["id"] == 8:
            vf_label["surname"] = item["text"]

        if item["id"] == 9:
            vf_label["given_name"] = item["text"]

        if item["id"] == 10:
            temp = item["text"]
            vf_label["date_of_birth"] = item["text"]
            temp1 = temp.split('/')
            dob = temp1[0] + temp1[1] + temp1[2][-2:]

        if item["id"] == 12:
            vf_label["sex"] = item["text"]

        if item["id"] == 13:
            vf_label["place_of_birth"] = item["text"]

        if item["id"] == 14:
            vf_label["place_of_issue"] = item["text"]

        if item["id"] == 17:
            vf_label["date_of_issue"] = item["text"]

        if item["id"] == 18:
            vf_label["date_of_expiry"] = item["text"]
            text = item["text"]
            temp1 = temp.split('/')
            doe = temp1[0] + temp1[1] + temp1[2][-2:]

        if item["id"] == 21:
            text = item["text"]

            part1 = text[0]          # P
            part2 = text[1]          # <
            part3 = text[2:5]        # Country

            remaining = text[5:]
            surname_end = remaining.find("<<")
            surname = remaining[:surname_end]
            separator = remaining[surname_end:surname_end + 2]
            remaining_after_separator = remaining[surname_end + 2:]
            name_end = remaining_after_separator.find("<")
            name = remaining_after_separator[:name_end] 
            final = remaining_after_separator[name_end:]

            Line1_labels["document_code"] = part1
            Line1_labels["issuing_country"] = part3
            Line1_labels["surname"] = surname
            Line1_labels["name"] = name

        if item["id"] == 22:
            text1 = item["text"]
            Line2_labels["passport_number"] = text1[:8]       # SP003369
            sign1 = text[8]        # <
            Line2_labels["passport_number_check_digit"] = text1[9]        # 2
            Line2_labels["nationality"] = text1[10:13]    #IND
            reverseddate = text1[13:19] 
            Line2_labels["birth_date"] =  reverseddate[::-1]  # 940701
            Line2_labels["birth_date_check_digit"] = text1[19]       # 5
            Line2_labels["gender_sex"] = text1[20]       # F
            reversedexpdate = text1[21:27]    
            Line2_labels["expiration_date"] = reversedexpdate[::-1] # 340902
            Line2_labels["expiration_date_check_digit"] = text1[27]       # 8
            Line2_labels["o&_pID"] = text1[28:41]    # 1065269546124
            sign2 = text1[42] #<
            Line2_labels["o&_pID_check_digit"] = text1[42]       # 7
            Line2_labels["overall_check_digit"] = text1[43]       # 8

        if sign1 == '>' and sign2 == '>':
            document_fake = False
        else:
            document_fake = True

#important to compare and check == label1[]
    if vf_label["document_type"] == Line1_labels["document_code"]:
        document_fake = False
    else:
        document_fake = True

    if dob == Line2_labels["birth_date"]:
        document_fake = False
    else:
        document_fake = True

    if vf_label["nationality"] == Line1_labels["issuing_country"] and vf_label == Line2_labels["nationality"]:
        document_fake = False
    else:
        document_fake = True

    if vf_label["passport_number"] == Line2_labels["passport_number"]:
        document_fake = False
    else:
        document_fake = True

    if vf_label["given_name"] == Line1_labels["name"]:
        document_fake = False
    else:
        document_fake = True

    if vf_label["surname"] == Line1_labels["surname"]:
        document_fake = False
    else:
        document_fake = True

    if doe == Line2_labels["expiration_date"]:
        document_fake = False
    else:
        document_fake = True

    if vf_label["sex"] == Line2_labels["gender_sex"]:
        document_fake = False
    else:
        document_fake = True

    for _ in vf_label,Line1_labels,Line2_labels:
        if _ == None or document_fake == True:
            return("document is fake")
        elif _ != None and document_fake == False:
            return("document is not fake")

image_path = "/Users/ailab/Documents/GitHub/veridoc/modelp2/p-test2.png"
result = run_ocr(image_path)
for _ in result:
    print(_)
    print("\n")


print(value_checks(result))
print(vf_label)
print("\n")
print(Line1_labels)
print("\n")
print(Line2_labels)



        
                    
            
                

